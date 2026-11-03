import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black text-primary sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm leading-7 text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
