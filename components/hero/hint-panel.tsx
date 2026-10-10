import Image from "next/image";
import Link from "next/link";
import { WrenchIcon } from "@/components/icons/ui-icons";
import { siteConfig } from "@/lib/site";
import type { Appliance } from "@/types/appliance";

type HintPanelProps = {
  appliance: Appliance;
  zoom: number;
};

// Small information card for the selected appliance: its common problems and a direct repair link.
export function HintPanel({ appliance, zoom }: HintPanelProps) {
  const headingId = `hint-${appliance.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-accent-strong/60 bg-surface p-5 shadow-[0_16px_36px_-24px_rgb(13_148_136/0.5)]"
    >
      <div key={appliance.id} className="animate-rise">
        <div className="flex items-center gap-3">
          <span className="relative size-14 shrink-0 rounded-2xl border border-border bg-background">
            <Image
              src={appliance.image.src}
              alt=""
              fill
              sizes="56px"
              className="object-contain p-2"
              style={{ scale: zoom }}
            />
          </span>
          <h2 id={headingId} className="text-[0.95rem]/6 font-semibold text-foreground">
            مشکلات رایج {appliance.title}
          </h2>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">مشکلات رایج</p>
          <ul className="mt-2.5 space-y-2 text-sm text-muted">
            {appliance.commonProblems.map((problem) => (
              <li key={problem} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                {problem}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`${siteConfig.links.repairRequest}?appliance=${appliance.id}`}
          className="mt-5 flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:brightness-95 active:translate-y-0"
        >
          <WrenchIcon className="size-[1.125rem] shrink-0" />
          تعمیر {appliance.title}
        </Link>
      </div>
    </section>
  );
}
