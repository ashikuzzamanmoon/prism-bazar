import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeoGuideBySlug, seoGuideSlugs } from "@/content/seo-guides";
import { buildMetadata } from "@/lib/seo/site";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
} from "@/lib/seo/schema";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return seoGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSeoGuideBySlug(slug);

  if (!guide) {
    return buildMetadata({
      title: "Guide not found",
      path: `/guides/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    keywords: [guide.primaryKeyword, "Prism Bazar Guides"],
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getSeoGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ]);

  const faqSchema = buildFAQSchema(guide.faqs);
  const articleSchema = buildArticleSchema({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    keywords: [guide.primaryKeyword, "Prism Bazar Products"],
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <article>
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wide text-primary font-semibold">
            {guide.primaryKeyword}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 leading-tight">
            {guide.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
            <span>Published {guide.publishedAt}</span>
            <span>Updated {guide.updatedAt}</span>
            <span>{guide.readTime}</span>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            {guide.description}
          </p>
        </header>

        <div className="space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {section.heading}
              </h2>
              <div className="space-y-4 text-gray-700 leading-8">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-gray-200 p-6 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">FAQs</h2>
          <div className="space-y-5">
            {guide.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-7 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-primary/25 bg-primary/5 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            প্রিজম বাজারের পণ্যসমূহ দেখুন
          </h2>
          <p className="text-gray-700 mt-2 leading-7">
            আমাদের খাঁটি অর্গানিক খাদ্য সামগ্রী এবং শিক্ষা সহায়িকা ও নোটের সম্পূর্ণ তালিকা থেকে আপনার পছন্দের পণ্যটি সহজে বেছে নিন।
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Browse Products
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              View All Guides
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
