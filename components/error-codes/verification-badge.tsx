import type { PublicVerificationLevel } from "@/lib/error-codes/types";

// Shown next to every code. Verified codes get a calm confirmation; partially verified ones get an explicit
// caution so they are never read as a definitive answer.
export function VerificationBadge({ level }: { level: PublicVerificationLevel }) {
  if (level === "verified") {
    return (
      <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
        تأیید‌شده
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
      تأیید جزئی · با برند و مدل دستگاه تطبیق دهید
    </span>
  );
}
