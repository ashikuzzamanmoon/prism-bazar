import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { seoGuides } from "@/content/seo-guides";
import { buildMetadata } from "@/lib/seo/site";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/schema";

export const metadata: Metadata = buildMetadata({
  title: "প্রিজম বাজার গাইড ও দিকনির্দেশনা (Guides)",
  description:
    "খাঁটি অর্গানিক খাদ্যের গুণাগুণ ও শিক্ষার্থীদের পরীক্ষার প্রস্তুতি বিষয়ক দিকনির্দেশনা এবং তথ্যভিত্তিক গাইড।",
  path: "/guides",
  keywords: [
    "অর্গানিক ফুড গাইড",
    "সুন্দরবনের খাঁটি মধু",
    "স্টাডি গাইড",
    "ডিজিটাল শিট",
    "প্রিজম বাজার",
  ],
});

export default function GuidesPage() {
  const listSchema = buildItemListSchema(
    seoGuides.map((guide) => ({
      name: guide.title,
      path: `/guides/${guide.slug}`,
    })),
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <JsonLd data={listSchema} />
      <JsonLd data={breadcrumbSchema} />

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          প্রিজম বাজার প্রোডাক্ট ও স্টাডি গাইডলাইন
        </h1>
        <p className="mt-3 text-gray-600 max-w-3xl leading-relaxed">
          খাঁটি প্রাকৃতিক খাদ্যদ্রব্যের উপকারিতা এবং শিক্ষার্থীদের প্রস্তুতিকে সহজ করতে আমাদের তথ্যবহুল গাইডসমূহ পড়ুন।
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seoGuides.map((guide) => (
          <article
            key={guide.slug}
            className="rounded-xl border border-gray-200 p-5 bg-white"
          >
            <p className="text-xs uppercase tracking-wide text-primary font-semibold">
              {guide.primaryKeyword}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 mt-2">
              <Link
                href={`/guides/${guide.slug}`}
                className="hover:text-primary transition-colors"
              >
                {guide.title}
              </Link>
            </h2>
            <p className="text-gray-600 mt-3 leading-relaxed">
              {guide.description}
            </p>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Updated {guide.updatedAt}</span>
              <span>{guide.readTime}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
