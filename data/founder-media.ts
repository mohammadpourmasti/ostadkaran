// Founder page media albums. To add an item, drop the file in public/ and add one entry here.
// Photos: public/images/founder/*  ->  { src: "/images/founder/xxx.jpg", width, height, alt }
// Videos: public/videos/founder/*  ->  { src: "/videos/founder/xxx.mp4", title, poster? }
// Only real, client-supplied media may be listed.

export type FounderPhoto = { src: string; width: number; height: number; alt: string; caption?: string };
export type FounderVideo = { src: string; title: string; poster?: string };

const name = "هانی حیدری";

export const founderPhotos: readonly FounderPhoto[] = [
  { src: "/images/founder/album-portrait.jpg", width: 928, height: 1152, alt: `پرتره ${name}، مدیرعامل استادکاران` },
  {
    src: "/images/founder/album-fridge-interview.jpg",
    width: 1184,
    height: 880,
    alt: `${name} کنار یخچال باز، هنگام ضبط برنامه تلویزیونی`,
  },
  {
    src: "/images/founder/album-studio-set.jpg",
    width: 1184,
    height: 864,
    alt: `${name} مقابل دوربین تلویزیونی و یخچال‌ها، هنگام ضبط برنامه`,
  },
  {
    src: "/images/founder/album-showroom-shoot.jpg",
    width: 1072,
    height: 1400,
    alt: `${name} هنگام توضیح درباره لوازم خانگی در حال فیلم‌برداری`,
  },
  {
    src: "/images/founder/album-dishwasher.jpg",
    width: 1184,
    height: 592,
    alt: `${name} کنار ماشین ظرفشویی باز، هنگام توضیح دادن`,
  },
  {
    src: "/images/founder/hani-heydari.jpg",
    width: 420,
    height: 525,
    alt: "هانی حیدری، مدیرعامل استادکاران، کنار یخچال باز در حال مصاحبه تلویزیونی",
  },
];

export const founderVideos: readonly FounderVideo[] = [];
