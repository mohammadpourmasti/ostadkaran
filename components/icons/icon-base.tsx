import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

// Shared 24×24 line-icon frame. Icons are decorative by default; pass
// aria-hidden={false} plus a <title> or aria-label when one carries meaning alone.
export function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
