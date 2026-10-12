import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { HeroTrustBar } from "@/components/hero/hero-trust-bar";
import { AboutSection } from "@/components/home/about-section";
import { BrandsSection } from "@/components/home/brands-section";
import { ContactSection } from "@/components/home/contact-section";
import { FaqSection } from "@/components/home/faq-section";
import { RepairProcess } from "@/components/home/RepairProcess/RepairProcess";
import { ServiceAreasSection } from "@/components/home/service-areas-section";
import { sectionIds } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  // Nested openGraph is replaced (not merged) per route, so the shared fields are repeated here.
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
  },
};

export default function Home() {
  return (
    <main className="flex-1">
      {/* The Hero orbit is the appliance/services entry point, so the "خدمات" nav link targets it. */}
      <div id={sectionIds.services}>
        <Hero />
      </div>
      <HeroTrustBar />
      <RepairProcess />
      <AboutSection />
      <BrandsSection />
      <ServiceAreasSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}
