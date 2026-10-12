import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/site";
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
  },
};

// One LocalBusiness record built from siteConfig. No geo, postal code or opening-hours spec: those are unconfirmed.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
