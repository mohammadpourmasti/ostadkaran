export type BrandLogo = {
  src: string;
  /** Intrinsic size, used only to reserve the aspect ratio. */
  width: number;
  height: number;
};

export type Brand = {
  /** Persian display name; also the value stored for the repair-request brand field. */
  name: string;
  /** Genuine brand logo stored locally. Absent when none has been sourced: the card shows the name only. */
  logo?: BrandLogo;
};

/**
 * Brands the owner has CONFIRMED the business repairs. This is a statement about repair service only,
 * not about dealership, partnership or brand authorization. Logos are the brands' own artwork (Wikimedia
 * Commons or the brands' official sites), shown solely to identify the brand; never redraw or alter them.
 * Single source for the homepage section and the repair-request brand select.
 */
export const confirmedBrands: readonly Brand[] = [
  { name: "سامسونگ", logo: { src: "/images/brands/samsung.svg", width: 7051, height: 1080 } },
  { name: "ال‌جی", logo: { src: "/images/brands/lg.svg", width: 600, height: 275 } },
  { name: "بوش", logo: { src: "/images/brands/bosch.svg", width: 433, height: 97 } },
  { name: "زیمنس", logo: { src: "/images/brands/siemens.svg", width: 210, height: 50 } },
  { name: "دوو", logo: { src: "/images/brands/daewoo.svg", width: 192, height: 192 } },
  { name: "اسنوا", logo: { src: "/images/brands/snowa.svg", width: 450, height: 348 } },
  { name: "پاکشوما", logo: { src: "/images/brands/pakshoma.svg", width: 222, height: 36 } },
  { name: "آبسال", logo: { src: "/images/brands/absal.png", width: 176, height: 47 } },
  { name: "امرسان", logo: { src: "/images/brands/emersun.png", width: 495, height: 150 } },
  { name: "هیمالیا", logo: { src: "/images/brands/himalia.png", width: 200, height: 57 } },
  { name: "الکترواستیل", logo: { src: "/images/brands/electro-steel.png", width: 147, height: 47 } },
  { name: "ایکس‌ویژن", logo: { src: "/images/brands/x-vision.png", width: 480, height: 90 } },
  { name: "تی‌سی‌ال", logo: { src: "/images/brands/tcl.svg", width: 1000, height: 596 } },
  { name: "ایندزیت", logo: { src: "/images/brands/indesit.svg", width: 134, height: 37 } },
  { name: "پارس‌خزر", logo: { src: "/images/brands/pars-khazar.png", width: 336, height: 75 } },
  { name: "آریستون", logo: { src: "/images/brands/ariston.svg", width: 220, height: 59 } },
  { name: "توشیبا", logo: { src: "/images/brands/toshiba.svg", width: 800, height: 122 } },
  // TODO: no verified genuine G Plus logo has been sourced yet; add `logo` once the owner supplies one.
  { name: "جی‌پلاس" },
];

// Generic choices that make no brand claim.
export const BRAND_OTHER = "other";
export const BRAND_UNKNOWN = "unknown";

// Single source for the repair-request brand select (and its server-side validation).
// The empty value ("no brand chosen") is also accepted: the brand field is optional for now.
export const brandOptions: readonly { value: string; label: string }[] = [
  ...confirmedBrands.map((brand) => ({ value: brand.name, label: brand.name })),
  { value: BRAND_OTHER, label: "سایر" },
  { value: BRAND_UNKNOWN, label: "برند دستگاه را نمی‌دانم" },
];
