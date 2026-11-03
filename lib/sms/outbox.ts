import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { SmsOutbox, SmsOutcome } from "./types";

/** Used while SMS is off: nothing is recorded and nothing is a duplicate. */
export const nullOutbox: SmsOutbox = {
  async reserve() {
    return true;
  },
  async complete() {},
};

/**
 * Outbox backed by public.sms_outbox (migration 20261101170000, applied by you later). Written with the server-side
 * secret key. Stores template, masked recipient, status, error code and timestamps only: never the text or links.
 */
export const databaseOutbox: SmsOutbox = {
  async reserve(entry) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("sms_outbox").insert({
      idempotency_key: entry.idempotencyKey,
      template: entry.template,
      recipient_user_id: entry.recipientUserId ?? null,
      recipient_masked: entry.recipientMasked,
      provider: entry.provider,
      status: "queued",
    });
    if (!error) return true;
    if (error.code === "23505") return false; // unique idempotency_key: already reserved => duplicate
    throw new Error("sms_outbox_reserve_failed");
  },

  async complete(idempotencyKey: string, outcome: SmsOutcome) {
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("sms_outbox")
      .update({
        status: outcome.status,
        provider_message_id: outcome.status === "sent" ? outcome.providerMessageId : null,
        error_code: outcome.status === "failed" ? outcome.errorCode.slice(0, 60) : outcome.status === "skipped" ? outcome.reason : null,
        sent_at: outcome.status === "sent" ? now : null,
        updated_at: now,
      })
      .eq("idempotency_key", idempotencyKey);
    if (error) throw new Error("sms_outbox_complete_failed");
  },
};
