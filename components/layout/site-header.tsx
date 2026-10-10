import { MobileNav } from "@/components/navigation/mobile-nav";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { mainNavigation } from "@/data/navigation";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="page-container flex h-14 items-center gap-3 lg:gap-6">
        <div>
          <Logo />
        </div>

        <nav aria-label="منوی اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-lg px-2.5 py-1.5 text-[0.9375rem] font-medium text-foreground/75 transition-colors hover:bg-primary/5 hover:text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <RepairRequestCta variant="header-outline" />
          <PhoneCta variant="header" className="max-sm:hidden" />
          <PhoneCta variant="icon" className="sm:hidden" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
