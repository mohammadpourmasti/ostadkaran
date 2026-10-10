import Link from "next/link";
import { siteConfig } from "@/lib/site";

// The mark echoes the hero dial: a ring, a centre, and one highlighted node.
function LogoMark({ className, onDark }: { className?: string; onDark?: boolean }) {
  const ink = onDark ? "#ffffff" : "var(--color-primary)";
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true" focusable="false">
      <circle cx="18" cy="18" r="12.5" fill="none" stroke={ink} strokeWidth="2.5" />
      <path d="M18 18 9.2 9.2" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18" cy="18" r="3.5" fill={ink} />
      <circle
        cx="9.2"
        cy="9.2"
        r="4"
        fill="var(--color-accent)"
        stroke={onDark ? "#0b2942" : "var(--color-surface)"}
        strokeWidth="2"
      />
    </svg>
  );
}

// `onDark` swaps the navy parts of the mark and wordmark for white (used in the navy footer).
export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg">
      <LogoMark className="size-9 shrink-0" onDark={onDark} />
      <span className="flex flex-col leading-tight">
        <span className={`text-lg font-extrabold ${onDark ? "text-white" : "text-primary"}`}>{siteConfig.name}</span>
        <span className={`hidden text-[0.7rem] sm:block ${onDark ? "text-white/70" : "text-muted"}`}>
          تعمیر لوازم خانگی · اراک
        </span>
      </span>
    </Link>
  );
}
