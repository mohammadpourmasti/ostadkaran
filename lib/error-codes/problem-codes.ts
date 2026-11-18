import "server-only";

import type { ProblemCodeRef, ProblemPage } from "@/types/service";
import { getPublishedErrorCodes, type PublishedErrorCode } from "./queries";

export type ProblemCodeEntry = { row: PublishedErrorCode; ref: ProblemCodeRef };

/**
 * The public error-code rows that belong to a problem page, in the order of `codeRefs`.
 * Rows come only from getPublishedErrorCodes (published + verified or partially verified), matched by exact
 * brand + error_code, and by the stored model when the reference is limited to one model. Each brand + code appears
 * once. A database problem returns an empty list (the page then has no code section and is not indexable) instead of
 * breaking the page.
 */
export async function getProblemCodes(problem: ProblemPage): Promise<ProblemCodeEntry[]> {
  let rows: PublishedErrorCode[];
  try {
    rows = await getPublishedErrorCodes(problem.serviceId);
  } catch {
    return [];
  }

  const result: ProblemCodeEntry[] = [];
  const seen = new Set<string>();
  for (const ref of problem.codeRefs) {
    const key = `${ref.brand}|${ref.code}`;
    if (seen.has(key)) continue;
    const row = rows.find(
      (item) =>
        item.brand === ref.brand &&
        item.error_code === ref.code &&
        (ref.model === undefined || item.model === ref.model),
    );
    if (row) {
      seen.add(key);
      result.push({ row, ref });
    }
  }
  return result;
}

// Only official and limited codes count towards the indexing minimum; "needs-review" codes are shown but not counted.
export function countIndexableCodes(entries: readonly ProblemCodeEntry[]): number {
  return entries.filter((entry) => entry.ref.tier !== "needs-review").length;
}
