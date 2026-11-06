import type { MetadataRoute } from "next";
import { errorCodeCategories } from "@/data/error-codes/categories";
import { servicePath, services } from "@/data/services";
import { getPublishedErrorCodes } from "@/lib/error-codes/queries";
import { isCategoryIndexable, isPubliclyVisible } from "@/lib/error-codes/visibility";
import { siteConfig } from "@/lib/site";

// Re-evaluated at most every 5 minutes; the error-code entries come from the database.
export const revalidate = 300;

function latest(dates: (string | null)[]): Date | undefined {
  const times = dates.filter((d): d is string => Boolean(d)).map((d) => new Date(d).getTime()).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : undefined;
}

// Publication policy: the data layer (getPublishedErrorCodes) returns only rows with status "published", and
// isPubliclyVisible keeps those whose verification_level is "verified" or "partially_verified" (unverified
// rows never qualify). The hub, every category with enough such rows to be indexable, and every such row's detail
// page are listed, each URL once. If the database is unreachable the error-code entries are left out for
// this run rather than failing the whole sitemap.
async function errorCodeEntries(): Promise<MetadataRoute.Sitemap> {
  let rows;
  try {
    rows = await getPublishedErrorCodes();
  } catch {
    return [];
  }

  const eligible = rows.filter((row) => isPubliclyVisible(row.verification_level));

  // The hub is a real page on its own; list it once there is at least one published code behind it.
  if (eligible.length === 0) return [];

  const categoryEntries = errorCodeCategories.flatMap((category) => {
    const inCategory = eligible.filter((row) => row.appliance_category === category.id);
    // Same rule as the category page's robots: listed only when the page is indexable (enough public codes).
    if (!isCategoryIndexable(inCategory)) return [];
    return [
      {
        url: `${siteConfig.url}/error-codes/${category.id}`,
        lastModified: latest(inCategory.map((row) => row.updated_at)),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ];
  });

  // Detail pages: only for categories that have a page, and each id is listed once.
  const categoryIds = new Set<string>(errorCodeCategories.map((category) => category.id));
  const seen = new Set<string>();
  const detailEntries: MetadataRoute.Sitemap = [];
  for (const row of eligible) {
    if (!categoryIds.has(row.appliance_category) || seen.has(row.id)) continue;
    seen.add(row.id);
    detailEntries.push({
      url: `${siteConfig.url}/error-codes/${row.appliance_category}/${row.id}`,
      lastModified: latest([row.updated_at]),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    });
  }

  return [
    {
      url: `${siteConfig.url}/error-codes`,
      lastModified: latest(eligible.map((row) => row.updated_at)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...categoryEntries,
    ...detailEntries,
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
    {
      url: `${siteConfig.url}/about/founder`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
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
