import Image from "next/image";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons/icon-base";
import { PhoneIcon } from "@/components/icons/ui-icons";
import { PhoneCta } from "@/components/ui/phone-cta";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import {
  AppliancesIcon,
  ShieldCheckIcon,
  TechnicianIcon,
  ToolsIcon,
} from "./process-icons";

type Step = {
  number: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  featured?: boolean;
};

// Listed in reading order 01 → 04; the desktop row is an RTL grid, so 01 sits on the right.
const steps: readonly Step[] = [
  {
    number: "01",
    title: "مشکل را بگو",
    description: "از طریق تماس مستقیم یا درخواست آنلاین.",
    icon: PhoneIcon,
  },
  {
    number: "02",
    title: "دستگاه را مشخص کن",
    description: "یخچال، لباسشویی، ظرفشویی و ...",
    icon: AppliancesIcon,
  },
  {
    number: "03",
    title: "استادکار مناسب",
    description: "درخواستت به مسیر مناسب تعمیر هدایت می‌شود.",
    icon: TechnicianIcon,
    featured: true,
  },
  {
    number: "04",
    title: "تعمیر دستگاه",
    description: "اعزام استادکار و انجام تعمیر با پیگیری.",
    icon: ToolsIcon,
  },
];

// Curve through the four icon centres (columns at 12.5 / 37.5 / 62.5 / 87.5 % of a 1000-wide box).
const connectorPath =
  "M0 60 L125 60 C200 10 300 10 375 60 S550 110 625 60 S800 10 875 60 L1000 60";
// Nodes sit on the curve midpoints: [x %, y %] of the connector box.
const nodes: readonly [number, number][] = [
  [25, 18.75],
  [50, 81.25],
  [75, 18.75],
];

function StepIcon({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <span className="relative inline-flex shrink-0">
      {step.featured ? (
        <span className="flex size-20 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_0_8px_rgb(20_184_166/0.14),0_14px_36px_-6px_rgb(20_184_166/0.55)] ring-1 ring-accent/40 ring-offset-4 ring-offset-white/70 xl:size-24">
          <Icon className="size-9 xl:size-10" strokeWidth={1.4} />
        </span>
      ) : (
        <span className="flex size-16 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-[0_10px_26px_-12px_rgb(15_76_129/0.35)] xl:size-[4.5rem]">
          <Icon className="size-7 xl:size-8" strokeWidth={1.4} />
        </span>
      )}
      <span
        dir="ltr"
        className={`absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm ${
          step.featured ? "bg-primary" : "bg-accent-strong"
        }`}
      >
        {step.number}
      </span>
    </span>
  );
}

function StepText({ step }: { step: Step }) {
  return (
    <div dir="rtl" className="min-w-0">
      <h3 className="text-base/7 font-bold text-foreground xl:text-lg/7">
        {step.title}
      </h3>
      <p className="mt-0.5 text-sm/6 font-medium text-muted">
        {step.description}
      </p>
    </div>
  );
}

function ProcessSteps() {
  return (
    <>
      {/* Desktop: dir="rtl" makes the grid flow right to left, so 01 is on the right. The connector is mirror-symmetric, so it needs no change. */}
      <div dir="rtl" className="relative hidden xl:block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[6.5rem]"
        >
          <svg
            className="size-full"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient
                id="process-line"
                x1="0"
                x2="1000"
                y1="0"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#0f4c81" stopOpacity="0.15" />
                <stop offset="0.5" stopColor="#14b8a6" />
                <stop offset="1" stopColor="#0f4c81" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path
              d={connectorPath}
              stroke="url(#process-line)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {nodes.map(([x, y]) => (
            <span
              key={x}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-white"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          ))}
        </div>
        <ol className="relative grid grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-[6.5rem] items-center">
                <StepIcon step={step} />
              </span>
              {step.featured ? (
                <div className="mt-1 w-full max-w-60 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-[0_18px_40px_-20px_rgb(15_76_129/0.4)]">
                  <StepText step={step} />
                </div>
              ) : (
                <div className="mt-2 max-w-60 px-1">
                  <StepText step={step} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile / tablet: a vertical timeline in 01 → 04 order. */}
      <ol className="relative mx-auto flex max-w-md flex-col gap-1.5 xl:hidden">
        {steps.map((step) => (
          <li
            key={step.number}
            className={`relative flex items-center gap-3 rounded-2xl p-2 ${
              step.featured
                ? "border border-accent/40 bg-surface shadow-[0_14px_34px_-20px_rgb(20_184_166/0.6)]"
                : ""
            }`}
          >
            <span className="flex w-20 shrink-0 justify-center">
              <StepIcon step={step} />
            </span>
            <StepText step={step} />
          </li>
        ))}
      </ol>
    </>
  );
}

function TrustCard() {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-[0_20px_44px_-24px_rgb(15_76_129/0.45)] sm:flex-1 sm:flex-col sm:items-start sm:justify-center sm:gap-0 sm:self-center lg:p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent-strong">
        <ShieldCheckIcon className="size-5" />
      </span>
      <div className="min-w-0 text-right sm:mt-3">
        <h3 className="text-base/7 font-bold text-foreground">
          نیازی نیست متخصص باشید.
        </h3>
        <p className="mt-1 text-sm/6 text-muted">
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
      className="relative isolate overflow-hidden bg-[#f3f8fc] lg:grid lg:grid-cols-[60fr_40fr]"
    >
      {/* LEFT ZONE: all copy, infographic and CTAs */}
      <div
        dir="rtl"
        className="px-4 py-8 sm:px-6 sm:py-10 lg:py-8 lg:pr-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+2rem))]"
      >
        <header className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-none">
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

        <div className="mt-5 lg:mt-6">
          <ProcessSteps />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start sm:gap-6 lg:mt-6">
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
        className="px-4 pb-6 sm:px-6 lg:flex lg:items-stretch lg:py-8 lg:pr-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pl-4"
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-stretch lg:max-w-none">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl sm:aspect-auto sm:min-h-72 sm:w-[52%] sm:shrink-0">
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
