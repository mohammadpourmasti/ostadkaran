import "server-only";

import { redirect } from "next/navigation";
import { requireStaff, type StaffSession } from "./auth";

/** Staff management is manager-only. Operators are sent back to the overview; the database enforces it as well. */
export async function requireManager(): Promise<StaffSession> {
  const staff = await requireStaff();
  if (staff.role !== "manager") redirect("/admin");
  return staff;
}
