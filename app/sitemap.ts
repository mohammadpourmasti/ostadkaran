import type { MetadataRoute } from "next";
import { errorCodeCategories } from "@/data/error-codes/categories";
import { servicePath, services } from "@/data/services";
import { getPublishedErrorCodes } from "@/lib/error-codes/queries";
import { selectCategoryPageRows } from "@/lib/error-codes/visibility";
import { siteConfig } from "@/lib/site";

// Re-evaluated at most every 5 minutes; the error-code entries come from the database.
export const revalidate = 300;

function latest(dates: (string | null)[]): Date | undefined {
  const times = dates.filter((d): d is string => Boolean(d)).map((d) => new Date(d).getTime()).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : undefined;
}

// Only the hub and category pages that pass the indexing rule (enough verified content) are listed.
// Partially verified and unverified rows never influence the sitemap. If the database is unreachable the
// error-code entries are left out for this run rather than failing the whole sitemap.
async function errorCodeEntries(): Promise<MetadataRoute.Sitemap> {
  let rows;
  try {
    rows = await getPublishedErrorCodes();
  } catch {
    return [];
  }

  const verified = rows.filter((row) => row.verification_level === "verified");
  const categoryEntries = errorCodeCategories.flatMap((category) => {
    // Same rule as the page itself: listed only when the page is indexable, dated by its verified rows.
    const page = selectCategoryPageRows(rows.filter((row) => row.appliance_category === category.id));
    if (!page.indexable) return [];
    return [
      {
        url: `${siteConfig.url}/error-codes/${category.id}`,
        lastModified: latest(page.rows.map((row) => row.updated_at)),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ];
  });

  // The hub is a real page on its own; list it once there is at least one verified code behind it.
  if (verified.length === 0) return [];

  return [
    {
      url: `${siteConfig.url}/error-codes`,
      lastModified: latest(verified.map((row) => row.updated_at)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...categoryEntries,
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}${siteConfig.links.repairRequest}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...services.map((service) => ({
      url: `${siteConfig.url}${servicePath(service)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...(await errorCodeEntries()),
  ];
}
