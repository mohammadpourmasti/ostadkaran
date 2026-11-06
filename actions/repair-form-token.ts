"use server";

import { headers } from "next/headers";
import { getTrustedClientIp } from "@/lib/security/client-ip";
import { issueFormToken } from "@/lib/security/form-token";
import { takeRateLimit } from "@/lib/security/rate-limit";

// Hands the repair-request form a signed token (see lib/security/form-token.ts). Cheap, but still limited per
// network so it cannot be used to mint tokens in bulk. Failure is silent for the visitor: the form then reports
// that it needs to be refreshed if they submit without a token.
export async function issueRepairFormToken(): Promise<{ token: string | null }> {
  const ip = getTrustedClientIp(await headers());
  if (ip && !takeRateLimit(`token:${ip}`, 40, 10 * 60 * 1000)) return { token: null };

  try {
    return { token: issueFormToken() };
  } catch {
    return { token: null };
  }
}
