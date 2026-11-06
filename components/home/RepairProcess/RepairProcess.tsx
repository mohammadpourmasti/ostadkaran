import Image from "next/image";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { ProcessSteps } from "./process-steps";
import { ShieldCheckIcon } from "./process-icons";

function TrustCard() {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_20px_44px_-24px_rgb(15_76_129/0.45)] max-sm:absolute max-sm:top-1/2 max-sm:left-2.5 max-sm:w-[55%] max-sm:-translate-y-1/2 max-sm:bg-white/85 max-sm:p-3 max-sm:backdrop-blur-sm sm:relative sm:flex-1 sm:flex-col sm:items-start sm:justify-center sm:gap-0 sm:self-center lg:p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent-strong max-sm:hidden">
        <ShieldCheckIcon className="size-5" />
      </span>
      <div className="min-w-0 text-right sm:mt-3">
        <h3 className="text-[0.9375rem]/6 font-bold text-foreground sm:text-base/7">
          نیازی نیست متخصص باشید.
        </h3>
        <p className="mt-1 text-[0.8125rem]/5 text-muted sm:text-sm/6">
          فقط مشکل را به ما بگویید، بقیه مسیر را ساده‌تر می‌کنیم.
        </p>
        <span
          aria-hidden="true"
          className="mt-3 hidden h-1 w-10 rounded-full bg-accent sm:block"
        />
      </div>
    </div>
  );
}

export function RepairProcess() {
  return (
    // dir="ltr" fixes the PHYSICAL zones (content left, visual right); each zone restores dir="rtl" for its text.
    <section
      id="repair-process"
      dir="ltr"
      aria-labelledby="repair-process-heading"
      className="relative isolate overflow-hidden bg-[#f3f8fc] max-lg:flex max-lg:flex-col lg:grid lg:grid-cols-[60fr_40fr]"
    >
      {/* LEFT ZONE: all copy, infographic and CTAs */}
      <div
        dir="rtl"
        className="px-4 py-8 max-lg:contents sm:px-6 sm:py-10 lg:py-8 lg:pr-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+2rem))]"
      >
        <header className="mx-auto max-w-2xl px-4 pt-8 text-center max-lg:order-1 sm:px-6 sm:pt-10 lg:mx-0 lg:max-w-none lg:p-0">
          <h2 id="repair-process-heading" className="font-extrabold">
            <span className="block text-2xl/[1.5] text-primary sm:text-3xl/[1.5]">
              تعمیر فقط پیدا کردن یک تعمیرکار نیست
            </span>
            <span className="block text-[1.625rem]/[1.5] text-accent-strong sm:text-4xl/[1.5]">
              تعمیر را ساده‌تر کرده‌ایم
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm/7 font-medium text-muted sm:text-base/7">
            از لحظه‌ای که مشکل دستگاهتان را اعلام می‌کنید تا رسیدن به راهکار
            مناسب، استادکاران کنار شماست.
          </p>
        </header>

        <div className="mt-5 px-4 max-lg:order-2 sm:px-6 lg:mt-6 lg:p-0">
          <ProcessSteps />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-4 px-4 pb-8 max-lg:order-4 sm:flex-row sm:items-start sm:gap-6 sm:px-6 sm:pb-10 lg:mt-6 lg:p-0">
          <div className="flex w-full flex-col items-center gap-2 sm:w-auto">
            <RepairRequestCta className="h-12 w-full rounded-full px-8 text-base sm:w-auto" />
            <span className="text-sm text-muted">ثبت درخواست آنلاین</span>
          </div>
          <div className="flex w-full flex-col items-center gap-2 sm:w-auto">
            <PhoneCta
              variant="outline"
              className="h-12 w-full rounded-full px-8 text-base sm:w-auto"
            />
            <span className="text-sm text-muted">توضیح مشکل به صورت تلفنی</span>
          </div>
        </div>
      </div>

      {/* RIGHT ZONE: dir="rtl" row, so the first child (technician image) sits on the right and the trust card beside it on the left */}
      <div
        dir="rtl"
        className="px-4 pt-5 max-lg:order-3 sm:px-6 lg:flex lg:items-stretch lg:py-8 lg:pr-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pl-4"
      >
        {/* < sm: one composed block, the trust text sits on the empty side of the photo next to the technician. */}
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 max-sm:relative max-sm:aspect-[4/3] max-sm:overflow-hidden max-sm:rounded-3xl sm:max-w-xl sm:flex-row sm:items-stretch lg:max-w-none">
          <div className="overflow-hidden max-sm:absolute max-sm:inset-0 sm:relative sm:min-h-72 sm:w-[52%] sm:shrink-0 sm:rounded-3xl">
            <Image
              src="/images/sections/repair-process-background.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover object-[88%_center]"
            />
          </div>
          <TrustCard />
        </div>
      </div>
    </section>
  );
}
