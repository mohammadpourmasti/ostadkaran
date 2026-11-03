import Link from "next/link";
import { formatNumber } from "@/lib/admin/format";

type StatCardProps = {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  /** Tailwind class for the thin accent bar on the card's start edge. */
  accent: string;
};

export function StatCard({ label, value, hint, href, accent }: StatCardProps) {
  const body = (
    <>
      <span aria-hidden="true" className={`absolute inset-y-4 start-0 w-1 rounded-e-full ${accent}`} />
      <span className="text-xs font-semibold text-muted">{label}</span>
      <span className="mt-2 text-3xl font-black tabular-nums text-foreground">{formatNumber(value)}</span>
      {hint && <span className="mt-1 text-xs leading-5 text-muted">{hint}</span>}
    </>
  );

  const classes =
    "relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 ps-5 shadow-sm transition duration-200";

  return href ? (
    <Link href={href} className={`${classes} hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
