import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { Appliance } from "@/types/appliance";
import { focus, pctY } from "./orbit-layout";

type CenterApplianceProps = {
  appliance: Appliance;
  zoom: number;
};

/*
 * The selected appliance's showcase at the centre of the orbit. It is its own
 * render of the same image (the browser fetches it once) and sits above the
 * technician; the orbit item itself never moves. Remounting on `key` plays the
 * soft fade/scale-in when the selection changes.
 */
export function CenterAppliance({ appliance, zoom }: CenterApplianceProps) {
  return (
    <div
      className="pointer-events-none absolute z-20 aspect-square -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${focus.x}%`, top: `${pctY(focus.y)}%`, width: `${focus.size}%` }}
    >
      <div key={appliance.id} className="animate-center-in absolute inset-0">
        {/* Soft spotlight: a faint teal wash, never a hard glow */}
        <span aria-hidden="true" className="absolute -inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgb(20_184_166/0.13),rgb(20_184_166/0.04)_62%,transparent)]" />
        {/* Focus platform: concentric rings under the appliance, near-white outside to teal at its foot */}
        <span aria-hidden="true" className="absolute bottom-[-9%] left-1/2 h-[30%] w-[118%] -translate-x-1/2">
          <span className="absolute inset-0 rounded-[50%] border border-accent/10 bg-white/40" />
          <span className="absolute inset-[13%] rounded-[50%] border border-accent/20 bg-accent/[0.07]" />
          <span className="absolute inset-[27%] rounded-[50%] border border-accent/35 bg-accent/[0.14]" />
          <span className="absolute inset-[42%] rounded-[50%] bg-accent/30" />
        </span>
        {/* Contact shadow */}
        <span aria-hidden="true" className="absolute bottom-[3%] left-[26%] h-[5%] w-[48%] rounded-[50%] bg-primary/20 blur-md" />
        <Link
          href={`${siteConfig.links.repairRequest}?appliance=${appliance.id}`}
          aria-label={`ثبت درخواست تعمیر ${appliance.title}`}
          className="pointer-events-auto absolute inset-[6%] rounded-2xl"
        >
          <Image
            src={appliance.image.src}
            alt=""
            fill
            sizes="(min-width: 768px) 230px, 140px"
            className="object-contain object-bottom drop-shadow-[0_14px_16px_rgb(15_76_129/0.16)]"
            style={{ scale: zoom, transformOrigin: "50% 100%" }}
          />
        </Link>
      </div>
    </div>
  );
}
