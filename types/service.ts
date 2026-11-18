import type { ApplianceId } from "@/types/appliance";

export type ServiceProblem = {
  // Reserved for future problem-focused pages (e.g. /services/<service>/<slug>). Not routed or linked yet.
  slug?: string;
  title: string;
  description: string;
};

export type ServiceFaq = {
  question: string;
  answer: string;
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
  // Device-specific questions and answers shown near the end of the page.
  faqs: readonly ServiceFaq[];
  // Optional safety notice shown beside the checklist.
  safetyNote?: string;
  // Optional device photo for the header; pages without it show the shared technician photo.
  image?: {
    src: string;
    alt: string;
  };
};

// A dedicated problem page (/services/<service slug>/<problem slug>). The older `ServiceProblem` card model is unchanged;
// problem pages live in data/service-problems.ts and attach to a service through `serviceId`.
export type ProblemPageStatus = "draft" | "approved";

export type ProblemCause = {
  // The part that is usually involved, e.g. "فیلتر پمپ".
  part: string;
  description: string;
};

// "official": official-source row; "limited": valid only with a stated limit (model or generic guide);
// "needs-review": model or source not confirmed yet. Needs-review codes stay visible (with their partially_verified
// badge) in their own section but never count towards the indexing minimum.
export type ProblemCodeTier = "official" | "limited" | "needs-review";

export type ProblemCodeRef = {
  // Must match a published error_codes row exactly (brand + error_code as stored).
  brand: string;
  code: string;
  tier: ProblemCodeTier;
  // When set, only the row stored for exactly this model matches (e.g. "DWD-M8011").
  model?: string;
  // Short visible note about the limit of validity.
  note?: string;
};

export type ProblemPage = {
  slug: string;
  serviceId: ApplianceId;
  // "draft" is never built or shown in production; only "approved" content (technical review done) is public.
  status: ProblemPageStatus;
  // Set when approved: the real last content change (sitemap lastModified) and the review date.
  updatedAt: string;
  reviewedAt?: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  // Search phrase this page targets (internal note, not rendered).
  targetPhrase: string;
  // `title` of the existing ServiceProblem card on the service page that should link here.
  cardTitle: string;
  intro: readonly string[];
  symptoms: readonly string[];
  causes: readonly ProblemCause[];
  safeChecks: readonly string[];
  callWhen: readonly string[];
  safetyNote?: string;
  faqs: readonly ServiceFaq[];
  codeRefs: readonly ProblemCodeRef[];
};
