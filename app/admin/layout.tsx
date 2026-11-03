import type { Metadata } from "next";
import type { ReactNode } from "react";

// Everything under /admin is private: never indexed, never followed.
export const metadata: Metadata = {
  title: { default: "پنل مدیریت | استادکاران", template: "%s | پنل استادکاران" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
}
