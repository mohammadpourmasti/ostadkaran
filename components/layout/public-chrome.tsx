"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// The public header, footer and floating call buttons belong to the public site only; the dashboard under
// /admin has its own shell. Public pages render exactly as before.
export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
