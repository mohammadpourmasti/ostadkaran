import "server-only";

import { confirmedBrands } from "@/data/brands";
import { errorCodeCategories } from "@/data/error-codes/categories";
import { compactSearchText } from "./normalize";
import { getPublishedErrorCodes } from "./queries";
import { buildSearchEntry, searchEntries, type SearchEntry } from "./search";
import type { ErrorCodeSearchItem } from "./types";

// The index is rebuilt at most once per TTL, so a search request never reads the whole table.
const INDEX_TTL_MS = 60_000;

// Latin spelling -> Persian display name, so both "bosch" and "بوش" find the same rows.
const brandAliasPairs: [string, string][] = [
  ["bosch", "بوش"],
  ["lg", "ال‌جی"],
  ["samsung", "سامسونگ"],
  ["siemens", "زیمنس"],
  ["daewoo", "دوو"],
  ["snowa", "اسنوا"],
  ["pakshoma", "پاکشوما"],
  ["xvision", "ایکس‌ویژن"],
  ["x-vision", "ایکس‌ویژن"],
  ["absal", "آبسال"],
  ["emersun", "امرسان"],
  ["himalia", "هیمالیا"],
  ["electrosteel", "الکترواستیل"],
  ["tcl", "تی‌سی‌ال"],
  ["indesit", "ایندزیت"],
  ["parskhazar", "پارس‌خزر"],
  ["ariston", "آریستون"],
  ["toshiba", "توشیبا"],
];

const brandAliases = new Map<string, string>(
  brandAliasPairs.filter(([, persian]) => confirmedBrands.some((brand) => brand.name === persian)),
);

type Index = { builtAt: number; entries: SearchEntry<ErrorCodeSearchItem>[] };

let cached: Index | null = null;
let pending: Promise<Index> | null = null;

async function buildIndex(): Promise<Index> {
  const rows = await getPublishedErrorCodes();

  const entries = rows.map((row) => {
    const brandKey = compactSearchText(row.brand);
    const persianBrand = brandAliases.get(brandKey);
    const category = errorCodeCategories.find((item) => item.id === row.appliance_category);

    const item: ErrorCodeSearchItem = {
      id: row.id,
      appliance_category: row.appliance_category,
      brand: row.brand,
      model: row.model,
      model_reference: row.model_reference,
      error_code: row.error_code,
      title: row.title,
      meaning: row.meaning,
      verification_level: row.verification_level === "verified" ? "verified" : "partially_verified",
    };

    return buildSearchEntry(item, {
      brandTerms: [brandKey, ...(persianBrand ? [compactSearchText(persianBrand)] : [])],
      categoryTerms: category ? [compactSearchText(category.title), ...category.keywords.map(compactSearchText)] : [],
    });
  });

  return { builtAt: Date.now(), entries };
}

async function getIndex(): Promise<Index> {
  if (cached && Date.now() - cached.builtAt < INDEX_TTL_MS) return cached;
  // Concurrent requests share one rebuild.
  pending ??= buildIndex()
    .then((index) => {
      cached = index;
      return index;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

export async function searchPublishedErrorCodes(query: string): Promise<ErrorCodeSearchItem[]> {
  const index = await getIndex();
  return searchEntries(index.entries, query).results;
}
