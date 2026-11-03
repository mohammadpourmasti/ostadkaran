import type { ReactNode } from "react";
import type { StaffSession } from "@/lib/admin/auth";
import { roleLabels } from "@/lib/admin/statuses";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { SignOutButton } from "./sign-out-button";

function Account({ staff }: { staff: StaffSession }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-extrabold text-accent"
      >
        {staff.fullName.slice(0, 1)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-white">{staff.fullName}</span>
        <span className="block text-xs text-white/60">{roleLabels[staff.role]}</span>
      </span>
    </div>
  );
}

// Right-hand sidebar on desktop (RTL: first flex child), drawer + compact header on small screens.
export function AdminShell({ staff, children }: { staff: StaffSession; children: ReactNode }) {
  const footer = (
    <>
      <Account staff={staff} />
      <SignOutButton />
    </>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 bg-primary p-4 text-white lg:flex">
        <div className="flex items-center gap-3 px-1 pt-1">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-white/12 text-lg font-black text-accent">
            ا
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold">استادکاران</span>
            <span className="block text-xs text-white/60">پنل مدیریت</span>
          </span>
        </div>
        <NavLinks role={staff.role} />
        <div className="mt-auto flex flex-col gap-3 border-t border-white/15 pt-4">{footer}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md lg:hidden">
          <MobileNav footer={footer} role={staff.role} />
          <span className="text-sm font-extrabold text-primary">پنل استادکاران</span>
          <span className="ms-auto text-xs text-muted">{staff.fullName}</span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
