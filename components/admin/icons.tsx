import { IconBase, type IconProps } from "@/components/icons/icon-base";

export function OverviewIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="3.5" width="7" height="8" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.8" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.8" />
      <rect x="3.5" y="14.5" width="7" height="6" rx="1.8" />
    </IconBase>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 13.5 6.4 5.8A1.8 1.8 0 0 1 8.1 4.5h7.8a1.8 1.8 0 0 1 1.7 1.3L20 13.5" />
      <path d="M4 13.5v4.2A1.8 1.8 0 0 0 5.8 19.5h12.4a1.8 1.8 0 0 0 1.8-1.8v-4.2h-4.4a2.6 2.6 0 0 1-2.2 1.2h-2.8a2.6 2.6 0 0 1-2.2-1.2Z" />
    </IconBase>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.4a5.5 5.5 0 0 1 3 5.1" />
    </IconBase>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20V5M4 20h16" />
      <path d="M8 16v-4M12.5 16V8M17 16v-6.5" />
    </IconBase>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </IconBase>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 4.5H6.8A1.8 1.8 0 0 0 5 6.3v11.4a1.8 1.8 0 0 0 1.8 1.8H14" />
      <path d="M10 12h10M17 8.5 20.5 12 17 15.5" />
    </IconBase>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </IconBase>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 3.5 20.5 20.5" />
      <path d="M10 5.8A8.6 8.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.4 15.4 0 0 1-3 3.6M6.4 7.6A15.3 15.3 0 0 0 2.5 12S6 18.5 12 18.5a8.7 8.7 0 0 0 3.6-.8" />
    </IconBase>
  );
}

export function PhoneRingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.6 4.5h2.6l1.5 3.9-1.8 1.2a11 11 0 0 0 5 5l1.2-1.8 3.9 1.5v2.6a1.8 1.8 0 0 1-1.9 1.8C10 18.3 5.7 14 4.8 6.4a1.8 1.8 0 0 1 1.8-1.9Z" />
    </IconBase>
  );
}
