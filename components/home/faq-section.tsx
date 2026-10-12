import { ChevronDownIcon } from "@/components/icons/ui-icons";
import { sectionIds } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

// Answers only restate client-confirmed facts: no exclusions, arrival times or fees beyond these.
const faqs: readonly { question: string; answer: string }[] = [
  {
    question: "چطور درخواست تعمیر بدهم؟",
    answer: `می‌توانید فرم درخواست تعمیر را در همین سایت پر کنید یا با شماره‌های سایت تماس بگیرید.`,
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

const columnSplit = Math.ceil(faqs.length / 2);
const faqColumns = [faqs.slice(0, columnSplit), faqs.slice(columnSplit)] as const;

export function FaqSection() {
  return (
    <section id={sectionIds.faq} aria-labelledby="faq-heading" className="bg-surface">
      <div className="page-container py-8 sm:py-10">
        <header className="mb-5">
          <h2 id="faq-heading" className="text-2xl/[1.6] font-extrabold text-primary sm:text-3xl/[1.6]">
            سوالات متداول
          </h2>
          <p className="mt-1 text-sm/7 text-muted sm:text-base/8">
            پاسخ کوتاه به پرسش‌های رایج. سوال دیگری دارید؟ با {siteConfig.name} تماس بگیرید.
          </p>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          {faqColumns.map((column, index) => (
            <div
              key={index}
              className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
            >
              {column.map((faq) => (
                <details key={faq.question} className="group px-4 transition-colors open:bg-background">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-base/7 font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDownIcon className="size-5 shrink-0 text-accent-strong transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-3 text-sm/7 text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
