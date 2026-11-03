
import type { Metadata } from "next";
import Link from "next/link";
import { ErrorCodeGuide } from "@/components/error-codes/error-code-guide";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  // absolute: the full title already carries the site name, so the layout template must not add it again.
  title: { absolute: "راهنمای کدهای خطای لوازم خانگی | استادکاران اراک" },
  description:
    "راهنمای کدهای خطا و پیام‌های هشدار لوازم خانگی. نوع وسیله را انتخاب کنید و پیش از هر اقدامی، نکات ایمنی و تفاوت کدها بر اساس برند و مدل را بررسی کنید.",
  alternates: { canonical: "/error-codes" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: "راهنمای کدهای خطای لوازم خانگی | استادکاران",
    description:
      "جست‌وجو و راهنمایی اولیه برای کدهای خطای لوازم خانگی، با توجه به برند و مدل دستگاه.",
    url: "/error-codes",
  },
};

export default function ErrorCodesPage() {
  return (
    <main className="flex-1">
      <div className="page-container pt-4">
        <nav
          aria-label="مسیر صفحه"
          className="text-sm text-muted"
        >
          <Link href="/" className="hover:text-primary">
            صفحه اصلی
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="font-semibold text-foreground">
            راهنمای کدهای خطا
          </span>
        </nav>

        
      </div>

      <ErrorCodeGuide />
    </main>
  );
}
