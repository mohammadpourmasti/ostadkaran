"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-config";

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ onNavigate, role }: { onNavigate?: () => void; role: "manager" | "operator" }) {
  const pathname = usePathname();

  return (
    <nav aria-label="منوی پنل" className="flex flex-col gap-1">
      {navItems.filter((item) => !item.managerOnly || role === "manager").map((item) => {
        const Icon = item.icon;

        if (item.soon) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/40"
            >
              <Icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-white/60">به‌زودی</span>
            </span>
          );
        }

        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              active ? "bg-white/14 text-white shadow-inner" : "text-white/75 hover:bg-white/8 hover:text-white"
            }`}
          >
            <Icon className={`size-5 shrink-0 ${active ? "text-accent" : ""}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
