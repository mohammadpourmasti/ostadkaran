import { ChevronDownIcon } from "@/components/icons/ui-icons";
import { sectionIds } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

// Answers only restate client-confirmed facts: no exclusions, arrival times or fees beyond these.
const faqs: readonly { question: string; answer: string }[] = [
  {
    question: "چطور درخواست تعمیر بدهم؟",
    answer: `برای ثبت درخواست با شماره‌های سایت تماس بگیرید. ثبت آنلاین هنوز فعال نشده است و فرم درخواست فعلاً فقط پیش‌نمایش است.`,
  },
  {
    question: "آیا برندهای ایرانی و خارجی پذیرفته می‌شوند؟",
    answer: "بله، تمامی برندهای ایرانی و خارجی پذیرفته می‌شوند.",
  },
  {
    question: "ضمانت تعمیر چگونه است؟",
    answer: "تعمیرات دارای ضمانت کتبی ۶ ماهه است.",
  },
  {
    question: "هزینه تعمیر چه زمانی اعلام می‌شود؟",
    answer: "پیش‌فاکتور ارائه می‌شود و هزینه پیش از انجام تعمیر اعلام می‌شود.",
  },
  {
    question: "ساعات پاسخ‌گویی چگونه است؟",
    answer: `پاسخ‌گویی از ${siteConfig.business.hours} است.`,
  },
  {
    question: "آیا در شب و تعطیلات کشیک وجود دارد؟",
    answer: "بله، کشیک شب و تعطیلات داریم. برای هماهنگی با ما تماس بگیرید.",
  },
  {
    question: "کدام لوازم خانگی را تعمیر می‌کنید؟",
    answer:
      "یخچال، ماشین لباسشویی، ظرفشویی، تلویزیون، اجاق و فر، جارو شارژی، کولر گازی و سایر لوازم برقی خانگی؛ تعمیر و نصب.",
  },
  {
    question: "خدمات در چه شهری ارائه می‌شود؟",
    answer:
      "دفتر ما در اراک است و منطقه خدمات‌دهی ما استان مرکزی است. برای شهرها و روستاهای خارج از اراک پیش از ثبت درخواست تماس بگیرید.",
  },
  {
    question: "نشانی مجموعه کجاست؟",
    answer: `${siteConfig.business.address}.`,
  },
];

export function FaqSection() {
  return (
    <section id={sectionIds.faq} aria-labelledby="faq-heading" className="bg-surface">
      <div className="page-container grid gap-6 py-10 sm:py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <header>
          <h2 id="faq-heading" className="text-2xl/[1.6] font-extrabold text-primary sm:text-3xl/[1.6]">
            سوالات متداول
          </h2>
          <p className="mt-1 text-sm/7 text-muted sm:text-base/8">
            پاسخ کوتاه به پرسش‌های رایج. سوال دیگری دارید؟ با {siteConfig.name} تماس بگیرید.
          </p>
        </header>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-4 transition-colors open:bg-background sm:px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-base/7 font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDownIcon className="size-5 shrink-0 text-accent-strong transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-4 text-sm/7 text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
