import "server-only";

import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { VerificationLevel } from "./types";
import { PUBLIC_VERIFICATION_LEVELS, isPubliclyVisible } from "./visibility";

export type PublishedErrorCode = {
  id: string;
  appliance_category: string;
  brand: string;
  model: string | null;
  model_reference: string | null;
  error_code: string;
  title: string;
  meaning: string;
  possible_causes: string[];
  safe_steps: string[];
  source_name: string | null;
  source_url: string | null;
  verification_level: VerificationLevel;
  updated_at: string | null;
};

const publishedColumns =
  "id, appliance_category, brand, model, model_reference, error_code, title, meaning, possible_causes, safe_steps, source_name, source_url, verification_level, updated_at";

/**
 * The single public read path for error codes. It returns only rows that are published AND verified or
 * partially verified; "unverified" rows never leave this function (category pages, search and sitemap all
 * rely on that). A failed query throws instead of returning an empty list, so a database problem can never
 * look like "no codes exist" (and never gets cached or indexed as an empty page).
 */
async function loadPublishedErrorCodes(category?: string): Promise<PublishedErrorCode[]> {
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("error_codes")
    .select(publishedColumns)
    .eq("status", "published")
    .in("verification_level", [...PUBLIC_VERIFICATION_LEVELS])
    .order("brand", { ascending: true })
    .order("error_code", { ascending: true });

  if (category) {
    query = query.eq("appliance_category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load published error codes:", error.message);
    throw new Error("error_codes_query_failed");
  }

  // Defence in depth: even if the filter above is ever changed, unverified rows are dropped here.
  return ((data ?? []) as PublishedErrorCode[]).filter((row) => isPubliclyVisible(row.verification_level));
}

// Deduplicates identical reads within one render (page + generateMetadata).
export const getPublishedErrorCodes = cache(loadPublishedErrorCodes);
