// Provider-independent SMS contracts. Nothing in the staff-management logic imports a concrete provider:
// it talks to sendSms() (service.ts), which talks to an SmsProvider chosen from server-side configuration.

/** Message kinds the product plans to send. Each has a Persian template in templates.ts. */
export const SMS_TEMPLATES = [
  "technician_invite", // invite a new technician to activate the account (carries a secure link)
  "password_reset_link", // secure password set/reset link
  "assignment_new", // a request was assigned to the technician
  "assignment_changed", // an assignment was changed or cancelled
  "operational", // free-form management / operational message
] as const;
export type SmsTemplate = (typeof SMS_TEMPLATES)[number];

export type SmsParams = Record<string, string>;

export type SmsRequest = {
  template: SmsTemplate;
  /** Recipient in local form 09xxxxxxxxx. Used for sending only, never logged or stored in full. */
  to: string;
  params: SmsParams;
  /**
   * Stable key of the business event, e.g. "assignment_new:<requestId>:<technicianId>:<assignedAt>".
   * Sending the same key twice must not deliver twice (see outbox.ts).
   */
  idempotencyKey: string;
  /** Staff member the message is for, kept in the outbox for auditing (optional). */
  recipientUserId?: string;
};

export type SmsOutcome =
  | { status: "sent"; providerMessageId: string | null }
  | { status: "skipped"; reason: "disabled" | "not_configured" | "duplicate" | "invalid_recipient" }
  | { status: "failed"; errorCode: string };

/** What a concrete provider (Kavenegar, Melipayamak, ...) must implement. It receives the final text. */
export interface SmsProvider {
  /** Lower-case id used in SMS_PROVIDER and in the outbox, e.g. "kavenegar". */
  readonly id: string;
  /** Sends one message. Must not throw for provider rejections: return a failed outcome with a short error code. */
  send(message: { to: string; text: string; idempotencyKey: string }): Promise<SmsOutcome>;
}

/** Persistence of delivery state (status, error code, timestamps) and duplicate protection. */
export interface SmsOutbox {
  /**
   * Reserves the key. Returns false when this key was already reserved (duplicate), so the caller must not send.
   * The record keeps template, masked recipient and status only: never the text, links or codes.
   */
  reserve(entry: { idempotencyKey: string; template: SmsTemplate; recipientUserId?: string; recipientMasked: string; provider: string }): Promise<boolean>;
  /** Records the final outcome of a reserved key. */
  complete(idempotencyKey: string, outcome: SmsOutcome): Promise<void>;
}
