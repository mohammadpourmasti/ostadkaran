// Graphic fallback for categories without a photo: brand gradient plus a simple line icon. Decorative only.
import { categoryGradients } from "@/data/error-codes/category-images";

const icons: Record<string, React.ReactNode> = {
  television: (
    <>
      <rect x="8" y="14" width="48" height="32" rx="4" />
      <path d="M24 54h16M32 46v8" />
    </>
  ),
  stove: (
    <>
      <rect x="10" y="10" width="44" height="44" rx="5" />
      <circle cx="23" cy="23" r="5" />
      <circle cx="41" cy="23" r="5" />
      <rect x="18" y="35" width="28" height="13" rx="2" />
    </>
  ),
  other: (
    <>
      <rect x="12" y="12" width="40" height="40" rx="6" />
      <path d="M24 32h16M32 24v16" />
    </>
  ),
};

export function CategoryArt({ categoryId, className = "" }: { categoryId: string; className?: string }) {
  const gradient = categoryGradients[categoryId] ?? categoryGradients.other;

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-gradient-to-l ${gradient} text-primary/70 ${className}`}
    >
      <svg viewBox="0 0 64 64" className="size-1/3 min-w-12 max-w-24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {icons[categoryId] ?? icons.other}
      </svg>
    </div>
  );
}
