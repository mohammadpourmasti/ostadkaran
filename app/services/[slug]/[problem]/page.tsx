import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ProblemPageView } from "@/components/services/problem-page";
import { getProblemPage, getVisibleProblemPages, isPreviewEnabled, problemPath } from "@/data/service-problems";
import { getServiceBySlug, services } from "@/data/services";
import { countIndexableCodes, getProblemCodes } from "@/lib/error-codes/problem-codes";
import { isProblemPageIndexable } from "@/lib/error-codes/visibility";
import { faqJsonLd } from "@/lib/seo/faq-schema";
import { problemBreadcrumbJsonLd, problemServiceJsonLd } from "@/lib/seo/problem-schema";
import { defaultOgImages, siteConfig } from "@/lib/site";

// Only the problem pages listed by generateStaticParams exist; anything else is a 404. Adding or approving a page
// therefore needs a new build and deploy. Approved pages are built for production; drafts are added only when
// running `next dev`, which is the whole preview mechanism (a production build never contains a draft).
export const dynamicParams = false;
// Code lists are read from the database: refresh them periodically.
export const revalidate = 300;

export function generateStaticParams() {
  return getVisibleProblemPages().flatMap((problem) => {
    const service = services.find((item) => item.id === problem.serviceId);
    return service ? [{ slug: service.slug, problem: problem.slug }] : [];
  });
}

type Props = { params: Promise<{ slug: string; problem: string }> };

function resolve(slug: string, problemSlug: string) {
  const service = getServiceBySlug(slug);
  if (!service) return null;
  const problem = getProblemPage(service.id, problemSlug);
  // Defence in depth: a draft is never served outside development, even if a route were ever generated for it.
  if (!problem || (problem.status !== "approved" && !isPreviewEnabled())) return null;
  return { service, problem };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, problem: problemSlug } = await params;
  const found = resolve(slug, problemSlug);
  if (!found) return {};
  const { problem } = found;

  const codes = await getProblemCodes(problem);
  // Access and indexing are separate: an approved page is always viewable, but is indexed only with enough counted codes
  // (official + limited; needs-review codes are shown but not counted).
  const indexable = isProblemPageIndexable(problem.status, countIndexableCodes(codes));
  const path = problemPath(problem);

  return {
    title: problem.metaTitle,
    description: problem.metaDescription,
    alternates: { canonical: path },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      images: defaultOgImages,
      title: `${problem.metaTitle} | ${siteConfig.name}`,
      description: problem.metaDescription,
      url: path,
    },
  };
}

export default async function ProblemRoute({ params }: Props) {
  const { slug, problem: problemSlug } = await params;
  const found = resolve(slug, problemSlug);
  if (!found) notFound();
  const { service, problem } = found;

  const codes = await getProblemCodes(problem);
  const isDraftPreview = problem.status !== "approved";

  return (
    <>
      <JsonLd data={problemServiceJsonLd(problem)} />
      <JsonLd data={problemBreadcrumbJsonLd(problem)} />
      {problem.faqs.length > 0 && <JsonLd data={faqJsonLd(problem.faqs)} />}
      <ProblemPageView problem={problem} service={service} codes={codes} isDraftPreview={isDraftPreview} />
    </>
  );
}
