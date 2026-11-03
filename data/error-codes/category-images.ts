// Photos for the error-code category cards and banners. Only categories that have a real, suitable file are
// listed; everything else (television, other, and stove for now) uses the graphic fallback instead of a photo.
// NOTE: stove.jpg exists but shows an electric range, while the category is "gas stove and oven", so it is
// deliberately not used. The files are the originals in /public; nothing is renamed or converted.
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
