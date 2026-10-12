import { siteConfig } from "@/lib/site";
import { servicePath } from "@/data/services";
import type { Service } from "@/types/service";

// `@id` of the sitewide LocalBusiness block in app/layout.tsx; service pages reference it instead of repeating it.
export const businessId = `${siteConfig.url}/#business`;

export function serviceUrl(service: Service) {
  return `${siteConfig.url}${servicePath(service)}`;
}

// Only confirmed facts: name, type, provider and the Arak / Markazi service area. No price, rating or hours.
export function serviceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.h1,
    serviceType: service.serviceType,
    description: service.metaDescription,
    url: serviceUrl(service),
    inLanguage: "fa-IR",
    provider: { "@id": businessId },
    areaServed: [
      { "@type": "City", name: siteConfig.business.city },
      { "@type": "AdministrativeArea", name: siteConfig.business.region },
    ],
  };
}

export function breadcrumbJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: service.navTitle, item: serviceUrl(service) },
    ],
  };
}
