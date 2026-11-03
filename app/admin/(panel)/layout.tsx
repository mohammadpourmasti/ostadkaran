import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaff } from "@/lib/admin/auth";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  // Layouts do not protect the pages beneath them on their own: every page and action calls requireStaff() too.
  const staff = await requireStaff();
  return <AdminShell staff={staff}>{children}</AdminShell>;
}
