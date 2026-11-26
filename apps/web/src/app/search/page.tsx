import ProductGrid from "@/components/shop/ProductGrid";
import PaginationControls from "@/components/shop/PaginationControls";
import { buildMetadata } from "@/lib/seo/site";
import { fetchSearchResults } from "@/lib/search/catalog";

export const revalidate = 300;

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;

  return buildMetadata({
    title: q ? `Search results for ${q}` : "পণ্য খুঁজুন | Search Products",
    description: q
      ? `Browse search results for ${q}, ranked by relevance, product popularity, review quality, and price competitiveness.`
      : "সিরাজগঞ্জ ও কাজীপুরসহ সারাদেশে খাঁটি অর্গানিক খাদ্য এবং শিক্ষা সামগ্রী খুঁজুন।",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    keywords: q ? [q, `${q} prism bazar`] : ["অর্গানিক ফুড", "শিক্ষা সামগ্রী", "প্রিজম বাজার"],
    noIndex: !q,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const products = q
    ? await fetchSearchResults({ query: q, page: currentPage, limit: 12 })
    : [];

  const params = new URLSearchParams();
  if (q) params.set("q", q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 rounded-3xl border border-gray-200 bg-linear-to-r from-white via-orange-50 to-amber-50 px-6 py-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
          Search
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          {q ? `Results for “${q}”` : "প্রয়োজনীয় পণ্য সহজে খুঁজুন"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Results are ranked by title match, description relevance, typo
          tolerance, ratings, and popularity signals.
        </p>
      </div>

      {q ? (
        <>
          <ProductGrid products={products} />
          <PaginationControls
            pathname="/search"
            params={params}
            page={currentPage}
            hasNextPage={products.length >= 12}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-600">
          পণ্যটির নাম বা ক্যাটাগরি লিখে সার্চ করুন — যেমন: খাঁটি মধু, গাওয়া ঘি, সরিষার তেল, স্টাডি গাইড বা ডিজিটাল শিট।
        </div>
      )}
    </div>
  );
}
