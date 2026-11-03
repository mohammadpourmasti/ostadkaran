import { compactSearchText, searchTokens } from "./normalize";

// Limits that keep one search request cheap no matter what the caller sends.
export const MAX_QUERY_LENGTH = 64;
export const MAX_QUERY_TOKENS = 6;
export const MAX_RESULTS = 20;
// Length of the compact form ("e 24" -> "e24"); one character matches far too much.
export const MIN_QUERY_LENGTH = 2;

export type SearchableFields = {
  error_code: string;
  model: string | null;
  model_reference: string | null;
  title: string;
  meaning: string;
};

// Pre-normalised copy of one row; built once per index refresh, not per request.
export type SearchEntry<T> = {
  item: T;
  code: string;
  models: string[];
  brands: string[];
  categories: string[];
  titleWords: string[];
  meaningWords: string[];
};

export function buildSearchEntry<T extends SearchableFields>(
  item: T,
  terms: { brandTerms: readonly string[]; categoryTerms: readonly string[] },
): SearchEntry<T> {
  return {
    item,
    code: compactSearchText(item.error_code),
    models: [item.model, item.model_reference].filter((value): value is string => Boolean(value)).map(compactSearchText),
    brands: [...terms.brandTerms],
    categories: [...terms.categoryTerms],
    titleWords: searchTokens(item.title),
    meaningWords: searchTokens(item.meaning),
  };
}

export type PreparedQuery = { compact: string; tokens: string[] };

/** Applies the length limits and normalisation; returns null when the query is too short to search. */
export function prepareQuery(raw: string): PreparedQuery | null {
  const tokens = searchTokens(raw.slice(0, MAX_QUERY_LENGTH)).slice(0, MAX_QUERY_TOKENS);
  const compact = tokens.join("");
  if (compact.length < MIN_QUERY_LENGTH) return null;
  return { compact, tokens };
}

// Best score of one query word against one entry; 0 means the word matches nothing.
// Order of importance: code > model > brand > category > title > description.
function tokenScore<T>(entry: SearchEntry<T>, token: string): number {
  let best = 0;

  if (entry.code === token) best = 1000;
  else if (entry.code.startsWith(token)) best = 800;
  else if (entry.code.includes(token)) best = 600;

  for (const model of entry.models) {
    if (model === token) best = Math.max(best, 450);
    else if (model.startsWith(token)) best = Math.max(best, 400);
    else if (model.includes(token)) best = Math.max(best, 350);
  }

  for (const brand of entry.brands) {
    if (brand === token) best = Math.max(best, 400);
    else if (brand.startsWith(token)) best = Math.max(best, 350);
    else if (brand.includes(token)) best = Math.max(best, 300);
  }

  for (const category of entry.categories) {
    if (category.includes(token)) best = Math.max(best, 250);
  }

  for (const word of entry.titleWords) {
    if (word === token) best = Math.max(best, 220);
    else if (word.startsWith(token)) best = Math.max(best, 200);
  }

  for (const word of entry.meaningWords) {
    if (word.startsWith(token)) best = Math.max(best, 100);
  }

  return best;
}

/**
 * Searches pre-built entries. Every query word must match something in the row; rows are ranked by exact code
 * match, then code prefix, then partial matches, and ties keep the incoming (brand, code) order.
 */
export function searchEntries<T>(
  entries: readonly SearchEntry<T>[],
  rawQuery: string,
  limit: number = MAX_RESULTS,
): { results: T[]; total: number } {
  const query = prepareQuery(rawQuery);
  if (!query) return { results: [], total: 0 };

  const scored: { score: number; index: number; item: T }[] = [];

  entries.forEach((entry, index) => {
    let score = 0;
    for (const token of query.tokens) {
      const tokenResult = tokenScore(entry, token);
      if (tokenResult === 0) return;
      score += tokenResult;
    }
    // "e 24" is several words but one code: reward rows whose whole code equals the joined query.
    if (query.tokens.length > 1) {
      if (entry.code === query.compact) score += 500;
      else if (entry.code.startsWith(query.compact)) score += 250;
    }
    scored.push({ score, index, item: entry.item });
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  return { results: scored.slice(0, Math.max(0, limit)).map((entry) => entry.item), total: scored.length };
}
