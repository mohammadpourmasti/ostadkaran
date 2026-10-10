import { IconBase, type IconProps } from "./icon-base";

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 3.5h3l1.75 4.5-2.25 1.5a11 11 0 0 0 6.5 6.5l1.5-2.25 4.5 1.75v3a2 2 0 0 1-2 2C10.5 20.5 3.5 13.5 3.5 5.5a2 2 0 0 1 2-2Z" />
    </IconBase>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 3.25A5.25 5.25 0 0 0 9.64 10.48l-6.3 6.3a2 2 0 0 0 2.83 2.83l6.3-6.3A5.25 5.25 0 0 0 19.7 8.45l-3.2-.55-.4-3.4Z" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  );
}

export function LocationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </IconBase>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.25 2.25 2.25 4.75-4.75" />
    </IconBase>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 3.5 5.5 13.25h6L11 20.5l7.5-9.75h-6l.5-7.25Z" />
    </IconBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </IconBase>
  );
}

export function MouseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="7" y="3.5" width="10" height="17" rx="5" />
      <path d="M12 7v3" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

export function ArrowStartIcon(props: IconProps) {
  // Points toward the reading end in RTL (left on screen).
  return (
    <IconBase {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </IconBase>
  );
}
