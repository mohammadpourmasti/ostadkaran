import type { Metadata } from "next";
import { RepairRequestForm } from "@/components/repair-request/repair-request-form";
import { PhoneCta } from "@/components/ui/phone-cta";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "درخواست تعمیر لوازم خانگی",
  description: "برای تعمیر و نصب لوازم خانگی در اراک و استان مرکزی با استادکاران تماس بگیرید. ثبت آنلاین درخواست هنوز فعال نشده است.",
  alternates: { canonical: "/repair-request" },
};

export default function RepairRequestPage() {
  return (
    <main className="flex-1">
      <div className="page-container py-8 sm:py-12">
        <header className="max-w-2xl">
          <h1 className="text-[1.75rem]/[1.6] font-extrabold text-primary sm:text-4xl/[1.5]">درخواست تعمیر</h1>
          <p className="mt-2 text-sm/7 text-muted sm:text-base/8">
            برای تعمیر و نصب لوازم خانگی، مشکل دستگاه را تلفنی با ما در میان بگذارید. هزینه پیش از تعمیر اعلام می‌شود.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-8">
          {/* Call card first: it is the only working channel today, so it leads on mobile. */}
          <section
            aria-labelledby="call-heading"
            className="rounded-3xl border border-accent/40 bg-accent/[0.06] p-5 sm:p-7"
          >
            <h2 id="call-heading" className="text-lg/8 font-bold text-foreground">
              همین حالا تماس بگیرید
            </h2>
            <p className="mt-1 text-sm/7 text-muted">
              ثبت آنلاین درخواست هنوز فعال نشده است. برای ثبت درخواست تعمیر، تماس تلفنی بهترین راه است.
            </p>
            <PhoneCta variant="block" className="mt-4" />
            <ul className="mt-4 flex flex-col gap-1 text-sm">
              {siteConfig.contact.phones.map((phone) => (
                <li key={phone.href}>
                  <a
                    href={phone.href}
                    aria-label={`تماس با ${phone.display}`}
                    className="inline-block py-0.5 font-semibold text-primary hover:text-accent-strong"
                  >
                    <span dir="ltr">{phone.display}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div>
            <p
              id="form-status"
              role="status"
              className="mb-3 rounded-2xl border border-cta/40 bg-cta/10 px-4 py-3 text-sm/7 font-medium text-foreground"
            >
              فرم زیر فعلاً فقط پیش‌نمایش است و اطلاعات شما ارسال یا ذخیره نمی‌شود. لطفاً برای ثبت درخواست تماس بگیرید.
            </p>
            <RepairRequestForm />
          </div>
        </div>
      </div>
    </main>
  );
}
