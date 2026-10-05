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

export const siteConfig = {
  name: "استادکاران",
  title: "استادکاران | تعمیر لوازم خانگی در اراک",
  description: "استادکاران، خدمات تعمیر لوازم خانگی در شهر اراک.",
  locale: "fa_IR",
  url: resolveSiteUrl(),
} as const;
