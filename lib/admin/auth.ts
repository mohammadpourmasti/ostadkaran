import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseSessionClient } from "./supabase-session";
import { isPanelRole, type PanelRole } from "./statuses";

export type StaffSession = {
  userId: string;
  email: string | null;
  fullName: string;
  role: PanelRole;
};

export type SessionResult =
  | { status: "ok"; staff: StaffSession }
  | { status: "anonymous" }
  | { status: "forbidden"; reason: "no_profile" | "inactive" | "role" }
  | { status: "setup_required" };

/**
 * Single place that decides who may use the dashboard (the data access layer's gate).
 * An Auth account alone is not enough: it needs an ACTIVE staff profile whose role is manager or operator.
 * getUser() asks Supabase Auth to validate the token; it is not just a cookie read.
 */
export const getStaffSession = cache(async (): Promise<SessionResult> => {
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "anonymous" };

  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("full_name, role, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (profileError) {
    // 42P01 / PGRST205: the table does not exist yet, i.e. the migrations have not been applied.
    if (profileError.code === "42P01" || profileError.code === "PGRST205") return { status: "setup_required" };
    throw new Error("staff_profile_query_failed");
  }

  if (!profile) return { status: "forbidden", reason: "no_profile" };
  if (!profile.is_active) return { status: "forbidden", reason: "inactive" };
  if (!isPanelRole(profile.role)) return { status: "forbidden", reason: "role" };

  return {
    status: "ok",
    staff: { userId: data.user.id, email: data.user.email ?? null, fullName: profile.full_name, role: profile.role },
  };
});

/** Every protected page, layout part and Server Action starts here. Unauthorised callers never get data. */
export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffSession();

  if (session.status === "ok") return session.staff;
  if (session.status === "anonymous") redirect("/admin/login");
  if (session.status === "setup_required") redirect("/admin/login?error=setup");
  redirect("/admin/login?error=forbidden");
}
