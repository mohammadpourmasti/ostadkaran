import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons/icon-base";
import { ChartIcon, InboxIcon, OverviewIcon, SettingsIcon, UsersIcon } from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  /** Planned but not built in version 1: shown disabled, never linked. */
  soon?: boolean;
  /** Only managers see this item (the page itself also enforces it). */
  managerOnly?: boolean;
};

export const navItems: readonly NavItem[] = [
  { href: "/admin", label: "نمای کلی", icon: OverviewIcon },
  { href: "/admin/requests", label: "درخواست‌های تعمیر", icon: InboxIcon },
  { href: "/admin/staff", label: "کارکنان", icon: UsersIcon, managerOnly: true },
  { href: "/admin/reports", label: "گزارش‌ها", icon: ChartIcon },
  { href: "/admin/settings", label: "تنظیمات", icon: SettingsIcon },
];
