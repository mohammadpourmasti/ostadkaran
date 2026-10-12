import type { ComponentType } from "react";
import { BoltIcon, CheckCircleIcon, MouseIcon, UserIcon, WrenchIcon } from "@/components/icons/ui-icons";
import type { IconProps } from "@/components/icons/icon-base";

const items: readonly { icon: ComponentType<IconProps>; lines: readonly [string, string] }[] = [
  { icon: UserIcon, lines: ["۳۲ سال", "سابقه تعمیر"] },
  { icon: CheckCircleIcon, lines: ["ضمانت کتبی", "۶ ماهه"] },
  { icon: WrenchIcon, lines: ["اعلام هزینه", "پیش از تعمیر"] },
  { icon: BoltIcon, lines: ["پاسخ‌گویی ۸ صبح تا ۱۰ شب", "کشیک شب و تعطیلات"] },
];

// Standalone trust strip directly under the hero; the last cell explains the orbit interaction.
export function HeroTrustBar() {
  return (
    <section aria-label="چرا استادکاران" className="page-container pb-8 xl:-mt-2">
      <ul className="grid grid-cols-1 gap-1 rounded-3xl border border-border bg-surface p-2 shadow-[0_12px_32px_-24px_rgb(15_76_129/0.3)] sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.5fr_1.4fr] xl:gap-0">
        {items.map(({ icon: Icon, lines }) => (
          <li
            key={lines[0]}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 xl:rounded-none xl:border-e xl:border-border xl:py-2"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon className="size-5" />
            </span>
            <span className="text-sm/6 font-medium text-foreground xl:flex xl:min-h-12 xl:flex-col xl:justify-center">
              {lines.map((line, i) => (
                <span key={i} className="xl:block xl:whitespace-nowrap">
                  {i > 0 && " "}
                  {line}
                </span>
              ))}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/[0.06] px-4 py-3 sm:col-span-2 xl:col-span-1 xl:ms-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <MouseIcon className="size-5" />
          </span>
          <span className="text-sm/6 text-foreground xl:flex xl:min-h-12 xl:flex-col xl:justify-center">
            <span className="xl:block xl:whitespace-nowrap">با حرکت موس روی هر دستگاه</span> <span className="xl:block xl:whitespace-nowrap">خدمات مربوط به آن را ببینید</span>
          </span>
        </li>
      </ul>
    </section>
  );
}
