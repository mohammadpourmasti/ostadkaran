// Text normalisation for searching Persian and English error-code content. Pure and dependency-free,
// so the same rules run in the API route and in Client Components.

const PERSIAN_DIGITS = /[۰-۹]/g;
const ARABIC_INDIC_DIGITS = /[٠-٩]/g;
// Diacritics, tatweel and invisible direction/format marks carry no meaning for search.
const IGNORABLE = /[ً-ٰٟـ​‍‎‏‪-‮⁦-⁩؜﻿]/g;
// Anything that only separates words or characters: whitespace, ZWNJ, dashes, dots and common punctuation.
const SEPARATORS = /[\s‌ ‐-―\-_.,:;/\\|()[\]{}'"`~!@#$%^&*+=<>?،؛؟«»]+/g;

const LETTER_MAP: Record<string, string> = {
  "ي": "ی", // Arabic yeh -> Persian yeh
  "ى": "ی", // alef maksura -> Persian yeh
  "ك": "ک", // Arabic kaf -> Persian keheh
  "ة": "ه", // teh marbuta -> heh
  "ۀ": "ه", // heh with yeh above -> heh
  "أ": "ا", // alef with hamza above -> alef
  "إ": "ا", // alef with hamza below -> alef
  "ٱ": "ا", // alef wasla -> alef
};

/**
 * Lower-cases, folds Arabic/Persian letter variants and digits to one form, drops diacritics, and turns every
 * separator into a single space. "E-24", "e 24" and "۴" / "٤" all end up comparable.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(PERSIAN_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(ARABIC_INDIC_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[يىكةۀأإٱ]/g, (letter) => LETTER_MAP[letter] ?? letter)
    .toLowerCase()
    .replace(IGNORABLE, "")
    .replace(SEPARATORS, " ")
    .trim();
}

/** Normalised text with every separator removed: "E-24", "e 24" and "E24" all become "e24". */
export function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/ /g, "");
}

/** Normalised words (separator-split), used for matching titles and descriptions word by word. */
export function searchTokens(value: string): string[] {
  const normalized = normalizeSearchText(value);
  return normalized ? normalized.split(" ") : [];
}
