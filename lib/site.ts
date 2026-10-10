// Site-wide identity used by metadata, robots.txt and sitemap.xml.

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  // Vercel system variable (hostname only) for production deployments.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

// Builds both forms from one local number, e.g. "08634859005". `groups` splits the display digits.
function phoneNumber(local: string, groups: readonly number[]) {
  let offset = 0;
  const parts = groups.map((size) => {
    const part = local.slice(offset, offset + size);
    offset += size;
    return part;
  });
  return {
    href: `tel:+98${local.slice(1)}`,
    display: toPersianDigits(parts.join("-")),
    local,
  };
}

const mobile = phoneNumber("09188635854", [4, 3, 4]);
// Landlines keep their previously configured display format.
const landlines = [
  phoneNumber("08634859005", [3, 8]),
  phoneNumber("08634859006", [3, 8]),
  phoneNumber("08633252085", [3, 8]),
];

// The client's mobile number is the primary direct-call number (every call CTA uses `contact.phone`);
// the three business landlines stay published beside it.
const phones = [mobile, ...landlines];

export const siteConfig = {
  name: "استادکاران",
  title: "استادکاران | تعمیر و نصب لوازم خانگی در اراک و استان مرکزی",
  description:
    "استادکاران با ۳۲ سال سابقه، تعمیر و نصب لوازم خانگی ایرانی و خارجی در اراک و استان مرکزی، با ضمانت کتبی ۶ ماهه و اعلام هزینه پیش از تعمیر.",
  locale: "fa_IR",
  url: resolveSiteUrl(),
  business: {
    city: "اراک",
    region: "استان مرکزی",
    address: "اراک، پردیس یک، خیابان مددی، کوچه مرادی",
    hours: "۸ صبح تا ۱۰ شب",
    duty: "کشیک شب و تعطیلات",
    experienceYears: "۳۲",
    warranty: "ضمانت کتبی ۶ ماهه",
  },
  contact: {
    phone: phones[0],
    phones,
  },
  links: {
    // Every repair CTA links here. Online submission is not connected yet (see components/repair-request).
    repairRequest: "/repair-request",
  },
} as const;
