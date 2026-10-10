import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function AppliancesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="2.5" y="3" width="8" height="18" rx="1.5" />
      <path d="M2.5 10h8M5 6v2M5 13v3" />
      <rect x="13.5" y="8" width="8" height="13" rx="1.5" />
      <circle cx="17.5" cy="15" r="2.75" />
      <path d="M15.5 11h.01M18 11h2" />
    </IconBase>
  );
}

export function TechnicianIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 9.5V8a5.5 5.5 0 0 1 11 0v1.5" />
      <path d="M4.5 9.5h15M12 2.5v3" />
      <circle cx="12" cy="13" r="3" />
      <path d="M5 21.5c0-3.6 3-6 7-6s7 2.4 7 6" />
    </IconBase>
  );
}

export function ToolsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 3.25a4.5 4.5 0 0 0-4.2 6.1L3.6 16.05a1.9 1.9 0 0 0 2.7 2.7l6.7-6.7a4.5 4.5 0 0 0 6.1-4.2l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6a4.5 4.5 0 0 0-1.6-.6Z" />
      <path d="m14.5 14.5 5.5 5.5M20.5 17.5l-3 3" />
    </IconBase>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2.75 4.5 5.5v6c0 4.4 3.1 8.1 7.5 9.75 4.4-1.65 7.5-5.35 7.5-9.75v-6L12 2.75Z" />
      <path d="m8.75 12 2.5 2.5 4.25-4.75" />
    </IconBase>
  );
}
