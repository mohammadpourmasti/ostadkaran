import type { Appliance } from "@/types/appliance";

// Order matters: it is the visual order around the hero orbit, starting at the lower right.
export const appliances: readonly Appliance[] = [
  {
    id: "washing-machine",
    title: "ماشین لباسشویی",
    description: "عیب‌یابی و تعمیر ماشین لباسشویی‌های درب از جلو و درب از بالا.",
    commonProblems: ["آب تخلیه نمی‌شود", "لباس‌ها خوب شسته نمی‌شوند", "دستگاه روشن نمی‌شود", "صدای غیرعادی دارد"],
    image: { src: "/images/appliances/washing-machine.webp", width: 853, height: 1024 },
  },
  {
    id: "refrigerator",
    title: "یخچال",
    description: "بررسی سیستم سرمایش، برفک‌زدایی و قطعات برقی یخچال و فریزر.",
    commonProblems: ["سرد نمی‌کند", "برفک می‌زند", "صدای غیرعادی دارد", "آب نشت می‌کند"],
    image: { src: "/images/appliances/refrigerator.webp", width: 683, height: 1024 },
  },
  {
    id: "dishwasher",
    title: "ظرفشویی",
    description: "تعمیر سیستم آبگیری، تخلیه و گرمایش ماشین ظرفشویی.",
    commonProblems: ["ظروف تمیز نمی‌شوند", "آب تخلیه نمی‌شود", "دستگاه روشن نمی‌شود", "نشتی آب دارد"],
    image: { src: "/images/appliances/dishwasher.webp", width: 853, height: 1024 },
  },
  {
    id: "television",
    title: "تلویزیون",
    description: "عیب‌یابی برد، تغذیه و نمایشگر تلویزیون‌های ال‌سی‌دی و ال‌ای‌دی.",
    commonProblems: ["تصویر ندارد", "صدا ندارد", "روشن نمی‌شود", "تصویر قطع و وصل می‌شود"],
    image: { src: "/images/appliances/tv.webp", width: 1024, height: 683 },
  },
  {
    id: "stove",
    title: "اجاق و فر",
    description: "تعمیر شعله‌پخش‌کن، جرقه‌زن و سیستم فر اجاق گاز.",
    commonProblems: ["گرم نمی‌کند", "شعله روشن نمی‌شود", "دما تنظیم نمی‌شود", "جرقه نمی‌زند"],
    image: { src: "/images/appliances/range-cooker.webp", width: 986, height: 1024 },
  },
  {
    id: "vacuum-cleaner",
    title: "جارو شارژی",
    description: "تعمیر موتور، باتری و سیستم مکش جارو شارژی و جاروبرقی.",
    commonProblems: ["مکش ضعیف شده", "شارژ نمی‌شود", "باتری زود خالی می‌شود", "روشن نمی‌شود"],
    image: { src: "/images/appliances/vacuum-cleaner.webp", width: 683, height: 1024 },
  },
  {
    id: "air-conditioner",
    title: "کولر گازی",
    description: "سرویس و تعمیر یونیت داخلی و خارجی کولر گازی.",
    commonProblems: ["خنک نمی‌کند", "باد گرم می‌زند", "آب می‌دهد", "صدای غیرعادی دارد"],
    image: { src: "/images/appliances/air-conditioner.webp", width: 816, height: 816 },
  },
  {
    id: "other",
    title: "سایر لوازم خانگی",
    description: "عیب‌یابی و تعمیر سایر لوازم برقی خانگی.",
    commonProblems: ["روشن نمی‌شود", "درست کار نمی‌کند", "صدای غیرعادی دارد", "نیاز به سرویس دارد"],
    image: { src: "/images/appliances/other-appliances.webp", width: 1024, height: 683 },
  },
];
