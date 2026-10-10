import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { ApplianceExplorer } from "./appliance-explorer";
import { HeroTechnician } from "./hero-technician";

/*
 * One composed scene rather than two columns: the headline and CTAs sit on the
 * RTL start side, the appliance orbit (with the technician inside it) is the
 * visual centre, and the hint panel sits beside the orbit. A single background
 * layer spans everything behind them.
 * Below xl: headline → orbit → hint panel → CTAs.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-x-clip">
      {/* Replaceable background layer — see .hero-backdrop in globals.css */}
      <div aria-hidden="true" className="hero-backdrop absolute inset-0 -z-10" />

      <div className="page-container grid gap-x-10 gap-y-6 py-8 sm:py-10 xl:grid-cols-[minmax(0,31rem)_minmax(0,1fr)] xl:grid-rows-[1fr_auto_1fr] xl:py-8">
        <div className="max-w-xl xl:row-start-1 xl:self-end">
          <h1
            id="hero-title"
            className="text-[1.75rem]/[1.6] font-bold text-balance text-foreground sm:text-[2.125rem]/[1.55]"
          >
            لوازم خانگی‌تان خراب شده؟
            <br />
            <span className="text-accent">استادکار مناسبش رو پیدا کنید.</span>
          </h1>
          <p className="mt-3 text-base/8 text-muted sm:text-[1.0625rem]/8 xl:text-base/8">
            <span className="sm:block sm:whitespace-nowrap">مشکل دستگاهتان را با ما در میان بگذارید.</span>{" "}
            <span className="sm:block sm:whitespace-nowrap">
              می‌توانید مستقیم تماس بگیرید یا درخواست تعمیر خود را آنلاین ثبت کنید.
            </span>
          </p>
        </div>

        <div className="min-w-0 xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:self-center">
          <ApplianceExplorer technician={<HeroTechnician />} />
        </div>

        {/* RTL order: درخواست تعمیر (primary) first, then تماس مستقیم. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start xl:row-start-2">
          <div className="flex flex-col items-stretch gap-1.5 text-center sm:items-center">
            <RepairRequestCta className="w-full sm:w-auto sm:min-w-44" />
            <span className="text-xs text-muted">ثبت درخواست آنلاین</span>
          </div>
          <div className="flex flex-col items-stretch gap-1.5 text-center sm:items-center">
            <PhoneCta variant="outline" className="w-full sm:w-auto sm:min-w-44" />
            <span className="text-xs text-muted">توضیح مشکل به صورت تلفنی</span>
          </div>
        </div>
      </div>
    </section>
  );
}
