import Link from "next/link";
import { ClockIcon, LocationIcon, PhoneIcon } from "@/components/icons/ui-icons";
import { footerNavigation } from "@/data/navigation";
import { servicePath, services } from "@/data/services";
import { siteConfig } from "@/lib/site";
import { Logo } from "./logo";

const linkClass = "inline-flex min-h-8 items-center text-sm text-white/70 transition-colors hover:text-accent";

function ColumnHeading({ children }: { children: string }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-white">
      <span aria-hidden="true" className="h-4 w-1 rounded-full bg-accent" />
      {children}
    </h2>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0b2942] text-white">
      <div className="page-container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.2fr_1.4fr] lg:gap-8 lg:py-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo onDark />
          <p className="mt-3 max-w-sm text-sm/7 text-white/70">
            تعمیر و نصب لوازم خانگی ایرانی و خارجی در اراک و استان مرکزی، با {siteConfig.business.experienceYears} سال سابقه،
            ضمانت کتبی ۶ ماهه و اعلام هزینه پیش از تعمیر.
          </p>
          {/*
            Reserved for the official eNAMAD (Iranian e-commerce trust) badge.
            Paste the embed code / official image link issued by enamad.ir here once verified.
          */}
          <div
            id="enamad-badge-slot"
            data-slot="enamad"
            className="mt-4 h-24 w-24 rounded-lg border border-dashed border-white/20"
          />
        </div>

        <nav aria-label="پیوندهای سایت">
          <ColumnHeading>دسترسی سریع</ColumnHeading>
          <ul className="mt-3 flex flex-col">
            {footerNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="خدمات تعمیر">
          <ColumnHeading>خدمات تعمیر</ColumnHeading>
          <ul className="mt-3 grid grid-cols-2 gap-x-4">
            {services.map((service) => (
              <li key={service.id}>
                <Link href={servicePath(service)} className={linkClass}>
                  {service.navTitle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sm:col-span-2 lg:col-span-1">
          <ColumnHeading>تماس با ما</ColumnHeading>
          <ul className="mt-3 flex flex-col gap-1">
            {siteConfig.contact.phones.map((phone) => (
              <li key={phone.href}>
                <a
                  href={phone.href}
                  aria-label={`تماس با ${phone.display}`}
                  className="group inline-flex min-h-10 items-center gap-3 text-base font-semibold text-white transition-colors hover:text-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent transition-colors group-hover:bg-accent/20">
                    <PhoneIcon className="size-[1.125rem]" />
                  </span>
                  <span dir="ltr">{phone.display}</span>
                </a>
              </li>
            ))}
          </ul>
          <address className="mt-2 flex items-start gap-3 text-sm/7 text-white/70 not-italic">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
              <LocationIcon className="size-[1.125rem]" />
            </span>
            <span className="pt-1">{siteConfig.business.address}</span>
          </address>
          <p className="mt-2 flex items-start gap-3 text-sm/7 text-white/70">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
              <ClockIcon className="size-[1.125rem]" />
            </span>
            <span className="pt-1">
              {siteConfig.business.hours}
              <br />
              {siteConfig.business.duty}
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="page-container py-3 text-xs/6 text-white/60">
          © {siteConfig.name} — تعمیر و نصب لوازم خانگی در اراک
        </p>
      </div>
    </footer>
  );
}
