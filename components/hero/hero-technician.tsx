import Image from "next/image";
import { technicianBox } from "./orbit-layout";

const FILTER_ID = "technician-cutout";

const boxStyle = {
  left: `${technicianBox.left}%`,
  top: `${technicianBox.top}%`,
  width: `${technicianBox.width}%`,
};

const imageProps = {
  src: "/images/hero/technician.png",
  width: 1536,
  height: 1024,
  sizes: "(min-width: 768px) 460px, 86vw",
  loading: "eager",
  fetchPriority: "high",
} as const;

/*
 * The supplied photo has no alpha channel (a light baked-in background). Until a
 * transparent export exists, an SVG luminance mask hides only that light
 * background; the technician's own pixels are untouched. The shirt logo is white,
 * so an unmasked copy is clipped to exactly that region to keep it intact.
 * With a transparent asset, drop the filter and the logo copy.
 */
export function HeroTechnician() {
  return (
    <div className="pointer-events-none absolute isolate select-none md:-translate-y-2 xl:-translate-y-4" style={boxStyle}>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id={FILTER_ID} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.333 -0.333 -0.333 0 1"
            result="inverseLuminance"
          />
          <feComponentTransfer in="inverseLuminance" result="mask">
            <feFuncA type="linear" slope="12" intercept="-1.32" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </svg>

      <Image
        {...imageProps}
        alt="تکنسین استادکاران در حال تعمیر"
        className="h-auto w-full max-w-none"
        style={{ filter: `url(#${FILTER_ID})` }}
      />
      <Image
        {...imageProps}
        alt=""
        aria-hidden="true"
        className="absolute top-0 left-0 h-auto w-full max-w-none"
        style={{ clipPath: "inset(35.84% 51.04% 59.47% 41.54%)" }}
      />

      {/* Soft floor shadow so the figure sits in the scene rather than on it */}
      <div aria-hidden="true" className="absolute bottom-[3%] left-[24%] -z-10 h-[7%] w-[62%] rounded-[50%] bg-primary/15 blur-xl" />
    </div>
  );
}
