import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { seoGuides } from "@/content/seo-guides";
import { buildMetadata } from "@/lib/seo/site";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/schema";

export const metadata: Metadata = buildMetadata({
  title: "Laptop Buying Guides Bangladesh 2026",
  description:
    "Explore laptop buying guides for Bangladesh including budget picks, gaming guidance, and student recommendations with updated local context.",
  path: "/guides",
  keywords: [
    "laptop buying guide bangladesh",
    "best laptop in BD",
    "laptop price in bangladesh",
    "buy laptop online BD",
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
          Laptop Buying Guides for Bangladesh
        </h1>
        <p className="mt-3 text-gray-600 max-w-3xl leading-relaxed">
          Practical guides focused on Bangladeshi buyers: budget planning,
          gaming decisions, student recommendations, and smarter online buying.
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
