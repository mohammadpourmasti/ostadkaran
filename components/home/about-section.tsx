import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons/icon-base";
import { CheckCircleIcon, UserIcon, WrenchIcon } from "@/components/icons/ui-icons";
import { sectionIds } from "@/data/navigation";

// Only facts confirmed by the client (see siteConfig.business).
const points: readonly { icon: ComponentType<IconProps>; title: string; text: string }[] = [
  {
    icon: UserIcon,
    title: "۳۲ سال سابقه",
    text: "تعمیر و نصب لوازم خانگی با تجربه‌ای ۳۲ ساله.",
  },
  {
    icon: WrenchIcon,
    title: "همه برندها",
    text: "پذیرش تمامی برندهای ایرانی و خارجی؛ از یخچال و لباسشویی تا کولر گازی و تلویزیون.",
  },
  {
    icon: CheckCircleIcon,
    title: "شفافیت در هزینه",
    text: "پیش‌فاکتور و اعلام هزینه پیش از تعمیر، همراه با ضمانت کتبی ۶ ماهه.",
  },
];

export function AboutSection() {
  return (
    <section id={sectionIds.about} aria-labelledby="about-heading" className="bg-surface">
      <div className="page-container grid gap-6 py-10 sm:py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <header>
          <h2 id="about-heading" className="text-2xl/[1.6] font-extrabold text-primary sm:text-3xl/[1.6]">
            درباره استادکاران
          </h2>
          <p className="mt-2 text-sm/8 text-muted sm:text-base/8">
            استادکاران مجموعه‌ای در اراک برای تعمیر و نصب لوازم خانگی است. با ۳۲ سال سابقه، دستگاه‌های ایرانی و خارجی را
            بررسی و تعمیر می‌کنیم و هزینه را پیش از شروع کار اعلام می‌کنیم.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-3 lg:gap-4">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-border bg-background p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent-strong">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-3 text-base/7 font-bold text-foreground">{title}</h3>
              <p className="mt-1 text-sm/6 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
