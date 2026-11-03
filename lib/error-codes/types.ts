// Shared, dependency-free types for the public error-code guide (safe to import from Client Components).

export type VerificationLevel = "unverified" | "partially_verified" | "verified";

// "unverified" rows never leave the data layer, so public code only ever sees these two.
export type PublicVerificationLevel = Exclude<VerificationLevel, "unverified">;

// The fields the public search API returns for each hit.
export type ErrorCodeSearchItem = {
  id: string;
  appliance_category: string;
  brand: string;
  model: string | null;
  model_reference: string | null;
  error_code: string;
  title: string;
  meaning: string;
  verification_level: PublicVerificationLevel;
};
