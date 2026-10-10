import { PhoneIcon } from "@/components/icons/ui-icons";
import { siteConfig } from "@/lib/site";

type PhoneCtaProps = {
  variant: "header" | "header-outline" | "icon" | "block" | "outline";
  className?: string;
};

const solid =
  "inline-flex items-center justify-center rounded-xl bg-cta font-bold text-foreground shadow-sm shadow-cta/25 transition hover:brightness-95 active:brightness-90";

const variants: Record<PhoneCtaProps["variant"], string> = {
  header: `${solid} h-10 gap-2.5 px-3.5`,
  "header-outline":
    "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-accent-strong bg-transparent px-3.5 text-sm font-semibold whitespace-nowrap text-primary transition-colors hover:bg-accent/10",
  icon: `${solid} size-10`,
  block: `${solid} h-12 w-full gap-2.5 px-4 text-base`,
  // Secondary hero action: same footprint as the primary CTA, deliberately quieter.
  outline:
    "inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-accent-strong bg-surface px-6 text-[0.9375rem] font-semibold text-primary transition duration-200 hover:-translate-y-px hover:bg-accent/5 hover:shadow-sm active:translate-y-0",
};

// The phone number is a primary conversion channel, so every call CTA goes through here.
export function PhoneCta({ variant, className = "" }: PhoneCtaProps) {
  const { display, href } = siteConfig.contact.phone;
  const classes = `${variants[variant]} ${className}`;

  if (variant === "icon") {
    return (
      <a href={href} className={classes} aria-label={`تماس تلفنی: ${display}`}>
        <PhoneIcon className="size-5" />
      </a>
    );
  }

  if (variant === "header") {
    return (
      <a href={href} className={classes}>
        <PhoneIcon className="size-5 shrink-0" />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[0.7rem] font-medium">تماس برای تعمیر</span>
          <span dir="ltr" className="text-sm">
            {display}
          </span>
        </span>
      </a>
    );
  }

  if (variant === "header-outline") {
    return (
      <a href={href} className={classes} aria-label={`تماس مستقیم: ${display}`}>
        <PhoneIcon className="size-4 shrink-0 text-accent-strong" />
        تماس مستقیم
      </a>
    );
  }

  if (variant === "outline") {
    return (
      <a href={href} className={classes} aria-label={`تماس مستقیم: ${display}`}>
        <PhoneIcon className="size-[1.125rem] shrink-0 text-accent-strong" />
        تماس مستقیم
      </a>
    );
  }

  return (
    <a href={href} className={classes}>
      <PhoneIcon className="size-5 shrink-0" />
      تماس برای تعمیر
    </a>
  );
}
