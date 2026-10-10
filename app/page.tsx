import { Hero } from "@/components/hero/hero";
import { HeroTrustBar } from "@/components/hero/hero-trust-bar";
import { AboutSection } from "@/components/home/about-section";
import { ContactSection } from "@/components/home/contact-section";
import { FaqSection } from "@/components/home/faq-section";
import { RepairProcess } from "@/components/home/RepairProcess/RepairProcess";
import { ServiceAreasSection } from "@/components/home/service-areas-section";
import { sectionIds } from "@/data/navigation";

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
      <ServiceAreasSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}
