import Image from "next/image";
import { RepairRequestCta } from "@/components/ui/repair-request-cta";
import { confirmedBrands } from "@/data/brands";

// Logos identify the brands we repair only; the copy makes no dealership or authorization claim.
export function BrandsSection() {
  return (
    <section aria-labelledby="brands-heading" className="bg-surface">
      <div className="page-container py-10 sm:py-12">
        <header className="mx-auto max-w-2xl text-center">
          <h2 id="brands-heading" className="text-2xl/[1.6] font-extrabold text-primary sm:text-3xl/[1.6]">
            برندهای تحت پوشش تعمیرات استادکاران
          </h2>
          <p className="mt-2 text-sm/8 text-muted sm:text-base/8">
            برند و مدل دستگاه را هنگام ثبت درخواست بگویید.
          </p>
        </header>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {confirmedBrands.map((brand) => (
            <li
              key={brand.name}
              className="flex h-28 flex-col items-center justify-between rounded-xl border border-border bg-white px-3 pb-2.5 pt-3 sm:h-32 sm:px-4 sm:pb-3 sm:pt-4"
            >
              {/* Fixed logo area so every card is balanced; logos keep their own aspect ratio inside it. */}
              <div className="flex h-12 w-full items-center justify-center sm:h-14">
                {brand.logo ? (
                  <Image
                    src={brand.logo.src}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    alt={`لوگوی ${brand.name}`}
                    sizes="144px"
                    className="h-auto max-h-full w-auto max-w-[8.5rem] object-contain"
                  />
                ) : (
                  <span aria-hidden="true" className="text-lg font-extrabold text-primary">
                    {brand.name}
                  </span>
                )}
              </div>
              <span className="text-sm/6 font-bold text-foreground">{brand.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center">
          <RepairRequestCta className="w-full sm:w-auto" />
        </div>
      </div>
    </section>
  );
}
