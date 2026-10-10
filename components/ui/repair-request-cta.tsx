import Link from "next/link";
import { WrenchIcon } from "@/components/icons/ui-icons";
import { siteConfig } from "@/lib/site";

// Primary conversion action: leads to the repair-request page.
export function RepairRequestCta({
  className = "",
  variant = "solid",
}: {
  className?: string;
  variant?: "solid" | "header-outline";
}) {
  if (variant === "header-outline") {
    return (
      <Link
        href={siteConfig.links.repairRequest}
        aria-label="درخواست تعمیر"
        className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-accent-strong bg-transparent text-sm font-semibold whitespace-nowrap text-primary transition-colors hover:bg-accent/10 max-sm:w-10 sm:px-3.5 ${className}`}
      >
        <WrenchIcon className="size-4 shrink-0 text-accent-strong" />
        <span className="max-sm:sr-only">درخواست تعمیر</span>
      </Link>
    );
  }

  return (
    <Link
      href={siteConfig.links.repairRequest}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cta px-6 text-[0.9375rem] font-semibold text-white shadow-sm shadow-cta/20 transition duration-200 hover:-translate-y-px hover:brightness-95 hover:shadow-md hover:shadow-cta/25 active:translate-y-0 ${className}`}
    >
      <WrenchIcon className="size-[1.125rem] shrink-0" />
      درخواست تعمیر
    </Link>
  );
}
