import { BrandsSlider } from "@/components/home/brands-slider";
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

        <BrandsSlider brands={confirmedBrands} />

        <div className="mt-8 flex justify-center">
          <RepairRequestCta className="w-full sm:w-auto" />
        </div>
      </div>
    </section>
  );
}
