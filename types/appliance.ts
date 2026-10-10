export type ApplianceId =
  | "washing-machine"
  | "refrigerator"
  | "dishwasher"
  | "television"
  | "stove"
  | "vacuum-cleaner"
  | "air-conditioner"
  | "other";

export type Appliance = {
  id: ApplianceId;
  title: string;
  description: string;
  // Shown in the hero hint panel when the appliance is selected.
  commonProblems: readonly string[];
  image: {
    src: string;
    width: number;
    height: number;
  };
};
