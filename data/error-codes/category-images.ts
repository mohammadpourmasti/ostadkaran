// Photos for the error-code category cards. Only categories that have a real, suitable file are listed; any
// other category uses the graphic fallback instead of a photo.
// NOTE: stove.jpg shows an electric range, while the category is "gas stove and oven", so the card uses
// stove.png instead. The files are the originals in /public; nothing is renamed or converted.
export type CategoryImage = {
  src: string;
  width: number;
  height: number;
  /** CSS object-position that keeps the appliance in view when the image is cropped to a wide, short strip. */
  position: string;
};

export const categoryImages: Readonly<Record<string, CategoryImage>> = {
  "washing-machine": { src: "/images/error-codes/washing-machine.jpg", width: 1584, height: 672, position: "30% 50%" },
  refrigerator: { src: "/images/error-codes/refrigerator.jpg", width: 1584, height: 672, position: "63% 50%" },
  dishwasher: { src: "/images/error-codes/dishwasher.jpg", width: 1584, height: 672, position: "35% 50%" },
  "vacuum-cleaner": { src: "/images/error-codes/vacuum-cleaner.jpg", width: 1376, height: 768, position: "38% 60%" },
  "air-conditioner": { src: "/images/error-codes/air-conditioner.jpg", width: 1376, height: 768, position: "26% 40%" },
  // 3:2 photo shown in a 16:9 card: cropped vertically, keeping the screen and stand in view.
  television: { src: "/images/error-codes/television.png", width: 1536, height: 1024, position: "50% 42%" },
  stove: { src: "/images/error-codes/stove.png", width: 1672, height: 941, position: "50% 50%" },
  other: { src: "/images/error-codes/other-appliances.jpg", width: 1920, height: 1088, position: "50% 50%" },
};

// Brand-palette gradient per category, used behind the graphic fallback.
export const categoryGradients: Readonly<Record<string, string>> = {
  "washing-machine": "from-sky-100 to-cyan-50",
  refrigerator: "from-blue-100 to-slate-50",
  dishwasher: "from-teal-100 to-emerald-50",
  television: "from-violet-100 to-indigo-50",
  stove: "from-orange-100 to-amber-50",
  "vacuum-cleaner": "from-cyan-100 to-sky-50",
  "air-conditioner": "from-blue-100 to-cyan-50",
  other: "from-slate-100 to-indigo-50",
};

// Wide banners for the category pages only (/error-codes/[category]); each file is used by its own category.
// Files live in /public/images/banners and are the originals (not renamed or converted). The title block sits
// on the banner from lg up (text on the empty right side, appliance on the left) and below a fade on smaller
// screens; the image is cropped by CSS only. The appliance sits
// on the left of every banner, so `objectClass` anchors the crop there per breakpoint (Tailwind needs the full
// class names written out). `accent` tints the bottom edge of the banner with the appliance's own colour.
export type CategoryBanner = {
  src: string;
  width: number;
  height: number;
  objectClass: string;
  accent: string;
};

export const categoryBanners: Readonly<Record<string, CategoryBanner>> = {
  "washing-machine": { src: "/images/banners/washing-machine-error-banner.jpg", width: 2064, height: 512, objectClass: "[object-position:10%_50%]", accent: "border-b-sky-400" },
  refrigerator: { src: "/images/banners/refrigerator-error-banner.jpg", width: 2064, height: 512, objectClass: "[object-position:10%_50%]", accent: "border-b-blue-400" },
  // 1376x768 (16:9): shown whole on phones; on wider frames it is cropped vertically, keeping the appliance's top.
  dishwasher: { src: "/images/banners/dishwasher-error-banner.jpg", width: 1376, height: 768, objectClass: "[object-position:0%_50%] sm:[object-position:0%_70%] lg:[object-position:0%_62%]", accent: "border-b-teal-400" },
  television: { src: "/images/banners/television-error-banner.jpg", width: 2064, height: 512, objectClass: "[object-position:15%_50%]", accent: "border-b-violet-400" },
  stove: { src: "/images/banners/stove-error-banner.jpg", width: 2064, height: 512, objectClass: "[object-position:18%_50%]", accent: "border-b-orange-400" },
  "vacuum-cleaner": { src: "/images/banners/vacuum-cleaner-error-banner.jpg", width: 2064, height: 512, objectClass: "[object-position:15%_50%]", accent: "border-b-cyan-400" },
  "air-conditioner": { src: "/images/banners/air-conditioner-error-banner.jpg", width: 2064, height: 512, objectClass: "[object-position:11%_50%]", accent: "border-b-indigo-400" },
  other: { src: "/images/banners/other-appliances-error-banner.jpg", width: 2064, height: 512, objectClass: "[object-position:5%_50%]", accent: "border-b-slate-400" },
};
