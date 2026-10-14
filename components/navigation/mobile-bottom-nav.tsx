"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ClipboardIcon, GridIcon, HomeIcon, PhoneIcon } from "@/components/icons/ui-icons";
import { homeNavigation, mainNavigation, servicesOverviewHref } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

type Item = { key: string; label: string; href: string; icon: ReactNode; active: boolean };

const itemClass =
  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 text-[0.6875rem] leading-tight font-medium whitespace-nowrap transition-colors focus-visible:outline-offset-[-2px]";

// Fixed capsule bar for < lg (replaces the hamburger menu). The center Baleh button floats above it.
export function MobileBottomNav() {
  const pathname = usePathname();
  const contactHref = mainNavigation.find((item) => item.label === "تماس با ما")?.href ?? "/";
  // Baleh has no verified phone-number chat link, so use the business username when configured, else the official site.
  const balehHref = `https://ble.ir/${siteConfig.links.balehUsername ?? ""}`;

  const start: Item[] = [
    { key: "home", label: "خانه", href: homeNavigation.href, icon: <HomeIcon className="size-6" />, active: pathname === "/" },
    {
      key: "services",
      label: "خدمات",
      href: servicesOverviewHref,
      icon: <GridIcon className="size-6" />,
      active: pathname.startsWith("/services"),
    },
  ];
  const end: Item[] = [
    {
      key: "request",
      label: "ثبت درخواست",
      href: siteConfig.links.repairRequest,
      icon: <ClipboardIcon className="size-6" />,
      active: pathname.startsWith(siteConfig.links.repairRequest),
    },
    { key: "contact", label: "تماس با ما", href: contactHref, icon: <PhoneIcon className="size-6" />, active: false },
  ];

  const renderItem = (item: Item) => (
    <li key={item.key} className="flex">
      <Link
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        className={`${itemClass} w-full ${item.active ? "bg-accent/15 font-bold text-white" : "text-accent hover:text-white"}`}
      >
        {item.icon}
        {item.label}
      </Link>
    </li>
  );

  return (
    <nav
      aria-label="ناوبری اصلی موبایل"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md lg:hidden"
    >
      <ul className="grid h-16 grid-cols-[1fr_1fr_4.25rem_1fr_1fr] items-center rounded-full border border-white/10 bg-[#0b2942] px-2 shadow-lg shadow-primary/30">
        {start.map(renderItem)}
        <li className="relative flex justify-center">
          <div className="-translate-y-4 rounded-full bg-[#0b2942] p-1">
            <a
              href={balehHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="گفتگو در پیام‌رسان بله (باز می‌شود در برنامه یا سایت بله)"
              className="bale-btn-fab flex size-14 items-center justify-center rounded-full active:scale-95"
            >
              <Image src="/images/icons/baleh-logo.png.svg" alt="" width={36} height={36} unoptimized className="size-9" />
            </a>
          </div>
        </li>
        {end.map(renderItem)}
      </ul>
    </nav>
  );
}
