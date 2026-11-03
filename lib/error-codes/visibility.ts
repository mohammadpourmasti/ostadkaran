import type { PublicVerificationLevel } from "./types";

/*
 * Publication rules for error codes. Every public path (category pages, search API, sitemap) goes through
 * the data layer in ./queries.ts, which applies these rules; nothing public reads the table directly.
 *
 *   verified            shown in full, may be indexed (given enough content, see below)
 *   partially_verified  shown only with a visible badge, never indexed, never presented as a definitive answer
 *   unverified          never shown, never searchable, never indexed
 */
export const PUBLIC_VERIFICATION_LEVELS = ["verified", "partially_verified"] as const satisfies readonly PublicVerificationLevel[];

export function isPubliclyVisible(level: string): level is PublicVerificationLevel {
  return (PUBLIC_VERIFICATION_LEVELS as readonly string[]).includes(level);
}

// A category page is indexable only when it has enough verified content; thin pages stay out of search results.
// Tune this one number if the threshold needs to change.
export const MIN_VERIFIED_CODES_FOR_INDEX = 3;

export function isCategoryIndexable(rows: readonly { verification_level: string }[]): boolean {
  return rows.filter((row) => row.verification_level === "verified").length >= MIN_VERIFIED_CODES_FOR_INDEX;
}

/**
 * What a category page may show. One function decides both the indexing and the content, so they cannot drift:
 *   indexable page (>= MIN_VERIFIED_CODES_FOR_INDEX verified)  -> verified rows only
 *   any other page (noindex)                                   -> verified + partially verified, each with its badge
 * "unverified" (and anything unknown) is never returned, even if a caller passes it in.
 */
export function selectCategoryPageRows<T extends { verification_level: string }>(
  rows: readonly T[],
): { indexable: boolean; rows: T[] } {
  const visible = rows.filter((row) => isPubliclyVisible(row.verification_level));
  const indexable = isCategoryIndexable(visible);
  return { indexable, rows: indexable ? visible.filter((row) => row.verification_level === "verified") : visible };
}
