// Pure, dependency-free helpers shared by server code, client components and tests.

export const REQUEST_STATUSES = ["new", "contacted", "in_progress", "completed", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STAFF_ROLES = ["manager", "operator", "technician"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

// Roles admitted to request management in version 1.
export const PANEL_ROLES = ["manager", "operator"] as const satisfies readonly StaffRole[];
export type PanelRole = (typeof PANEL_ROLES)[number];

export const NOTE_KINDS = ["note", "call_attempt", "call_success"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];
export type TimelineKind = NoteKind | "status_change";

export const statusLabels: Record<RequestStatus, string> = {
  new: "جدید",
  contacted: "تماس گرفته شده",
  in_progress: "در حال انجام",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

export const roleLabels: Record<StaffRole, string> = {
  manager: "مدیر",
  operator: "اپراتور",
  technician: "تکنسین",
};

export const kindLabels: Record<TimelineKind, string> = {
  note: "یادداشت",
  call_attempt: "تلاش برای تماس",
  call_success: "تماس موفق",
  status_change: "تغییر وضعیت",
};

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && (REQUEST_STATUSES as readonly string[]).includes(value);
}

export function isNoteKind(value: unknown): value is NoteKind {
  return typeof value === "string" && (NOTE_KINDS as readonly string[]).includes(value);
}

export function isPanelRole(value: unknown): value is PanelRole {
  return typeof value === "string" && (PANEL_ROLES as readonly string[]).includes(value);
}

/**
 * Status changes a role may make from `from`. This MIRRORS the rules enforced in the database function
 * admin_change_request_status; it exists to show only valid choices, never to replace that check.
 */
export function allowedTransitions(role: PanelRole, from: RequestStatus): RequestStatus[] {
  if (role === "manager") return REQUEST_STATUSES.filter((status) => status !== from);
  if (from === "new") return ["contacted", "cancelled"];
  if (from === "contacted") return ["cancelled"];
  return [];
}
