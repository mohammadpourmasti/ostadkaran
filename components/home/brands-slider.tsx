"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Brand = { name: string; logo?: { src: string; width: number; height: number } };

// The page is right-to-left: the track starts at the right and "next" scrolls toward the left (negative offset).
export function BrandsSlider({ brands }: { brands: readonly Brand[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);

  function step(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const position = Math.abs(track.scrollLeft);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduce ? "auto" : "smooth";
    if (direction === 1 && position >= max - 4) {
      track.scrollTo({ left: 0, behavior });
    } else if (direction === -1 && position <= 4) {
      track.scrollTo({ left: -max, behavior });
    } else {
      track.scrollBy({ left: -direction * track.clientWidth * 0.8, behavior });
    }
  }

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => step(1), 3500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const arrow =
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-xl text-primary shadow-md hover:bg-surface sm:flex";

  return (
    <div
      className="relative mt-8"
      role="region"
      aria-roledescription="اسلایدر"
      aria-label="برندهای تحت پوشش"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand) => (
          <li
            key={brand.name}
            className="flex h-28 shrink-0 basis-[calc((100%-0.75rem)/2)] snap-start flex-col items-center justify-between rounded-xl border border-border bg-white px-3 pb-2.5 pt-3 sm:h-32 sm:basis-[calc((100%-2rem)/3)] sm:px-4 sm:pb-3 sm:pt-4 lg:basis-[calc((100%-5rem)/6)]"
          >
            <div className="flex h-12 w-full items-center justify-center sm:h-14">
              {brand.logo ? (
                <Image
                  src={brand.logo.src}
                  width={brand.logo.width}
                  height={brand.logo.height}
                  alt={`لوگوی ${brand.name}`}
                  sizes="144px"
                  className="h-auto max-h-full w-auto max-w-[8.5rem] object-contain"
                />
              ) : (
                <span aria-hidden="true" className="text-lg font-extrabold text-primary">
                  {brand.name}
                </span>
              )}
            </div>
            <span className="text-sm/6 font-bold text-foreground">{brand.name}</span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => step(1)} aria-label="برند بعدی" className={`${arrow} -right-3 lg:-right-5`}>
        ‹
      </button>
      <button type="button" onClick={() => step(-1)} aria-label="برند قبلی" className={`${arrow} -left-3 lg:-left-5`}>
        ›
      </button>
    </div>
  );
}
