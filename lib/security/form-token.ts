import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// A form token proves that the form was really loaded from this server, and when. It is signed with a key derived
// from the existing server-only Supabase secret, so no new setting is needed and the client cannot forge or
// back-date it (the old `startedAt` was just a number the browser chose).
const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;
const MAX_USES = 5; // a visitor may fix field errors and resubmit with the same token a few times

export type TokenCheck = "ok" | "invalid" | "too_fast" | "expired";

function signingKey(): string {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("Form token key is not configured.");
  return `ostadkaran:repair-form:v1:${secret}`;
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function issueFormToken(now = Date.now()): string {
  const payload = `${now}.${randomBytes(9).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

const globalUses = globalThis as unknown as { __formTokenUses?: Map<string, number> };
const uses: Map<string, number> = (globalUses.__formTokenUses ??= new Map());

/** Checks signature and age. With `consume`, also counts this use (and rejects a token used too often). */
export function verifyFormToken(token: string, { consume = false, now = Date.now() } = {}): TokenCheck {
  const parts = token.split(".");
  if (parts.length !== 3) return "invalid";
  const [issued, nonce, signature] = parts;
  const expected = Buffer.from(sign(`${issued}.${nonce}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";

  const age = now - Number(issued);
  if (!Number.isFinite(age) || age < 0) return "invalid";
  if (age < MIN_AGE_MS) return "too_fast";
  if (age > MAX_AGE_MS) return "expired";

  if (consume) {
    const count = (uses.get(nonce) ?? 0) + 1;
    if (count > MAX_USES) return "invalid";
    if (uses.size > 50_000) uses.clear(); // bounded; worst case a token regains its uses after a flood
    uses.set(nonce, count);
  }
  return "ok";
}
