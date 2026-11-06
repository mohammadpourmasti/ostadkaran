import type { PublicVerificationLevel } from "./types";

/*
 * Publication rules for error codes. Every public path (category pages, search API, sitemap) goes through
 * the data layer in ./queries.ts, which applies these rules; nothing public reads the table directly.
 *
 *   verified            shown in full, its detail page may be indexed
 *   partially_verified  shown with a visible badge, its detail page may be indexed (the badge keeps it from being
 *                       presented as a definitive answer)
 *   unverified          never shown, never searchable, never indexed
 * Only published rows reach this layer at all (see ./queries.ts), so "published" is implied below.
 */
export const PUBLIC_VERIFICATION_LEVELS = ["verified", "partially_verified"] as const satisfies readonly PublicVerificationLevel[];

export function isPubliclyVisible(level: string): level is PublicVerificationLevel {
  return (PUBLIC_VERIFICATION_LEVELS as readonly string[]).includes(level);
}

// A detail page is indexable exactly when its record is public (published + verified or partially verified).
export function isCodeIndexable(level: string): boolean {
  return isPubliclyVisible(level);
}

// A category page is indexable only when it has enough public content; thin pages stay out of search results.
// Tune this one number if the threshold needs to change.
export const MIN_PUBLIC_CODES_FOR_INDEX = 3;

export function isCategoryIndexable(rows: readonly { verification_level: string }[]): boolean {
  return rows.filter((row) => isPubliclyVisible(row.verification_level)).length >= MIN_PUBLIC_CODES_FOR_INDEX;
}

/**
 * What a category page may show. One function decides both the indexing and the content, so they cannot drift:
 *   page with >= MIN_PUBLIC_CODES_FOR_INDEX public rows  -> indexable
 *   any other page                                       -> noindex
 * Both cases show every public row (verified + partially verified), each with its verification badge.
 * "unverified" (and anything unknown) is never returned, even if a caller passes it in.
 */
export function selectCategoryPageRows<T extends { verification_level: string }>(
  rows: readonly T[],
): { indexable: boolean; rows: T[] } {
  const visible = rows.filter((row) => isPubliclyVisible(row.verification_level));
  const indexable = isCategoryIndexable(visible);
  return { indexable, rows: visible };
}
