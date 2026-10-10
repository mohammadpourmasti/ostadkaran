import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons/icon-base";
import { ClockIcon, LocationIcon, PhoneIcon } from "@/components/icons/ui-icons";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { sectionIds } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

const { business, contact } = siteConfig;

const details: readonly { icon: ComponentType<IconProps>; title: string; lines: readonly string[] }[] = [
  { icon: LocationIcon, title: "نشانی", lines: [business.address] },
  { icon: ClockIcon, title: "ساعات پاسخ‌گویی", lines: [business.hours, business.duty] },
];

// Contact details and the closing call to action. Phones, address and hours are client-confirmed;
// there is no map link because only a text address (no coordinates) is known.
// A soft blue band that leads straight into the navy footer.
export function ContactSection() {
  return (
    <section id={sectionIds.contact} aria-labelledby="contact-heading" className="bg-[#eaf2f9]">
      <div className="page-container py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div>
            <h2 id="contact-heading" className="text-2xl/[1.6] font-extrabold text-primary sm:text-3xl/[1.6]">
              دستگاهتان خراب شده؟ همین حالا تماس بگیرید
            </h2>
            <p className="mt-2 text-sm/7 text-muted sm:text-base/8">
              مشکل را برای ما توضیح دهید تا هزینه را پیش از تعمیر اعلام کنیم. ثبت آنلاین درخواست هنوز فعال نشده است.
            </p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {details.map(({ icon: Icon, title, lines }) => (
                <li key={title} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-strong">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm/6 font-bold text-foreground">{title}</h3>
                    {lines.map((line) => (
                      <p key={line} className="text-sm/6 text-muted">
                        {line}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <a
              href={contact.phone.href}
              aria-label={`تماس با موبایل ${contact.phone.display}`}
              className="flex min-h-14 items-center gap-3 rounded-2xl bg-cta/10 px-4 py-2 transition-colors hover:bg-cta/20"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cta text-foreground">
                <PhoneIcon className="size-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-xs text-muted">موبایل</span>
                <span dir="ltr" className="text-start text-xl font-extrabold text-primary">
                  {contact.phone.display}
                </span>
              </span>
            </a>

            <ul className="mt-3 flex flex-col">
              {contact.phones.slice(1).map((phone) => (
                <li key={phone.href} className="border-b border-border last:border-b-0">
                  <a
                    href={phone.href}
                    aria-label={`تماس با ${phone.display}`}
                    className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-primary transition-colors hover:text-accent-strong"
                  >
                    <PhoneIcon className="size-5 shrink-0 text-accent-strong" />
                    <span dir="ltr">{phone.display}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <PhoneCta variant="outline" className="w-full sm:flex-1" />
              <RepairRequestCta className="w-full sm:flex-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
