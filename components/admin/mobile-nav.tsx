"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons/ui-icons";
import { NavLinks } from "./nav-links";

// Drawer for small screens. `footer` is the server-rendered account block (name, role, sign-out).
export function MobileNav({ footer, role }: { footer: ReactNode; role: "manager" | "operator" }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="باز کردن منو"
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
      >
        <MenuIcon className="size-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] animate-rise flex-col gap-6 bg-primary p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <span id={titleId} className="text-base font-extrabold">
                پنل استادکاران
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن منو"
                className="flex size-11 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <CloseIcon className="size-6" />
              </button>
            </div>
            <NavLinks role={role} onNavigate={() => setOpen(false)} />
            <div className="mt-auto flex flex-col gap-3 border-t border-white/15 pt-4">{footer}</div>
          </div>
        </div>
      )}
    </>
  );
}
