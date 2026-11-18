import "server-only";

import { getPublishedErrorCodes, type PublishedErrorCode } from "./queries";

// Verified rows first, then partially verified; stable otherwise.
function byVerification(a: PublishedErrorCode, b: PublishedErrorCode) {
  return Number(b.verification_level === "verified") - Number(a.verification_level === "verified");
}

// Never throws: a database problem must not break a service or code page, it just hides the optional link block.
async function safeCodes(category: string): Promise<PublishedErrorCode[]> {
  try {
    return await getPublishedErrorCodes(category);
  } catch {
    return [];
  }
}

/**
 * A few representative public codes for a service page: verified first, one per brand before any brand repeats,
 * and never two rows with the same brand + code.
 */
export async function getServiceErrorCodeLinks(category: string, limit = 6): Promise<PublishedErrorCode[]> {
  const rows = (await safeCodes(category)).slice().sort(byVerification);
  const seen = new Set<string>();
  const unique = rows.filter((row) => {
    const key = `${row.brand}|${row.error_code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const picked: PublishedErrorCode[] = [];
  const brands = new Set<string>();
  for (const row of unique) {
    if (picked.length >= limit) break;
    if (!brands.has(row.brand)) {
      brands.add(row.brand);
      picked.push(row);
    }
  }
  for (const row of unique) {
    if (picked.length >= limit) break;
    if (!picked.includes(row)) picked.push(row);
  }
  return picked;
}

/** Other public codes of the same device category for a code page; same brand first, never the current code. */
export async function getRelatedErrorCodes(current: PublishedErrorCode, limit = 4): Promise<PublishedErrorCode[]> {
  const rows = await safeCodes(current.appliance_category);
  const seen = new Set<string>([`${current.brand}|${current.error_code}`]);
  return rows
    .filter((row) => row.id !== current.id)
    .sort((a, b) => Number(b.brand === current.brand) - Number(a.brand === current.brand) || byVerification(a, b))
    .filter((row) => {
      const key = `${row.brand}|${row.error_code}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
