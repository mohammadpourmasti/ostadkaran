
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { services, servicePath } from "@/data/services";

export const metadata: Metadata = {
  title: "خدمات تعمیرات لوازم خانگی در اراک | استادکاران",
  description:
    "مشاهده خدمات تعمیر و نصب لوازم خانگی در اراک؛ از تعمیر ماشین لباسشویی و یخچال تا ظرف‌شویی، تلویزیون و سایر لوازم.",
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesPage() {
  return (
    <main className="page-container py-8 sm:py-12">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold text-primary">
          خدمات استادکاران
        </p>

        <h1 className="mt-3 text-2xl font-extrabold leading-relaxed text-slate-900 sm:text-4xl">
          تعمیر و نصب لوازم خانگی در اراک
        </h1>

        <p className="mt-4 leading-8 text-slate-600">
          خدمت موردنظرتان را انتخاب کنید تا با جزئیات تعمیرات، مشکلات رایج
          و نکات ضروری پیش از تماس آشنا شوید.
        </p>
      </section>

      <section
        aria-label="فهرست خدمات تعمیرات"
        className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service) => (
          <Link
            key={service.id}
            href={servicePath(service)}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {service.image ? (
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            ) : null}

            <div className="p-5">
              <h2 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                {service.h1}
              </h2>

              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                {service.intro[0]}
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                مشاهده جزئیات
                <span aria-hidden="true">←</span>
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
