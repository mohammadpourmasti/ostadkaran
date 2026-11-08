"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon, ClipboardIcon, ErrorGuideIcon, GridIcon, HomeIcon, PhoneIcon } from "@/components/icons/ui-icons";
import { homeNavigation, serviceNavigation, servicesOverviewHref } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

type Item = { key: string; label: string; href: string; icon: ReactNode; active: boolean; wrap?: boolean };

const itemClass =
  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 text-[0.6875rem] leading-tight font-medium whitespace-nowrap transition-colors focus-visible:outline-offset-[-2px]";

// Fixed capsule bar for < lg (replaces the hamburger menu). The center call button floats above it.
export function MobileBottomNav() {
  const pathname = usePathname();
  // The services list opens above the bar. It is tied to the page it was opened on, so navigating (a link, back,
  // forward) closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const servicesOpen = openedOn === pathname;
  const panelId = useId();
  const navRef = useRef<HTMLElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!servicesOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenedOn(null);
        servicesButtonRef.current?.focus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenedOn(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [servicesOpen]);

  // The center button was a Baleh link, but no official Baleh account is confirmed, so it is a direct call to the
  // main number instead (tel: link from siteConfig). Switch back only once a verified Baleh account exists.
  const callHref = siteConfig.contact.phone.href;

  const start: Item[] = [
    { key: "home", label: "خانه", href: homeNavigation.href, icon: <HomeIcon className="size-6" />, active: pathname === "/" },
  ];
  const servicesActive = servicesOpen || pathname.startsWith("/services");
  const end: Item[] = [
    {
      key: "request",
      label: "ثبت درخواست",
      href: siteConfig.links.repairRequest,
      icon: <ClipboardIcon className="size-6" />,
      active: pathname.startsWith(siteConfig.links.repairRequest),
    },
    {
      key: "error-codes",
      label: "راهنمای کدهای خطا",
      href: "/error-codes",
      icon: <ErrorGuideIcon className="size-6" />,
      active: pathname.startsWith("/error-codes"),
      wrap: true,
    },
  ];

  const renderItem = (item: Item) => (
    <li key={item.key} className="flex">
      <Link
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        className={`${item.wrap ? itemClass.replace("whitespace-nowrap", "text-center whitespace-normal") : itemClass} w-full ${item.active ? "bg-accent/15 font-bold text-white" : "text-accent hover:text-white"}`}
      >
        {item.icon}
        {item.label}
      </Link>
    </li>
  );

  return (
    <nav
      ref={navRef}
      aria-label="ناوبری اصلی موبایل"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md lg:hidden"
    >
      {/* Services list: a real list of the service pages, opened by the "خدمات" button. The grid-rows trick
          animates the height smoothly; `inert` keeps the closed list out of the tab order and screen readers. */}
      <div
        id={panelId}
        inert={!servicesOpen}
        className={`absolute inset-x-0 bottom-full mb-6 grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          servicesOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b2942] p-3 shadow-lg shadow-primary/30">
            <ul className="grid grid-cols-2 gap-1">
              {serviceNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/error-codes"
              className="mt-1 flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              راهنمای کدهای خطا
            </Link>
            <Link
              href={servicesOverviewHref}
              className="mt-2 flex min-h-11 items-center justify-center rounded-xl border-t border-white/10 px-3 pt-2 text-sm font-semibold text-accent transition-colors hover:text-white"
            >
              مشاهده همه خدمات
            </Link>
          </div>
        </div>
      </div>

      <ul className="grid h-16 grid-cols-[1fr_1fr_4.25rem_1fr_1fr] items-center rounded-full border border-white/10 bg-[#0b2942] px-2 shadow-lg shadow-primary/30">
        {start.map(renderItem)}
        <li className="flex">
          <button
            ref={servicesButtonRef}
            type="button"
            aria-expanded={servicesOpen}
            aria-controls={panelId}
            onClick={() => setOpenedOn(servicesOpen ? null : pathname)}
            className={`${itemClass} w-full ${servicesActive ? "bg-accent/15 font-bold text-white" : "text-accent hover:text-white"}`}
          >
            <span className="relative">
              <GridIcon className="size-6" />
              <ChevronDownIcon
                className={`absolute -end-2 -top-1 size-3.5 transition-transform ${servicesOpen ? "" : "rotate-180"}`}
              />
            </span>
            خدمات
          </button>
        </li>
        <li className="relative flex justify-center">
          <div className="-translate-y-4 rounded-full bg-[#0b2942] p-1">
            <a
              href={callHref}
              aria-label="تماس تلفنی با استادکاران"
              className="bale-btn-fab flex size-14 items-center justify-center rounded-full text-white active:scale-95"
            >
              <PhoneIcon className="size-7" />
            </a>
          </div>
        </li>
        {end.map(renderItem)}
      </ul>
    </nav>
  );
}
