import "server-only";

import { requireStaff } from "./auth";
import { createSupabaseSessionClient } from "./supabase-session";
import { PAGE_SIZE, dayEndExclusiveIso, dayStartIso, type RequestFilters } from "./filters";
import type { ReportFilters } from "./report-range";
import { isRequestStatus, type RequestStatus, type TimelineKind } from "./statuses";

export type RequestListItem = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  appliance: string;
  brand: string | null;
  status: RequestStatus;
  problemPreview: string;
  technicianId: string | null;
  technicianName: string | null;
};

export type RequestDetail = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  appliance: string;
  brand: string | null;
  problem: string;
  status: RequestStatus;
};

export type TimelineEntry = {
  id: string;
  createdAt: string;
  kind: TimelineKind;
  body: string | null;
  oldStatus: RequestStatus | null;
  newStatus: RequestStatus | null;
  authorName: string | null;
};

export type ActivityEntry = TimelineEntry & { requestId: string; customerName: string };

export type DashboardStats = {
  total: number;
  byStatus: Record<RequestStatus, number>;
  daily: { day: string; count: number }[];
  staleNew: number;
};

/** Why a data call failed, without leaking details. "setup" = the migrations are not applied yet. */
export type DataResult<T> = { ok: true; data: T } | { ok: false; reason: "setup" | "forbidden" | "failed" };

type RpcError = { code?: string; message?: string };

export function classify(error: RpcError): "setup" | "forbidden" | "failed" {
  // PGRST202 / 42883: function not found (migration not applied). 42501: not_authorized raised by the function.
  if (error.code === "PGRST202" || error.code === "42883") return "setup";
  if (error.code === "42501") return "forbidden";
  return "failed";
}

export function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function nullableText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function status(value: unknown): RequestStatus {
  return isRequestStatus(value) ? value : "new";
}

function nullableStatus(value: unknown): RequestStatus | null {
  return isRequestStatus(value) ? value : null;
}

function kind(value: unknown): TimelineKind {
  return value === "call_attempt" || value === "call_success" || value === "status_change" ? value : "note";
}

export function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value.filter((row) => typeof row === "object" && row !== null) as Record<string, unknown>[]) : [];
}

export async function listRequests(
  filters: RequestFilters,
): Promise<DataResult<{ items: RequestListItem[]; total: number }>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_list_repair_requests_v2", {
    p_search: filters.q || null,
    p_status: filters.status || null,
    p_appliance: filters.appliance || null,
    p_from: dayStartIso(filters.from),
    p_to: dayEndExclusiveIso(filters.to),
    p_technician: filters.technician || null,
    p_sort: filters.sort,
    p_limit: PAGE_SIZE,
    p_offset: (filters.page - 1) * PAGE_SIZE,
  });

  if (error) return { ok: false, reason: classify(error) };

  const list = rows(data);
  return {
    ok: true,
    data: {
      total: list.length ? Number(list[0].total_count) || 0 : 0,
      items: list.map((row) => ({
        id: text(row.id),
        createdAt: text(row.created_at),
        name: text(row.name),
        phone: text(row.phone),
        appliance: text(row.appliance),
        brand: nullableText(row.brand),
        status: status(row.status),
        problemPreview: text(row.problem_preview),
        technicianId: nullableText(row.technician_id),
        technicianName: nullableText(row.technician_name),
      })),
    },
  };
}

export async function getRequest(id: string): Promise<DataResult<RequestDetail | null>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_get_repair_request", { p_id: id });
  if (error) return { ok: false, reason: classify(error) };

  const row = rows(data)[0];
  if (!row) return { ok: true, data: null };

  return {
    ok: true,
    data: {
      id: text(row.id),
      createdAt: text(row.created_at),
      name: text(row.name),
      phone: text(row.phone),
      appliance: text(row.appliance),
      brand: nullableText(row.brand),
      problem: text(row.problem),
      status: status(row.status),
    },
  };
}

function toTimeline(row: Record<string, unknown>): TimelineEntry {
  return {
    id: text(row.id),
    createdAt: text(row.created_at),
    kind: kind(row.kind),
    body: nullableText(row.body),
    oldStatus: nullableStatus(row.old_status),
    newStatus: nullableStatus(row.new_status),
    authorName: nullableText(row.author_name),
  };
}

export async function listNotes(requestId: string): Promise<DataResult<TimelineEntry[]>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_list_request_notes", { p_request_id: requestId });
  if (error) return { ok: false, reason: classify(error) };

  return { ok: true, data: rows(data).map(toTimeline) };
}

export async function recentActivity(limit = 8): Promise<DataResult<ActivityEntry[]>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_recent_activity", { p_limit: limit });
  if (error) return { ok: false, reason: classify(error) };

  return {
    ok: true,
    data: rows(data).map((row) => ({
      ...toTimeline(row),
      requestId: text(row.request_id),
      customerName: text(row.customer_name),
    })),
  };
}

export async function getStats(): Promise<DataResult<DashboardStats>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_repair_request_stats");
  if (error) return { ok: false, reason: classify(error) };

  const raw = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  const rawStatus = (typeof raw.by_status === "object" && raw.by_status !== null ? raw.by_status : {}) as Record<string, unknown>;

  const byStatus: Record<RequestStatus, number> = {
    new: Number(rawStatus.new) || 0,
    contacted: Number(rawStatus.contacted) || 0,
    in_progress: Number(rawStatus.in_progress) || 0,
    completed: Number(rawStatus.completed) || 0,
    cancelled: Number(rawStatus.cancelled) || 0,
  };

  return {
    ok: true,
    data: {
      total: Number(raw.total) || 0,
      byStatus,
      staleNew: Number(raw.stale_new) || 0,
      daily: rows(raw.daily).map((row) => ({ day: text(row.day), count: Number(row.count) || 0 })),
    },
  };
}

export type TechnicianOption = { id: string; name: string; isActive: boolean; specialties: string[] };

export type CurrentAssignment = {
  technicianId: string;
  technicianName: string;
  technicianActive: boolean;
  assignedAt: string;
  assignedByName: string | null;
};

export type AssignmentEvent = {
  id: string;
  createdAt: string;
  fromId: string | null;
  fromName: string | null;
  toId: string | null;
  toName: string | null;
  actorName: string | null;
  note: string | null;
};

export async function listTechnicians(onlyActive = true): Promise<DataResult<TechnicianOption[]>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  // v2 adds the specialties (migration 20261101160000). Until it is applied, fall back to the original function.
  const v2 = await supabase.rpc("admin_list_technicians_v2", { p_only_active: onlyActive });
  if (!v2.error) {
    return {
      ok: true,
      data: rows(v2.data).map((row) => ({
        id: text(row.user_id),
        name: text(row.full_name),
        isActive: row.is_active === true,
        specialties: Array.isArray(row.specialties) ? row.specialties.filter((item): item is string => typeof item === "string") : [],
      })),
    };
  }
  if (classify(v2.error) !== "setup") return { ok: false, reason: classify(v2.error) };

  const { data, error } = await supabase.rpc("admin_list_technicians", { p_only_active: onlyActive });
  if (error) return { ok: false, reason: classify(error) };

  return {
    ok: true,
    data: rows(data).map((row) => ({ id: text(row.user_id), name: text(row.full_name), isActive: row.is_active === true, specialties: [] })),
  };
}

export async function getAssignment(requestId: string): Promise<DataResult<CurrentAssignment | null>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_get_request_assignment", { p_request_id: requestId });
  if (error) return { ok: false, reason: classify(error) };

  const row = rows(data)[0];
  if (!row) return { ok: true, data: null };

  return {
    ok: true,
    data: {
      technicianId: text(row.technician_id),
      technicianName: text(row.technician_name),
      technicianActive: row.technician_active === true,
      assignedAt: text(row.assigned_at),
      assignedByName: nullableText(row.assigned_by_name),
    },
  };
}

function toAssignmentEvent(row: Record<string, unknown>): AssignmentEvent {
  return {
    id: text(row.id),
    createdAt: text(row.created_at),
    fromId: nullableText(row.from_technician_id ?? row.from_id),
    fromName: nullableText(row.from_name),
    toId: nullableText(row.to_technician_id ?? row.to_id),
    toName: nullableText(row.to_name),
    actorName: nullableText(row.actor_name),
    note: nullableText(row.note),
  };
}

export async function listAssignmentEvents(requestId: string): Promise<DataResult<AssignmentEvent[]>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_list_assignment_events", { p_request_id: requestId });
  if (error) return { ok: false, reason: classify(error) };

  return { ok: true, data: rows(data).map(toAssignmentEvent) };
}

export type ReportDuration = { count: number; avgHours: number | null; medianHours: number | null };

export type ReportTechnician = {
  id: string;
  name: string;
  isActive: boolean;
  total: number;
  new: number;
  contacted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  /** new + contacted + in_progress */
  active: number;
  /** History: assignment actions in the period whose new technician is this person. */
  assignmentsMade: number;
};

export type ReportEvent = AssignmentEvent & { requestId: string; customerName: string };

export type ReportData = {
  total: number;
  assigned: number;
  unassigned: number;
  byStatus: Record<RequestStatus, number>;
  bucket: "day" | "month";
  series: { day: string; count: number }[];
  appliances: { key: string; count: number }[];
  brands: { key: string; count: number }[];
  technicians: ReportTechnician[];
  firstContact: ReportDuration;
  completion: ReportDuration;
  events: ReportEvent[];
};

export type ExportRow = {
  createdAt: string;
  appliance: string;
  brand: string | null;
  status: RequestStatus;
  technicianName: string | null;
  assignedAt: string | null;
};

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function duration(value: unknown): ReportDuration {
  const raw = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  return { count: Number(raw.count) || 0, avgHours: nullableNumber(raw.avg_hours), medianHours: nullableNumber(raw.median_hours) };
}

function counted(value: unknown): { key: string; count: number }[] {
  return rows(value)
    .map((row) => ({ key: text(row.key), count: Number(row.count) || 0 }))
    .filter((row) => row.key !== "");
}

function reportParams(filters: ReportFilters) {
  return {
    p_from: filters.range.fromIso,
    p_to: filters.range.toIso,
    p_technician: filters.technician || null,
    p_status: filters.status || null,
    p_appliance: filters.appliance || null,
  };
}

export async function getReport(filters: ReportFilters): Promise<DataResult<ReportData>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_repair_request_report", reportParams(filters));
  if (error) return { ok: false, reason: classify(error) };

  const raw = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  const rawStatus = (typeof raw.by_status === "object" && raw.by_status !== null ? raw.by_status : {}) as Record<string, unknown>;

  return {
    ok: true,
    data: {
      total: Number(raw.total) || 0,
      assigned: Number(raw.assigned) || 0,
      unassigned: Number(raw.unassigned) || 0,
      byStatus: {
        new: Number(rawStatus.new) || 0,
        contacted: Number(rawStatus.contacted) || 0,
        in_progress: Number(rawStatus.in_progress) || 0,
        completed: Number(rawStatus.completed) || 0,
        cancelled: Number(rawStatus.cancelled) || 0,
      },
      bucket: raw.bucket === "month" ? "month" : "day",
      series: rows(raw.series).map((row) => ({ day: text(row.day), count: Number(row.count) || 0 })),
      appliances: counted(raw.appliances),
      brands: counted(raw.brands),
      technicians: rows(raw.technicians).map((row) => ({
        id: text(row.id),
        name: text(row.name),
        isActive: row.is_active === true,
        total: Number(row.total) || 0,
        new: Number(row.new) || 0,
        contacted: Number(row.contacted) || 0,
        inProgress: Number(row.in_progress) || 0,
        completed: Number(row.completed) || 0,
        cancelled: Number(row.cancelled) || 0,
        active: Number(row.active) || 0,
        assignmentsMade: Number(row.assignments_made) || 0,
      })),
      firstContact: duration(raw.first_contact),
      completion: duration(raw.completion),
      events: rows(raw.events).map((row) => ({
        ...toAssignmentEvent(row),
        requestId: text(row.request_id),
        customerName: text(row.customer_name),
      })),
    },
  };
}

/** Rows for the CSV export: no customer name, phone or problem text. */
export async function getExportRows(filters: ReportFilters): Promise<DataResult<ExportRow[]>> {
  await requireStaff();
  const supabase = await createSupabaseSessionClient();

  const { data, error } = await supabase.rpc("admin_report_export_rows", reportParams(filters));
  if (error) return { ok: false, reason: classify(error) };

  return {
    ok: true,
    data: rows(data).map((row) => ({
      createdAt: text(row.created_at),
      appliance: text(row.appliance),
      brand: nullableText(row.brand),
      status: status(row.status),
      technicianName: nullableText(row.technician_name),
      assignedAt: nullableText(row.assigned_at),
    })),
  };
}
