import "server-only";

import { requireStaff } from "./auth";
import { classify, nullableText, rows, text, type DataResult } from "./repair-requests";
import { createSupabaseSessionClient } from "./supabase-session";

export type TechnicianSummary = {
  id: string;
  fullName: string;
  isActive: boolean;
  phone: string | null;
  specialties: string[];
  assignedTotal: number;
  inProgress: number;
  completed: number;
  /** new + contacted + in_progress */
  openTotal: number;
  createdAt: string;
};

export type TechnicianDetail = TechnicianSummary & { notes: string | null };

export type StaffFilters = { q: string; active: "" | "active" | "inactive" };

function toSummary(row: Record<string, unknown>): TechnicianSummary {
  return {
    id: text(row.user_id),
    fullName: text(row.full_name),
    isActive: row.is_active === true,
    phone: nullableText(row.phone),
    specialties: Array.isArray(row.specialties) ? row.specialties.filter((item): item is string => typeof item === "string") : [],
    assignedTotal: Number(row.assigned_total) || 0,
    inProgress: Number(row.in_progress) || 0,
    completed: Number(row.completed) || 0,
    openTotal: Number(row.open_total) || 0,
    createdAt: text(row.created_at),
  };
}

export function parseStaffFilters(params: Record<string, string | string[] | undefined>): StaffFilters {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
  const active = first(params.active);
  return {
    q: first(params.q).replace(/\s+/g, " ").trim().slice(0, 64),
    active: active === "active" || active === "inactive" ? active : "",
  };
}

/** Manager-only (the database function enforces it too). */
export async function listTechnicianStaff(filters: StaffFilters): Promise<DataResult<{ items: TechnicianSummary[]; total: number }>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_list_technician_staff", {
    p_search: filters.q || null,
    p_active: filters.active || null,
    p_limit: 100,
    p_offset: 0,
  });
  if (error) return { ok: false, reason: classify(error) };

  const list = rows(data);
  return { ok: true, data: { items: list.map(toSummary), total: list.length ? Number(list[0].total_count) || 0 : 0 } };
}

export async function getTechnician(id: string): Promise<DataResult<TechnicianDetail | null>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_get_technician", { p_user_id: id });
  if (error) return { ok: false, reason: classify(error) };

  const row = rows(data)[0];
  return { ok: true, data: row ? { ...toSummary(row), notes: nullableText(row.notes) } : null };
}
