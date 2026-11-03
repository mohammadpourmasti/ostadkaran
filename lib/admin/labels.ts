import { appliances } from "@/data/appliances";

const applianceTitles = new Map<string, string>(appliances.map((appliance) => [appliance.id, appliance.title]));

export const applianceOptions: readonly { value: string; label: string }[] = appliances.map((appliance) => ({
  value: appliance.id,
  label: appliance.title,
}));

export function applianceLabel(id: string): string {
  return applianceTitles.get(id) ?? id;
}
