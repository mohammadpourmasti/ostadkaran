import Link from "next/link";

export type Crumb = { label: string; href?: string };

// The last crumb is the current page (no link, aria-current).
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="مسیر صفحه">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-8 items-center hover:text-accent-strong">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
