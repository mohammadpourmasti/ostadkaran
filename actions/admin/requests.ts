"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/auth";
import { createSupabaseSessionClient } from "@/lib/admin/supabase-session";
import type { ActionState } from "@/lib/admin/action-state";
import { allowedTransitions, isNoteKind, isRequestStatus } from "@/lib/admin/statuses";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Database function errors carry a stable code in their message; show a clear Persian sentence for each.
function describeDbError(error: { code?: string; message?: string }): string {
  const message = error.message ?? "";
  if (message.includes("stale_status")) return "وضعیت این درخواست در همین فاصله تغییر کرده است. صفحه را تازه کنید و دوباره تلاش کنید.";
  if (message.includes("not_allowed") || message.includes("not_authorized")) return "نقش شما اجازهٔ این کار را ندارد.";
  if (message.includes("reason_required")) return "برای لغو درخواست، دلیل لازم است.";
  if (message.includes("status_unchanged")) return "درخواست از قبل در همین وضعیت است.";
  if (message.includes("request_not_found")) return "این درخواست پیدا نشد.";
  if (message.includes("request_closed")) return "این درخواست بسته شده است؛ تکنسین آن قابل تغییر نیست.";
  if (message.includes("invalid_technician")) return "فقط تکنسین فعال قابل انتخاب است.";
  if (message.includes("assignment_unchanged")) return "این تخصیص از قبل همین‌طور است.";
  if (message.includes("invalid_note")) return "توضیح حداکثر ۵۰۰ نویسه است.";
  if (error.code === "PGRST202" || error.code === "42883") return "توابع داشبورد روی Supabase ساخته نشده‌اند (migrationها اجرا نشده‌اند).";
  return "عملیات انجام نشد. دوباره تلاش کنید.";
}

export async function addNoteAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const requestId = String(formData.get("requestId") ?? "");
  const kind = formData.get("kind");
  const body = String(formData.get("body") ?? "").trim();

  if (!UUID.test(requestId)) return { status: "error", message: "شناسهٔ درخواست نامعتبر است." };
  if (!isNoteKind(kind)) return { status: "error", message: "نوع یادداشت نامعتبر است." };
  if (body.length < 1) return { status: "error", message: "متن یادداشت را بنویسید." };
  if (body.length > 1000) return { status: "error", message: "یادداشت حداکثر ۱۰۰۰ نویسه است." };

  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.rpc("admin_add_request_note", { p_request_id: requestId, p_kind: kind, p_body: body });
  if (error) return { status: "error", message: describeDbError(error) };

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin");
  return { status: "success", message: "یادداشت ثبت شد.", nonce: Date.now() };
}

export async function changeStatusAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();

  const requestId = String(formData.get("requestId") ?? "");
  const expected = formData.get("expectedStatus");
  const next = formData.get("newStatus");
  const reason = String(formData.get("reason") ?? "").trim();
  const confirmed = formData.get("confirmCancel") === "on";

  if (!UUID.test(requestId)) return { status: "error", message: "شناسهٔ درخواست نامعتبر است." };
  if (!isRequestStatus(expected) || !isRequestStatus(next)) return { status: "error", message: "وضعیت نامعتبر است." };

  // Mirrors the database rule so the user gets a clear message; the database function enforces it for real.
  if (!allowedTransitions(staff.role, expected).includes(next)) {
    return { status: "error", message: "نقش شما اجازهٔ این تغییر وضعیت را ندارد." };
  }

  if (next === "cancelled") {
    if (reason.length < 3) return { status: "error", message: "برای لغو درخواست، دلیل لازم است (حداقل ۳ نویسه)." };
    if (!confirmed) return { status: "error", message: "برای لغو، تأیید را علامت بزنید." };
  }
  if (reason.length > 1000) return { status: "error", message: "دلیل حداکثر ۱۰۰۰ نویسه است." };

  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.rpc("admin_change_request_status", {
    p_request_id: requestId,
    p_expected_status: expected,
    p_new_status: next,
    p_reason: reason || null,
  });
  if (error) return { status: "error", message: describeDbError(error) };

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  return { status: "success", message: "وضعیت درخواست تغییر کرد.", nonce: Date.now() };
}

// Assign / change / remove the responsible technician. Operators may assign and change; only managers may remove.
// The database function enforces the same rules (and that the target is an ACTIVE technician).
export async function assignTechnicianAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await requireStaff();

  const requestId = String(formData.get("requestId") ?? "");
  const intent = formData.get("intent");
  const technicianId = String(formData.get("technicianId") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!UUID.test(requestId)) return { status: "error", message: "شناسهٔ درخواست نامعتبر است." };
  if (note.length > 500) return { status: "error", message: "توضیح حداکثر ۵۰۰ نویسه است." };

  let target: string | null;
  if (intent === "unassign") {
    if (staff.role !== "manager") return { status: "error", message: "فقط مدیر می‌تواند تخصیص را بردارد." };
    target = null;
  } else if (intent === "assign") {
    if (!UUID.test(technicianId)) return { status: "error", message: "یک تکنسین انتخاب کنید." };
    target = technicianId;
  } else {
    return { status: "error", message: "درخواست نامعتبر است." };
  }

  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.rpc("admin_assign_technician", {
    p_request_id: requestId,
    p_technician_id: target,
    p_note: note || null,
  });
  if (error) return { status: "error", message: describeDbError(error) };

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin/reports");
  return { status: "success", message: target ? "تکنسین مسئول ثبت شد." : "تخصیص برداشته شد.", nonce: Date.now() };
}
