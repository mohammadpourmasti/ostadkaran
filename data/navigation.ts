export type NavItem = {
  label: string;
  href: string;
};

// Homepage section ids. Every section and every link below must use these.
export const sectionIds = {
  services: "services",
  repairProcess: "repair-process",
  about: "about",
  serviceAreas: "service-areas",
  faq: "faq",
  contact: "contact",
} as const;

// Header and mobile menu. The logo already links home, so there is no separate "خانه" item.
// Hash links start with "/" so they also work from other pages (e.g. /repair-request).
export const mainNavigation: readonly NavItem[] = [
  { label: "خدمات", href: `/#${sectionIds.services}` },
  { label: "مراحل تعمیر", href: `/#${sectionIds.repairProcess}` },
  { label: "درباره ما", href: `/#${sectionIds.about}` },
  { label: "سوالات متداول", href: `/#${sectionIds.faq}` },
  { label: "تماس با ما", href: `/#${sectionIds.contact}` },
];

// Footer: the main items plus sections that are too minor for the header.
export const footerNavigation: readonly NavItem[] = [
  ...mainNavigation.slice(0, 3),
  { label: "مناطق خدمات", href: `/#${sectionIds.serviceAreas}` },
  ...mainNavigation.slice(3),
  { label: "درخواست تعمیر", href: "/repair-request" },
];
