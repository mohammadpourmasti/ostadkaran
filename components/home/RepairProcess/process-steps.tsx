"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { IconProps } from "@/components/icons/icon-base";
import { PhoneIcon, WrenchIcon } from "@/components/icons/ui-icons";
import { AppliancesIcon, TechnicianIcon, ToolsIcon } from "./process-icons";

type Step = {
  number: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  featured?: boolean;
};

// Listed in reading order 01 → 04; the desktop row is an RTL grid, so 01 sits on the right.
const steps: readonly Step[] = [
  {
    number: "01",
    title: "مشکل را بگو",
    description: "از طریق تماس مستقیم یا درخواست آنلاین.",
    icon: PhoneIcon,
  },
  {
    number: "02",
    title: "دستگاه را مشخص کن",
    description: "یخچال، لباسشویی، ظرفشویی و ...",
    icon: AppliancesIcon,
  },
  {
    number: "03",
    title: "استادکار مناسب",
    description: "درخواستت به مسیر مناسب تعمیر هدایت می‌شود.",
    icon: TechnicianIcon,
    featured: true,
  },
  {
    number: "04",
    title: "تعمیر دستگاه",
    description: "اعزام استادکار و انجام تعمیر با پیگیری.",
    icon: ToolsIcon,
  },
];

// The wrench rests on this step, and returns to it when the pointer leaves the steps (the featured step).
const RESTING_STEP = Math.max(
  0,
  0,
);

// Curve through the four icon centres (columns at 12.5 / 37.5 / 62.5 / 87.5 % of a 1000-wide box).
const connectorPath =
  "M1000 60 L875 60 C800 10 700 10 625 60 S450 110 375 60 S200 10 125 60 L0 60";
// Nodes sit on the curve midpoints: [x %, y %] of the connector box.
const nodes: readonly [number, number][] = [
  [25, 18.75],
  [50, 81.25],
  [75, 18.75],
];

// Desktop wrench geometry, in the connector's 1000 x 120 units. Step i's icon centre is at x = 875 - 250 * i (01 is
// on the right). The wrench rests on the curve REST_OFFSET units to the left of the icon, so it never covers the
// icon, its number or the text below the row.
const stopX = (index: number) => 875 - 250 * index;
const REST_OFFSET = 100;

/**
 * Smoothly moves a value toward the target of the active step (ease in-out), from wherever it currently is, so
 * changing step mid-move reverses or continues without a jump. With reduced motion it jumps straight there.
 */
function useTween(
  activeIndex: number,
  targetFor: (index: number) => number | null,
  apply: (value: number) => void,
  durationFor: (distance: number) => number,
) {
  const value = useRef<number | null>(null);
  const frame = useRef(0);
  const latest = useRef({ targetFor, apply, durationFor });

  useEffect(() => {
    latest.current = { targetFor, apply, durationFor };
  });

  useEffect(() => {
    const { targetFor: target, apply: draw, durationFor: duration } = latest.current;
    const to = target(activeIndex);
    if (to === null) return;

    const from = value.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cancelAnimationFrame(frame.current);

    if (from === null || reduceMotion || from === to) {
      value.current = to;
      draw(to);
      return;
    }

    const total = duration(Math.abs(to - from));
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / total);
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      value.current = from + (to - from) * eased;
      draw(value.current);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [activeIndex]);

  /** Jumps to the active step's target (used when the layout is resized). */
  function snap() {
    const { targetFor: target, apply: draw } = latest.current;
    const to = target(activeIndex);
    if (to === null) return;
    cancelAnimationFrame(frame.current);
    value.current = to;
    draw(to);
  }

  return { snap };
}

function StepIcon({ step, active }: { step: Step; active: boolean }) {
  const Icon = step.icon;
  return (
    <span
      className={`relative inline-flex shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
        active ? "scale-110" : ""
      }`}
    >
      {step.featured ? (
        <span className="flex size-20 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_0_8px_rgb(20_184_166/0.14),0_14px_36px_-6px_rgb(20_184_166/0.55)] ring-1 ring-accent/40 ring-offset-4 ring-offset-white/70 xl:size-24">
          <Icon className="size-9 xl:size-10" strokeWidth={1.4} />
        </span>
      ) : (
        <span
          className={`flex size-16 items-center justify-center rounded-full border bg-surface transition-[border-color,box-shadow,color] duration-300 motion-reduce:transition-none xl:size-[4.5rem] ${
            active
              ? "border-accent text-accent-strong shadow-[0_0_0_6px_rgb(20_184_166/0.12),0_14px_30px_-10px_rgb(20_184_166/0.5)]"
              : "border-border text-primary shadow-[0_10px_26px_-12px_rgb(15_76_129/0.35)]"
          }`}
        >
          <Icon className="size-7 xl:size-8" strokeWidth={1.4} />
        </span>
      )}
      <span
        dir="ltr"
        className={`absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm ${
          step.featured ? "bg-primary" : "bg-accent-strong"
        }`}
      >
        {step.number}
      </span>
    </span>
  );
}

function StepText({ step, active }: { step: Step; active: boolean }) {
  return (
    <div dir="rtl" className="min-w-0">
      <h3
        className={`text-base/7 font-bold transition-colors duration-300 motion-reduce:transition-none xl:text-lg/7 ${
          active ? "text-primary" : "text-foreground"
        }`}
      >
        {step.title}
      </h3>
      <p
        className={`mt-0.5 text-sm/6 font-medium transition-colors duration-300 motion-reduce:transition-none ${
          active ? "text-foreground/80" : "text-muted"
        }`}
      >
        {step.description}
      </p>
    </div>
  );
}

// The wrench token: a small round badge so it reads clearly on top of the connector.
const wrenchTokenClass =
  "pointer-events-none absolute z-10 flex size-10 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-[0_8px_18px_-6px_rgb(15_76_129/0.6)] ring-2 ring-white transition-opacity duration-300";

export function ProcessSteps() {
  const [active, setActive] = useState(RESTING_STEP);

  // ---- Desktop (xl+): the wrench rides the connector curve.
  const pathRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopWrench = useRef<HTMLSpanElement>(null);
  const stopLengths = useRef<number[] | null>(null);

  function desktopTarget(index: number): number | null {
    const path = pathRef.current;
    // Hidden (below xl) the curve cannot be measured; the observer below places the wrench once it is shown.
    if (!path || !trackRef.current || trackRef.current.offsetWidth === 0) return null;
    if (!stopLengths.current) {
      const total = path.getTotalLength();
      // The path is drawn from the right edge (step 01) to the left, so x shrinks along it; the wrench travels right to left. So a binary search finds the length where the curve reaches a given x.
      const lengthAtX = (x: number) => {
        let low = 0;
        let high = total;
        for (let i = 0; i < 24; i += 1) {
          const middle = (low + high) / 2;
          if (path.getPointAtLength(middle).x > x) low = middle;
          else high = middle;
        }
        return (low + high) / 2;
      };
      stopLengths.current = steps.map((_, i) => lengthAtX(stopX(i) - REST_OFFSET));
    }
    return stopLengths.current[index] ?? null;
  }

  function drawDesktop(length: number) {
    const path = pathRef.current;
    const wrench = desktopWrench.current;
    const track = trackRef.current;
    if (!path || !wrench || !track) return;
    const point = path.getPointAtLength(length);
    const ahead = path.getPointAtLength(length + 1);
    const box = track.getBoundingClientRect();
    // Tilt along the curve, measured in screen pixels (the SVG is stretched), kept gentle.
    const angle = Math.atan2(((ahead.y - point.y) * box.height) / 120, ((point.x - ahead.x) * box.width) / 1000);
    const tilt = Math.max(-35, Math.min(35, (angle * 180) / Math.PI));
    wrench.style.left = `${point.x / 10}%`;
    wrench.style.top = `${(point.y / 120) * 100}%`;
    wrench.style.transform = `translate(-50%, -50%) rotate(${-tilt}deg)`;
    wrench.style.opacity = "1";
  }

  const desktop = useTween(active, desktopTarget, drawDesktop, (distance) => 380 + Math.min(700, (distance / 1000) * 700));

  // ---- Mobile / tablet: the wrench slides down a lane beside the icons.
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const mobileWrench = useRef<HTMLSpanElement>(null);

  function mobileTarget(index: number): number | null {
    const item = itemRefs.current[index];
    if (!item || item.offsetHeight === 0) return null;
    return item.offsetTop + item.offsetHeight / 2;
  }

  function drawMobile(y: number) {
    const wrench = mobileWrench.current;
    if (!wrench) return;
    wrench.style.top = `${y}px`;
    wrench.style.opacity = "1";
  }

  const mobile = useTween(active, mobileTarget, drawMobile, (distance) => 320 + Math.min(500, distance * 1.4));

  // Re-place the wrenches when their layout is resized or becomes visible (text wrapping changes the mobile row
  // heights; the desktop track only has a size from xl up).
  const snaps = useRef({ mobile: mobile.snap, desktop: desktop.snap });
  useEffect(() => {
    snaps.current = { mobile: mobile.snap, desktop: desktop.snap };
  });
  useEffect(() => {
    const list = listRef.current;
    const track = trackRef.current;
    if (!list || !track) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === list) snaps.current.mobile();
        else snaps.current.desktop();
      }
    });
    observer.observe(list);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // The wrench starts at step 01 (right) and only moves when a step is hovered or touched, so it always travels
  // along the reading direction (right to left) or back; it never jumps back on its own when the pointer leaves.
  const activate = (index: number) => () => setActive(index);

  return (
    <>
      {/* Desktop: dir="rtl" makes the grid flow right to left, so 01 is on the right. The connector is mirror-symmetric, so it needs no change. */}
      <div dir="rtl" className="relative hidden xl:block">
        <div
          ref={trackRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[6.5rem]"
        >
          <svg
            className="size-full"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient
                id="process-line"
                x1="0"
                x2="1000"
                y1="0"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#0f4c81" stopOpacity="0.15" />
                <stop offset="0.5" stopColor="#14b8a6" />
                <stop offset="1" stopColor="#0f4c81" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              d={connectorPath}
              stroke="url(#process-line)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {nodes.map(([x, y]) => (
            <span
              key={x}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-white"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          ))}
          <span ref={desktopWrench} className={wrenchTokenClass}>
            <WrenchIcon className="size-6 [transform:scaleX(-1)_rotate(45deg)]" />
          </span>
        </div>
        <ol className="relative grid grid-cols-4">
          {steps.map((step, index) => {
            const isActive = index === active;
            return (
              <li
                key={step.number}
                onPointerEnter={activate(index)}
                onPointerDown={activate(index)}
                className="flex flex-col items-center text-center"
              >
                <span className="flex h-[6.5rem] items-center">
                  <StepIcon step={step} active={isActive} />
                </span>
                {step.featured ? (
                  <div
                    className={`mt-1 w-full max-w-60 rounded-2xl border bg-surface px-4 py-2.5 transition-[border-color,box-shadow] duration-300 motion-reduce:transition-none ${
                      isActive
                        ? "border-accent/60 shadow-[0_20px_44px_-18px_rgb(20_184_166/0.55)]"
                        : "border-border shadow-[0_18px_40px_-20px_rgb(15_76_129/0.4)]"
                    }`}
                  >
                    <StepText step={step} active={isActive} />
                  </div>
                ) : (
                  <div
                    className={`mt-2 max-w-60 rounded-2xl px-2 transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none ${
                      isActive ? "bg-white/70 shadow-[0_12px_28px_-18px_rgb(15_76_129/0.5)] ring-1 ring-accent/25" : ""
                    }`}
                  >
                    <StepText step={step} active={isActive} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile / tablet: a vertical timeline in 01 → 04 order, with a lane beside the icons for the wrench. */}
      <ol
        ref={listRef}
        className="relative mx-auto flex max-w-md flex-col gap-1.5 xl:hidden"
       
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-4 right-[6.75rem] w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent"
        />
        <span
          ref={mobileWrench}
          aria-hidden="true"
          className={`${wrenchTokenClass} right-[5.5rem] top-0 -translate-y-1/2`}
        >
          <WrenchIcon className="size-6 [transform:scaleX(-1)_rotate(45deg)]" />
        </span>
        {steps.map((step, index) => {
          const isActive = index === active;
          return (
            <li
              key={step.number}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              onPointerEnter={activate(index)}
              onPointerDown={activate(index)}
              className={`relative flex items-center gap-3 rounded-2xl p-2 transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none ${
                step.featured
                  ? "border border-accent/40 bg-surface shadow-[0_14px_34px_-20px_rgb(20_184_166/0.6)]"
                  : ""
              } ${isActive && !step.featured ? "bg-white/70 shadow-[0_12px_28px_-18px_rgb(15_76_129/0.5)] ring-1 ring-accent/25" : ""} ${
                isActive && step.featured ? "shadow-[0_18px_40px_-18px_rgb(20_184_166/0.75)]" : ""
              }`}
            >
              <span className="flex w-20 shrink-0 justify-center">
                <StepIcon step={step} active={isActive} />
              </span>
              <span aria-hidden="true" className="w-4 shrink-0" />
              <StepText step={step} active={isActive} />
            </li>
          );
        })}
      </ol>
    </>
  );
}
