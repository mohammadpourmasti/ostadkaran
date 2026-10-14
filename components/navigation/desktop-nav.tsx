"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons/ui-icons";
import { mainNavigation, serviceNavigation, servicesOverviewHref } from "@/data/navigation";

const itemClass =
  "rounded-lg px-2.5 py-1.5 text-[0.9375rem] font-medium text-foreground/75 transition-colors hover:bg-primary/5 hover:text-primary";

// The item pointing at the services overview opens a dropdown of the real service pages.
function ServicesDropdown({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function openNow() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  // Small delay so the pointer can cross the gap between button and panel.
  function closeSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <li
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => event.pointerType === "mouse" && openNow()}
      onPointerLeave={(event) => event.pointerType === "mouse" && closeSoon()}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`${itemClass} inline-flex items-center gap-1 ${open ? "bg-primary/5 text-primary" : ""}`}
      >
        {label}
        <ChevronDownIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div id={panelId} hidden={!open} className="absolute start-0 top-full z-50 w-[34rem] pt-2">
        <div className="rounded-2xl border border-border bg-surface p-3 shadow-xl shadow-foreground/10">
          <ul className="grid grid-cols-2 gap-0.5">
            {serviceNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/5 hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={servicesOverviewHref}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg border-t border-border px-3 pt-3 pb-1 text-sm font-semibold text-accent-strong transition-colors hover:text-primary"
          >
            مشاهده همه خدمات
          </Link>
        </div>
      </div>
    </li>
  );
}

export function DesktopNav() {
  return (
    <nav aria-label="منوی اصلی" className="hidden lg:block">
      <ul className="flex items-center gap-0.5">
        {mainNavigation.map((item) =>
          item.href === servicesOverviewHref ? (
            <ServicesDropdown key={item.href} label={item.label} />
          ) : (
            <li key={item.href}>
              <Link href={item.href} className={itemClass}>
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
