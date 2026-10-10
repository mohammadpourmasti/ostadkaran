"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { appliances } from "@/data/appliances";
import { CenterAppliance } from "./center-appliance";
import { HintPanel } from "./hint-panel";
import { OrbitItem } from "./orbit-item";
import { focus, ITEM_SIZE, orbit, orbitNodes, orbitSlots, pctY, SCENE_H } from "./orbit-layout";

type ApplianceExplorerProps = {
  // Server-rendered technician, placed inside the orbit.
  technician: ReactNode;
};

// The hero opens with this appliance already at the centre, so the hint panel is never empty.
const DEFAULT_SELECTION: number | null = 0;

// A short hover intent, so sweeping the pointer across the orbit doesn't flick through every item.
const HOVER_DELAY_MS = 120;

// Radius of the centre showcase, in scene %.
const FOCUS_RADIUS = focus.size / 2;

// Connector from the selected orbit item to the centre showcase, in scene units.
function connectorGeometry(slot: { ux: number; uy: number }) {
  const dx = focus.x - slot.ux;
  const dy = focus.y - slot.uy;
  const length = Math.hypot(dx, dy);
  const [nx, ny] = [dx / length, dy / length];
  const start = ITEM_SIZE / 2 + 1.5;
  const end = length - FOCUS_RADIUS * 0.8;
  const x1 = slot.ux + nx * start;
  const y1 = slot.uy + ny * start;
  const x2 = slot.ux + nx * end;
  const y2 = slot.uy + ny * end;
  return { x1, y1, x2, y2 };
}

/*
 * The hero scene: a circular orbit of appliances around the technician. Hovering
 * (mouse), clicking/tapping or arrow keys select an appliance. Every appliance
 * always stays on its orbit slot; the selected one is additionally shown larger
 * at the centre (a separate render) and the hint panel shows its common problems.
 * Escape clears the selection.
 */
export function ApplianceExplorer({ technician }: ApplianceExplorerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(DEFAULT_SELECTION);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  function select(index: number | null) {
    clearTimeout(hoverTimer.current);
    setSelectedIndex(index);
  }

  // Roving focus. Left/Down move forward along the orbit (RTL), Right/Up move back.
  // Navigation starts from the focused item itself, so rapid key presses never use stale state.
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    const count = appliances.length;
    let next: number | null = null;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = (current + 1) % count;
        break;
      case "ArrowRight":
      case "ArrowUp":
        next = (current - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      case "Escape":
        if (selectedIndex !== null) {
          event.preventDefault();
          select(null);
        }
        return;
    }

    if (next === null) return;
    event.preventDefault();
    select(next);
    itemRefs.current[next]?.focus();
  }

  const selected = selectedIndex === null ? null : appliances[selectedIndex];
  const selectedSlot = selected ? orbitSlots[selected.id] : null;

  return (
    <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-center md:gap-6">
      <div
        className="@container relative mb-8 w-full max-w-[28rem] min-w-0 sm:max-w-[38rem] md:flex-1 md:translate-x-6 md:translate-y-8 lg:max-w-[49rem] xl:max-w-[55rem] xl:translate-x-24 xl:translate-y-20"
        style={{ aspectRatio: `100 / ${SCENE_H}` }}
      >
        {/* Atmosphere */}
        <div
          aria-hidden="true"
          className="absolute rounded-full bg-[radial-gradient(closest-side,rgb(20_184_166/0.1),transparent)]"
          style={{
            left: `${orbit.cx - orbit.r * 0.68}%`,
            top: `${pctY(orbit.cy - orbit.r * 0.68)}%`,
            width: `${orbit.r * 1.36}%`,
            height: `${pctY(orbit.r * 1.36)}%`,
          }}
        />

        {/* Orbit ring: one continuous teal hairline with a slow, faint glow pulse */}
        <svg aria-hidden="true" viewBox={`0 0 100 ${SCENE_H}`} className="absolute inset-0 size-full overflow-visible">
          <circle
            cx={orbit.cx}
            cy={orbit.cy}
            r={orbit.r}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            className="animate-orbit-glow"
          />
          {orbitNodes.map((node) => (
            <circle key={`${node.x}-${node.y}`} cx={node.x} cy={node.y} r="0.7" fill="var(--color-accent)" fillOpacity="0.85" />
          ))}
        </svg>

        {/* Technician works just outside the orbit, below the centre showcase */}
        <div className="absolute inset-0">{technician}</div>

        {/* Connector: the selected orbit item -> the centre showcase it is shown in */}
        {selectedSlot && (
          <svg
            key={selected?.id}
            aria-hidden="true"
            viewBox={`0 0 100 ${SCENE_H}`}
            className="pointer-events-none absolute inset-0 z-[5] size-full overflow-visible"
          >
            <line
              {...connectorGeometry(selectedSlot)}
              pathLength={1}
              strokeDasharray={1}
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="animate-draw"
            />
            <circle
              cx={connectorGeometry(selectedSlot).x2}
              cy={connectorGeometry(selectedSlot).y2}
              r="1"
              fill="var(--color-accent)"
              className="animate-reveal"
            />
          </svg>
        )}

        <div
          role="radiogroup"
          aria-label="انتخاب دستگاه برای دیدن مشکلات رایج"
          className="absolute inset-0"
        >
          {appliances.map((appliance, index) => (
            <OrbitItem
              key={appliance.id}
              appliance={appliance}
              slot={orbitSlots[appliance.id]}
              index={index}
              isSelected={index === selectedIndex}
              isMuted={selectedIndex !== null && index !== selectedIndex}
              isTabStop={index === (selectedIndex ?? 0)}
              buttonRef={(element) => {
                itemRefs.current[index] = element;
              }}
              onSelect={() => select(index)}
              onHoverStart={() => {
                clearTimeout(hoverTimer.current);
                hoverTimer.current = setTimeout(() => setSelectedIndex(index), HOVER_DELAY_MS);
              }}
              onHoverEnd={() => clearTimeout(hoverTimer.current)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            />
          ))}
        </div>

        {/* Centre showcase: its own render, above the technician */}
        {selected && selectedSlot && <CenterAppliance appliance={selected} zoom={selectedSlot.zoom} />}

        {/* Name of the selected appliance, just under it at the centre of the orbit */}
        {selected && (
          <div
            className="pointer-events-none absolute z-30 -translate-x-1/2"
            style={{ left: `${focus.x}%`, top: `${pctY(focus.y + FOCUS_RADIUS + 4.5)}%` }}
          >
            <p
              key={selected.id}
              className="animate-rise rounded-full border border-border bg-surface/90 px-3.5 py-1 text-sm font-semibold whitespace-nowrap text-foreground shadow-sm backdrop-blur-sm sm:text-[0.95rem]"
            >
              {selected.title}
            </p>
          </div>
        )}
      </div>

      {/* Hint panel: collapses on narrow screens, keeps its column (but hides) on wider ones */}
      <div
        inert={!selected}
        className={`grid w-full max-w-[26rem] transition-[grid-template-rows,opacity] duration-500 sm:max-w-[30rem] md:w-[16.5rem] md:max-w-none md:shrink-0 md:grid-rows-[1fr] ${
          selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 max-md:overflow-hidden max-md:pb-2">
          {selected && selectedSlot && <HintPanel appliance={selected} zoom={selectedSlot.zoom} />}
        </div>
      </div>
    </div>
  );
}
