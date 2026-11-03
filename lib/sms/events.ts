import "server-only";

import { sendSms } from "./service";
import type { SmsOutcome } from "./types";

// Named business events -> SMS requests. The staff-management code calls these helpers and never knows which
// provider (if any) is behind them. Every helper returns an outcome and never throws.

export function notifyTechnicianInvited(input: { userId: string; phone: string; name: string; link: string; inviteId: string }): Promise<SmsOutcome> {
  return sendSms({
    template: "technician_invite",
    to: input.phone,
    params: { name: input.name, link: input.link },
    idempotencyKey: `technician_invite:${input.userId}:${input.inviteId}`,
    recipientUserId: input.userId,
  });
}

export function notifyPasswordLink(input: { userId: string; phone: string; link: string; requestId: string }): Promise<SmsOutcome> {
  return sendSms({
    template: "password_reset_link",
    to: input.phone,
    params: { link: input.link },
    idempotencyKey: `password_reset_link:${input.userId}:${input.requestId}`,
    recipientUserId: input.userId,
  });
}

export function notifyAssignment(input: {
  technicianId: string;
  phone: string;
  applianceLabel: string;
  requestId: string;
  assignedAt: string;
  kind: "new" | "changed";
}): Promise<SmsOutcome> {
  return sendSms({
    template: input.kind === "new" ? "assignment_new" : "assignment_changed",
    to: input.phone,
    params: { appliance: input.applianceLabel },
    idempotencyKey: `assignment_${input.kind}:${input.requestId}:${input.technicianId}:${input.assignedAt}`,
    recipientUserId: input.technicianId,
  });
}
