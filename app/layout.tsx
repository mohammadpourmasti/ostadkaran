import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { CallClickTracker } from "@/components/analytics/call-click-tracker";
import { PublicChrome } from "@/components/layout/public-chrome";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { defaultOgImages, siteConfig } from "@/lib/site";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    images: defaultOgImages,
  },
  twitter: { card: "summary_large_image" },
};

// One LocalBusiness record built from siteConfig. Only confirmed data is included.
// TODO(owner) - add when real values are confirmed (do not guess):
//   openingHoursSpecification (hours are "۸ صبح تا ۱۰ شب"; the days of the week are unconfirmed),
//   geo (latitude/longitude of the office), image/logo (a real photo or logo URL), priceRange,
//   sameAs (official Instagram/Google Business/other profile URLs), postalCode.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteConfig.url}/#business`,
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  telephone: siteConfig.contact.phones.map((phone) => phone.href.replace("tel:", "")),
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.business.address,
    addressLocality: siteConfig.business.city,
    addressRegion: siteConfig.business.region,
    addressCountry: "IR",
  },
  areaServed: [
    { "@type": "City", name: "اراک" },
    { "@type": "AdministrativeArea", name: "استان مرکزی" },
  ],
  knowsAbout: ["تعمیر لوازم خانگی", "نصب لوازم خانگی"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd).replace(/</g, "\\u003c") }}
        />
        <PublicChrome>
          <SiteHeader />
        </PublicChrome>
        {children}
        <PublicChrome>
          <CallClickTracker />
          <SiteFooter />
          <MobileBottomNav />
        </PublicChrome>
      </body>
    </html>
  );
}
