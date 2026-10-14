import { DesktopNav } from "@/components/navigation/desktop-nav";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="page-container flex h-14 items-center gap-3 lg:gap-6">
        <div>
          <Logo />
        </div>

        <DesktopNav />

        <div className="ms-auto flex items-center gap-2">
          <RepairRequestCta variant="header-outline" />
          <PhoneCta variant="header" className="max-sm:hidden" />
          <PhoneCta variant="icon" className="sm:hidden" />
        </div>
      </div>
    </header>
  );
}
