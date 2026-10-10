import { LocationIcon } from "@/components/icons/ui-icons";
import { PhoneCta } from "@/components/ui/phone-cta";
import { sectionIds } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

// Arak (office) and Markazi Province are confirmed; coverage of individual cities outside Arak is not, so we ask to call.
export function ServiceAreasSection() {
  return (
    <section
      id={sectionIds.serviceAreas}
      aria-labelledby="areas-heading"
      className="border-y border-accent/15 bg-[#f0f9f8]"
    >
      <div className="page-container py-10 sm:py-12">
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent-strong">
              <LocationIcon className="size-6" />
            </span>
            <div>
              <h2 id="areas-heading" className="text-xl/8 font-extrabold text-primary sm:text-2xl/9">
                مناطق خدمات
              </h2>
              <p className="mt-1 text-sm/7 text-muted sm:text-base/8">
                دفتر {siteConfig.name} در اراک است و منطقه خدمات‌دهی ما استان مرکزی است. برای شهرها و روستاهای خارج از
                اراک، پیش از ثبت درخواست تماس بگیرید تا امکان خدمات در محل شما تأیید شود.
              </p>
            </div>
          </div>
          <PhoneCta variant="outline" className="w-full shrink-0 sm:w-auto" />
        </div>
      </div>
    </section>
  );
}
