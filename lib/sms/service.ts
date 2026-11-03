import "server-only";

import { maskPhone } from "@/lib/admin/phone";
import { readSmsConfig } from "./config";
import { databaseOutbox, nullOutbox } from "./outbox";
import { disabledProvider, resolveProvider } from "./providers";
import { renderSms } from "./templates";
import type { SmsOutbox, SmsOutcome, SmsProvider, SmsRequest } from "./types";

/**
 * The ONLY entry point the rest of the application uses to send SMS.
 *
 * Guarantees:
 *   - SMS disabled (default) or no provider registered => returns "skipped", contacts nothing, writes nothing.
 *   - Never throws: a failed or skipped SMS must not undo or block account creation or any staff change.
 *   - Duplicate protection through the outbox idempotency key.
 *   - Logs only template, masked recipient and outcome. Never the text, links, codes, keys or the full number.
 */
export async function sendSms(request: SmsRequest, overrides?: { provider?: SmsProvider; outbox?: SmsOutbox }): Promise<SmsOutcome> {
  const config = readSmsConfig();

  let provider: SmsProvider = disabledProvider;
  let outbox: SmsOutbox = nullOutbox;

  if (overrides?.provider) {
    provider = overrides.provider;
    outbox = overrides.outbox ?? nullOutbox;
  } else if (config.enabled) {
    const resolved = resolveProvider(config.provider);
    if (!resolved) return log(request, { status: "skipped", reason: "not_configured" });
    provider = resolved;
    outbox = databaseOutbox;
  } else {
    return log(request, { status: "skipped", reason: "disabled" });
  }

  if (!/^09\d{9}$/.test(request.to)) return log(request, { status: "skipped", reason: "invalid_recipient" });

  const text = renderSms(request.template, request.params);
  if (text === null) return log(request, { status: "failed", errorCode: "missing_template_params" });

  try {
    const reserved = await outbox.reserve({
      idempotencyKey: request.idempotencyKey,
      template: request.template,
      recipientUserId: request.recipientUserId,
      recipientMasked: maskPhone(request.to),
      provider: provider.id,
    });
    if (!reserved) return log(request, { status: "skipped", reason: "duplicate" });

    let outcome: SmsOutcome;
    try {
      outcome = await provider.send({ to: request.to, text, idempotencyKey: request.idempotencyKey });
    } catch {
      outcome = { status: "failed", errorCode: "provider_exception" };
    }

    await outbox.complete(request.idempotencyKey, outcome);
    return log(request, outcome);
  } catch {
    return log(request, { status: "failed", errorCode: "outbox_error" });
  }
}

function log(request: SmsRequest, outcome: SmsOutcome): SmsOutcome {
  // Deliberately minimal: no message text, no link, no full phone number, no provider key.
  if (outcome.status !== "skipped" || outcome.reason !== "disabled") {
    console.info("[sms]", { template: request.template, to: maskPhone(request.to), outcome: outcome.status });
  }
  return outcome;
}
