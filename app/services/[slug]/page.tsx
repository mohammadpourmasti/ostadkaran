import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ServicePage } from "@/components/services/service-page";
import { getServiceBySlug, servicePath, services } from "@/data/services";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/service-schema";
import { siteConfig } from "@/lib/site";

// Only the eight known slugs exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  const path = servicePath(service);
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: path },
    // A child openGraph replaces the layout's, so the shared fields are repeated here.
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: `${service.metaTitle} | ${siteConfig.name}`,
      description: service.metaDescription,
      url: path,
    },
  };
}

export default async function ServiceRoute({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      <JsonLd data={breadcrumbJsonLd(service)} />
      <ServicePage service={service} />
    </>
  );
}
