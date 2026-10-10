import Image from "next/image";
import type { KeyboardEvent, Ref } from "react";
import type { Appliance } from "@/types/appliance";
import { ITEM_SIZE, type OrbitSlot } from "./orbit-layout";

type OrbitItemProps = {
  appliance: Appliance;
  slot: OrbitSlot;
  index: number;
  isSelected: boolean;
  // Another appliance is selected, so this one is slightly quieter.
  isMuted: boolean;
  isTabStop: boolean;
  buttonRef: Ref<HTMLButtonElement>;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

/*
 * One appliance on the orbit. It never leaves its slot: selection only changes
 * its styling (thicker teal ring, subtle lift); the larger centre render is a separate
 * component.
 */
export function OrbitItem({
  appliance,
  slot,
  index,
  isSelected,
  isMuted,
  isTabStop,
  buttonRef,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onKeyDown,
}: OrbitItemProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={appliance.title}
      tabIndex={isTabStop ? 0 : -1}
      onClick={onSelect}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onHoverStart();
      }}
      onPointerLeave={onHoverEnd}
      onKeyDown={onKeyDown}
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `max(2.75rem, ${ITEM_SIZE}%)` }}
      className={`group absolute aspect-square -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none ${
        isSelected ? "z-[11]" : "z-10"
      }`}
    >
      {/* Gentle idle float, staggered so the orbit never moves in lockstep */}
      <span className="absolute inset-0 animate-float" style={{ animationDelay: `${index * -0.8}s` }}>
        {/* The appliance's ring: barely there at rest, teal when hovered or selected */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full border transition duration-300 group-focus-visible:ring-2 group-focus-visible:ring-accent/40 ${
            isSelected
              ? "scale-105 border-[2.5px] border-accent bg-surface shadow-[0_8px_20px_-10px_rgb(13_148_136/0.6)]"
              : "border-primary/10 bg-surface/70 group-hover:scale-105 group-hover:border-accent group-hover:bg-surface"
          }`}
        />
        <span
          className={`absolute inset-[13%] transition duration-300 ${
            isMuted ? "opacity-75 group-hover:opacity-100" : ""
          } ${isSelected ? "scale-105" : "group-hover:scale-105"}`}
        >
          <Image
            src={appliance.image.src}
            alt=""
            fill
            sizes="(min-width: 768px) 140px, 100px"
            className="object-contain"
            style={{ scale: slot.zoom }}
          />
        </span>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 font-medium whitespace-nowrap transition-colors duration-300 ${
            slot.labelAbove ? "bottom-full mb-[2%]" : "top-full mt-[2%]"
          } ${isSelected ? "text-primary" : "text-foreground/60 group-hover:text-foreground"}`}
          style={{ fontSize: "clamp(0.6rem, 2.7cqw, 0.75rem)" }}
        >
          {appliance.title}
        </span>
      </span>
    </button>
  );
}
