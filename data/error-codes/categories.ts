import { services, servicePath } from "@/data/services";

const copy: Record<string, { title: string; description: string; keywords: string[] }> = {
  "washing-machine": { title: "ماشین لباسشویی", description: "راهنمای کدهای خطا و پیام‌های هشدار ماشین لباسشویی؛ معنی هر کد به برند و مدل دستگاه بستگی دارد.", keywords: ["لباسشویی", "ماشین لباسشویی", "washer"] },
  refrigerator: { title: "یخچال و فریزر", description: "راهنمای پیام‌های هشدار یخچال و فریزر و نکاتی برای بررسی ایمن دستگاه.", keywords: ["یخچال", "فریزر", "refrigerator", "fridge"] },
  dishwasher: { title: "ماشین ظرفشویی", description: "راهنمای کدهای خطای ماشین ظرفشویی و بررسی‌های اولیه و ایمن.", keywords: ["ظرفشویی", "ماشین ظرفشویی", "dishwasher"] },
  television: { title: "تلویزیون", description: "راهنمای پیام‌ها و نشانه‌های خطای تلویزیون؛ نشانه‌ها ممکن است بین مدل‌ها متفاوت باشند.", keywords: ["تلویزیون", "tv", "television"] },
  stove: { title: "اجاق گاز و فر", description: "راهنمای هشدارهای اجاق گاز و فر با تأکید بر نکات ایمنی.", keywords: ["اجاق", "اجاق گاز", "فر", "oven", "stove"] },
  "vacuum-cleaner": { title: "جاروبرقی و جارو شارژی", description: "راهنمای نشانگرها و پیام‌های خطای جاروبرقی و جارو شارژی.", keywords: ["جاروبرقی", "جارو شارژی", "vacuum"] },
  "air-conditioner": { title: "کولر گازی", description: "راهنمای کدهای نمایش‌داده‌شده روی کولر گازی؛ معنی کدها به برند و مدل وابسته است.", keywords: ["کولر گازی", "اسپلیت", "air conditioner", "ac"] },
  other: { title: "سایر لوازم خانگی", description: "برای وسیله‌های دیگر، نوع دستگاه و کد یا نشانه‌ای را که می‌بینید یادداشت کنید.", keywords: ["سایر", "لوازم خانگی", "other"] },
};

export const errorCodeCategories = services.map((service) => ({
  ...(copy[service.id] ?? { title: service.navTitle, description: `راهنمای خطاهای ${service.navTitle}؛ معنی کدها را با توجه به برند و مدل بررسی کنید.`, keywords: [service.navTitle] }),
  id: service.id,
  serviceHref: servicePath(service),
}));

export function getErrorCodeCategory(id: string) {
  return errorCodeCategories.find((category) => category.id === id);
}