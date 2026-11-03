
import Link from "next/link";
import { ClockIcon, LocationIcon, PhoneIcon } from "@/components/icons/ui-icons";
import { footerNavigation } from "@/data/navigation";
import { servicePath, services } from "@/data/services";
import { siteConfig } from "@/lib/site";
import { Logo } from "./logo";

const linkClass =
  "inline-flex min-h-9 min-w-0 items-center text-sm leading-6 text-white/75 transition-colors hover:text-accent";

function ColumnHeading({ children }: { children: string }) {
  return (
    <h2 className="flex min-h-7 items-center gap-2 text-base font-bold text-white">
      <span
        aria-hidden="true"
        className="h-4 w-1 shrink-0 rounded-full bg-accent"
      />
      {children}
    </h2>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0b2942] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-white lg:pb-0">
      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 items-start gap-x-6 gap-y-8 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.15fr_0.8fr_1.2fr_1.35fr] lg:gap-x-8 lg:px-8 lg:py-10">
        <div className="min-w-0">
          <Logo onDark />
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
            تعمیر و نصب لوازم خانگی ایرانی و خارجی در اراک و استان مرکزی، با{" "}
            {siteConfig.business.experienceYears} سال سابقه، ضمانت کتبی ۶ ماهه
            و اعلام هزینه پیش از تعمیر.
          </p>
        </div>

        <nav aria-label="پیوندهای سایت" className="min-w-0">
          <ColumnHeading>دسترسی سریع</ColumnHeading>
          <ul className="mt-3 flex flex-col gap-1">
            {footerNavigation.map((item) => (
              <li key={item.href} className="min-w-0">
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="خدمات تعمیر" className="min-w-0">
          <ColumnHeading>خدمات تعمیر</ColumnHeading>
          <ul className="mt-3 grid grid-cols-2 items-start gap-x-3 gap-y-1">
            {services.map((service) => (
              <li key={service.id} className="min-w-0">
                <Link href={servicePath(service)} className={linkClass}>
                  {service.navTitle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <ColumnHeading>تماس با ما</ColumnHeading>
          <ul className="mt-3 flex flex-col gap-2">
            {siteConfig.contact.phones.map((phone) => (
              <li key={phone.href} className="min-w-0">
                <a
                  href={phone.href}
                  aria-label={`تماس با ${phone.display}`}
                  className="group inline-flex min-h-10 max-w-full items-center gap-3 text-base font-semibold text-white transition-colors hover:text-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent transition-colors group-hover:bg-accent/20">
                    <PhoneIcon className="size-[1.125rem]" />
                  </span>
                  <span dir="ltr" className="min-w-0">
                    {phone.display}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <address className="mt-4 flex items-start gap-3 text-sm leading-7 text-white/75 not-italic">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
              <LocationIcon className="size-[1.125rem]" />
            </span>
            <span className="min-w-0">{siteConfig.business.address}</span>
          </address>

          <p className="mt-3 flex items-start gap-3 text-sm leading-7 text-white/75">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
              <ClockIcon className="size-[1.125rem]" />
            </span>
            <span className="min-w-0">
              {siteConfig.business.hours}
              <br />
              {siteConfig.business.duty}
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-[90rem] px-4 py-3 text-xs leading-6 text-white/60 sm:px-6 lg:px-8">
          © {siteConfig.name} | تعمیر و نصب لوازم خانگی در اراک
        </p>
      </div>
    </footer>
  );
}
