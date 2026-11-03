import Image from "next/image";
import { categoryImages } from "@/data/error-codes/category-images";
import { CategoryArt } from "./category-art";

type Props = {
  categoryId: string;
  title: string;
  /** Tailwind sizing classes for the box (aspect ratio / height); the image fills it. */
  className?: string;
  sizes: string;
  priority?: boolean;
};

// Photo when one exists for the category, otherwise the graphic fallback. Never references a missing file.
export function CategoryMedia({ categoryId, title, className = "", sizes, priority = false }: Props) {
  const image = categoryImages[categoryId];

  if (!image) return <CategoryArt categoryId={categoryId} className={className} />;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={image.src}
        alt={`تصویر شاخص راهنمای ${title}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition: image.position }}
      />
    </div>
  );
}
