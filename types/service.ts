import type { ApplianceId } from "@/types/appliance";

export type ServiceProblem = {
  title: string;
  description: string;
};

// One dedicated service page. `id` is the existing ApplianceId (form / orbit); `slug` is only the URL segment.
export type Service = {
  id: ApplianceId;
  slug: string;
  // Short link text for navigation, e.g. "تعمیر یخچال".
  navTitle: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  // Schema.org `serviceType`.
  serviceType: string;
  intro: readonly string[];
  problems: readonly ServiceProblem[];
  beforeCalling: readonly string[];
  // Optional safety notice shown beside the checklist.
  safetyNote?: string;
  // Optional device photo for the header; pages without it show the shared technician photo.
  image?: {
    src: string;
    alt: string;
  };
};
