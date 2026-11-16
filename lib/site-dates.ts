// Real "last meaningful content change" dates for the static pages, used as sitemap `lastModified`.
// Do NOT replace these with `new Date()`: a date that changes on every request tells search engines nothing.
// Update the matching entry when the page's visible content changes. Error-code pages take theirs from the
// database (`updated_at`).
export const contentDates = {
  home: new Date("2026-11-15"),
  services: new Date("2026-11-15"),
  founder: new Date("2026-11-07"),
} as const;
