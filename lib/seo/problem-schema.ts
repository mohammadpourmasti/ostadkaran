import { getServiceById, servicePath } from "@/data/services";
import { problemPath } from "@/data/service-problems";
import { siteConfig } from "@/lib/site";
import { businessId, servicesHubUrl } from "@/lib/seo/service-schema";
import type { ProblemPage } from "@/types/service";

export function problemUrl(problem: ProblemPage) {
  return `${siteConfig.url}${problemPath(problem)}`;
}

// Only confirmed facts: no price, rating or hours.
export function problemServiceJsonLd(problem: ProblemPage) {
  const service = getServiceById(problem.serviceId);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: problem.h1,
    serviceType: service?.serviceType,
    description: problem.metaDescription,
    url: problemUrl(problem),
    inLanguage: "fa-IR",
    provider: { "@id": businessId },
    areaServed: [
      { "@type": "City", name: siteConfig.business.city },
      { "@type": "AdministrativeArea", name: siteConfig.business.region },
    ],
  };
}

// Same trail as the visible breadcrumb: خانه ← خدمات ← the service ← the problem.
export function problemBreadcrumbJsonLd(problem: ProblemPage) {
  const service = getServiceById(problem.serviceId);
  const trail = [
    { name: "خانه", item: siteConfig.url },
    { name: "خدمات", item: servicesHubUrl },
    ...(service ? [{ name: service.navTitle, item: `${siteConfig.url}${servicePath(service)}` }] : []),
    { name: problem.h1, item: problemUrl(problem) },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}
