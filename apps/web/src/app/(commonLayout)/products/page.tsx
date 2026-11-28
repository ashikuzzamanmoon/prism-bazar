import { Suspense } from "react";
import {
  getProducts,
  getAllCollections,
  getAllBrands,
} from "@/apiService/apiService";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ProductGrid from "@/components/shop/ProductGrid";
import SortDropdown from "@/components/shop/SortDropdown";
import SearchBar from "@/components/filters/SearchBar";
import MobileFilterDrawer from "@/components/filters/MobileFilterDrawer";
import Pagination from "@/components/shop/Pagination";
import { FilterParams } from "@/types/filter.types";

interface PageProps {
  searchParams: Promise<FilterParams>;
}

function ProductGridSkeleton() {
  return (
    <div className="w-full min-w-0">
      <div className="h-5 w-44 max-w-full bg-gray-100 rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="group w-full h-full border border-gray-100 p-1 bg-white flex flex-col animate-pulse"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg mb-3 bg-gray-100" />
            <div className="flex flex-col flex-1 px-2">
              <div className="h-4 bg-gray-100 rounded w-11/12 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-7/12 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-10/12 mb-4" />
              <div className="h-6 bg-gray-100 rounded w-6/12 mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return <div className="w-full h-96 bg-gray-100 rounded-xl animate-pulse" />;
}

function ProductsPageSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-col items-start gap-3 mb-4 md:hidden w-full">
        <div className="w-full h-10 bg-gray-100 rounded-md animate-pulse" />
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="w-full h-9 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-full h-9 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>

      <div className="flex gap-6 w-full">
        <aside className="hidden md:block w-64 shrink-0">
          <SidebarSkeleton />
        </aside>

        <main className="flex-1 min-w-0 w-full">
          <div className="hidden md:flex items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-lg w-full">
            <div className="flex-1 h-10 bg-gray-100 rounded-md animate-pulse" />
            <div className="w-45 h-10 bg-gray-100 rounded-md animate-pulse" />
          </div>
          <ProductGridSkeleton />
        </main>
      </div>
    </div>
  );
}

async function ProductsPageContent({
  filters,
  activeFilterCount,
}: {
  filters: FilterParams;
  activeFilterCount: number;
}) {
  const [collections, brands, { data: products, meta }] = await Promise.all([
    getAllCollections(),
    getAllBrands(),
    getProducts(filters),
  ]);

  return (
    <>
      <div className="flex flex-col items-start gap-3 mb-4 md:hidden w-full">
        <div className="w-full md:hidden">
          <SearchBar />
        </div>
        <div className="flex items-center justify-between w-full gap-4">
          <MobileFilterDrawer activeFilterCount={activeFilterCount}>
            <FilterSidebar collections={collections} brands={brands} />
          </MobileFilterDrawer>
          <SortDropdown activeSort={filters.sortByPrice} />
        </div>
      </div>

      <div className="flex gap-6 w-full">
        <aside className="hidden md:block w-64 shrink-0">
          <FilterSidebar collections={collections} brands={brands} />
        </aside>

        <main className="flex-1 min-w-0 w-full">
          <div className="hidden md:flex items-center justify-between gap-4 mb-6 bg-emerald-50/40 border border-emerald-100/60 p-4 rounded-2xl">
            <SearchBar />
            <div className="min-w-38">
              <SortDropdown activeSort={filters.sortByPrice} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              পণ্য সামগ্রী
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              মোট {meta?.total || products?.length || 0} টির মধ্যে {products?.length || 0} টি পণ্য
            </p>
          </div>
          <ProductGrid products={products} />
          <Pagination meta={meta} />
        </main>
      </div>
    </>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const filters = await searchParams;

  // Calculate active filter count to show badge on mobile trigger button
  const activeFilterCount = [
    filters.collection,
    filters.category,
    filters.subCategory,
    filters.brand,
  ].flatMap((v) => v?.split(",").filter(Boolean) ?? []).length;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-4">
      <Suspense
        key={JSON.stringify(filters)}
        fallback={<ProductsPageSkeleton />}
      >
        <ProductsPageContent
          filters={filters}
          activeFilterCount={activeFilterCount}
        />
      </Suspense>
    </div>
  );
}
