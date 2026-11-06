import "server-only";
import { isIP } from "node:net";

// The only headers that may carry the client IP. They are set by the infrastructure in front of the app
// (Cloudflare, or nginx with `proxy_set_header X-Real-IP $remote_addr`), which overwrites anything the visitor
// sends. "x-forwarded-for" is deliberately NOT allowed: its first entry is client-controlled.
const ALLOWED_HEADERS = ["cf-connecting-ip", "x-real-ip"] as const;

// Expands an IPv6 address to its eight groups, or returns null when it is malformed.
function expandIpv6(ip: string): string[] | null {
  const [head, tail, ...rest] = ip.split("::");
  if (rest.length > 0) return null;
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const missing = 8 - headGroups.length - tailGroups.length;
  if (tail === undefined ? missing !== 0 : missing < 1) return null;
  return [...headGroups, ...Array<string>(tail === undefined ? 0 : missing).fill("0"), ...tailGroups].map((group) =>
    group.toLowerCase().padStart(4, "0"),
  );
}

/**
 * The visitor's IP, taken only from the header named in TRUSTED_IP_HEADER (one of ALLOWED_HEADERS).
 * Returns null when it is not configured or the value is not a single valid IP, so callers can skip IP-based
 * limits instead of trusting arbitrary input. IPv6 addresses are reduced to their /64 network, because a single
 * visitor controls a whole /64 and could otherwise rotate addresses to dodge limits.
 */
export function getTrustedClientIp(headers: Headers): string | null {
  const name = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (!name || !(ALLOWED_HEADERS as readonly string[]).includes(name)) return null;

  const value = headers.get(name)?.trim();
  if (!value || isIP(value) === 0) return null;
  if (isIP(value) === 4) return value;

  const groups = expandIpv6(value);
  return groups ? `${groups.slice(0, 4).join(":")}::/64` : null;
}
