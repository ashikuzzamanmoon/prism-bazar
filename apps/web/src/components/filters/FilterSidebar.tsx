"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useState,
  useTransition,
  useMemo,
} from "react";
import { Collection, Brand } from "@/types/filter.types";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MIN_PRICE = 12000;
const MAX_PRICE = 150000;

// Scroll wrapper (height limit + scroll)
const ScrollArea = ({ children }: { children: React.ReactNode }) => (
  <div className="max-h-56 overflow-y-auto pr-2 space-y-2.5">{children}</div>
);

interface Props {
  collections: Collection[];
  brands: Brand[];
}

export default function FilterSidebar({ collections, brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCollections =
    searchParams.get("collection")?.split(",").filter(Boolean) ?? [];
  const activeCategories =
    searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const activeSubCategories =
    searchParams.get("subCategory")?.split(",").filter(Boolean) ?? [];
  const activeBrands =
    searchParams.get("brand")?.split(",").filter(Boolean) ?? [];
  const activeMinPrice = searchParams.get("minPrice");
  const activeMaxPrice = searchParams.get("maxPrice");

  const currentMinPrice = Number(activeMinPrice) || MIN_PRICE;
  const currentMaxPrice = Number(activeMaxPrice) || MAX_PRICE;

  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [prevPrices, setPrevPrices] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);

  if (currentMinPrice !== prevPrices[0] || currentMaxPrice !== prevPrices[1]) {
    setPrevPrices([currentMinPrice, currentMaxPrice]);
    setPriceRange([currentMinPrice, currentMaxPrice]);
  }

  // Search inputs (UI improvement)
  const [collectionQuery, setCollectionQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [subCategoryQuery, setSubCategoryQuery] = useState("");
  const [brandQuery, setBrandQuery] = useState("");

  const visibleCategories = useMemo(() => {
    const sourceCols =
      activeCollections.length > 0
        ? collections.filter((col) => activeCollections.includes(col.slug))
        : collections;

    const allCategories = sourceCols.flatMap((col) =>
      (col.categories ?? []).map((cat) => ({
        ...cat,
        collectionSlug: col.slug,
      })),
    );

    // Remove duplicates by category ID
    const uniqueCategories = [];
    const seenIds = new Set();
    for (const cat of allCategories) {
      if (!seenIds.has(cat.id)) {
        seenIds.add(cat.id);
        uniqueCategories.push(cat);
      }
    }

    return uniqueCategories;
  }, [collections, activeCollections]);

  const visibleSubCategories = useMemo(() => {
    const sourceCats =
      activeCategories.length > 0
        ? visibleCategories.filter((cat) => activeCategories.includes(cat.slug))
        : visibleCategories;

    return sourceCats.flatMap((cat) =>
      (cat.subCategories ?? []).map((sub) => ({
        ...sub,
        categorySlug: cat.slug,
        collectionSlug: cat.collectionSlug,
      })),
    );
  }, [visibleCategories, activeCategories]);

  // Helpers
  const findCategoryParent = useCallback(
    (categorySlug: string) => {
      for (const col of collections) {
        const found = col.categories?.find((c) => c.slug === categorySlug);
        if (found) return { collectionSlug: col.slug };
      }
      return null;
    },
    [collections],
  );

  const findSubCategoryParents = useCallback(
    (subSlug: string) => {
      for (const col of collections) {
        for (const cat of col.categories ?? []) {
          const found = cat.subCategories?.find((s) => s.slug === subSlug);
          if (found)
            return { collectionSlug: col.slug, categorySlug: cat.slug };
        }
      }
      return null;
    },
    [collections],
  );

  // Toggle collection
  const toggleCollection = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const current =
        params.get("collection")?.split(",").filter(Boolean) ?? [];
      let updatedCols: string[];
      if (current.includes(slug)) {
        updatedCols = current.filter((s) => s !== slug);
      } else {
        updatedCols = [...current, slug];
      }

      if (!updatedCols.includes(slug) && current.includes(slug)) {
        const remainingCols =
          updatedCols.length > 0
            ? collections.filter((c) => updatedCols.includes(c.slug))
            : collections;

        const allowedCatSlugs = new Set(
          remainingCols.flatMap((c) =>
            (c.categories ?? []).map((cat) => cat.slug),
          ),
        );
        const currentCats =
          params.get("category")?.split(",").filter(Boolean) ?? [];
        const filteredCats = currentCats.filter((c) => allowedCatSlugs.has(c));

        const allowedSubSlugs = new Set(
          remainingCols.flatMap((c) =>
            (c.categories ?? []).flatMap((cat) =>
              (cat.subCategories ?? []).map((s) => s.slug),
            ),
          ),
        );
        const currentSubs =
          params.get("subCategory")?.split(",").filter(Boolean) ?? [];
        const filteredSubs = currentSubs.filter((s) => allowedSubSlugs.has(s));

        filteredCats.length > 0
          ? params.set("category", filteredCats.join(","))
          : params.delete("category");
        filteredSubs.length > 0
          ? params.set("subCategory", filteredSubs.join(","))
          : params.delete("subCategory");
      }

      updatedCols.length > 0
        ? params.set("collection", updatedCols.join(","))
        : params.delete("collection");

      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname, collections],
  );

  // Toggle category
  const toggleCategory = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const current = params.get("category")?.split(",").filter(Boolean) ?? [];
      let updatedCats: string[];

      if (current.includes(slug)) {
        updatedCats = current.filter((s) => s !== slug);

        const remainingCatSlugs = new Set(updatedCats);
        const allowedSubSlugs = new Set(
          collections.flatMap((col) =>
            (col.categories ?? [])
              .filter((cat) => remainingCatSlugs.has(cat.slug))
              .flatMap((cat) => (cat.subCategories ?? []).map((s) => s.slug)),
          ),
        );
        const currentSubs =
          params.get("subCategory")?.split(",").filter(Boolean) ?? [];
        const filteredSubs = currentSubs.filter((s) => allowedSubSlugs.has(s));
        filteredSubs.length > 0
          ? params.set("subCategory", filteredSubs.join(","))
          : params.delete("subCategory");
      } else {
        updatedCats = [...current, slug];
        const parent = findCategoryParent(slug);
        if (parent) {
          const currentCols =
            params.get("collection")?.split(",").filter(Boolean) ?? [];
          if (!currentCols.includes(parent.collectionSlug)) {
            params.set(
              "collection",
              [...currentCols, parent.collectionSlug].join(","),
            );
          }
        }
      }

      updatedCats.length > 0
        ? params.set("category", updatedCats.join(","))
        : params.delete("category");

      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname, collections, findCategoryParent],
  );

  // Toggle subcategory
  const toggleSubCategory = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const current =
        params.get("subCategory")?.split(",").filter(Boolean) ?? [];
      let updatedSubs: string[];

      if (current.includes(slug)) {
        updatedSubs = current.filter((s) => s !== slug);
      } else {
        updatedSubs = [...current, slug];
        const parents = findSubCategoryParents(slug);
        if (parents) {
          const currentCols =
            params.get("collection")?.split(",").filter(Boolean) ?? [];
          if (!currentCols.includes(parents.collectionSlug)) {
            params.set(
              "collection",
              [...currentCols, parents.collectionSlug].join(","),
            );
          }
          const currentCats =
            params.get("category")?.split(",").filter(Boolean) ?? [];
          if (!currentCats.includes(parents.categorySlug)) {
            params.set(
              "category",
              [...currentCats, parents.categorySlug].join(","),
            );
          }
        }
      }

      updatedSubs.length > 0
        ? params.set("subCategory", updatedSubs.join(","))
        : params.delete("subCategory");

      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname, findSubCategoryParents],
  );

  // Toggle brand
  const toggleBrand = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get("brand")?.split(",").filter(Boolean) ?? [];
      const updated = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      updated.length > 0
        ? params.set("brand", updated.join(","))
        : params.delete("brand");
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname],
  );

  const applyPriceFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", String(priceRange[0]));
    params.set("maxPrice", String(priceRange[1]));
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [priceRange, searchParams, router, pathname]);

  const clearAllFilters = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const activeFilterCount =
    activeCollections.length +
    activeCategories.length +
    activeSubCategories.length +
    activeBrands.length;

  // Filtered lists for search UI
  const filteredCollections = useMemo(() => {
    const q = collectionQuery.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter((c) => c.name.toLowerCase().includes(q));
  }, [collections, collectionQuery]);

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return visibleCategories;
    return visibleCategories.filter((c: any) =>
      c.name.toLowerCase().includes(q),
    );
  }, [visibleCategories, categoryQuery]);

  const filteredSubCategories = useMemo(() => {
    const q = subCategoryQuery.trim().toLowerCase();
    if (!q) return visibleSubCategories;
    return visibleSubCategories.filter((s: any) =>
      s.name.toLowerCase().includes(q),
    );
  }, [visibleSubCategories, subCategoryQuery]);

  const filteredBrands = useMemo(() => {
    const all = brands.filter((b) => b.isPublish && !b.isDelete);
    const q = brandQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((b) => b.title.toLowerCase().includes(q));
  }, [brands, brandQuery]);

  return (
    <div className="bg-white rounded-lg border border-gray-200  overflow-hidden">
      {/* Header */}
      <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-sm text-gray-800">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
          {isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-orange-500 hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={[
          "collection",
          "category",
          "subCategory",
          "brand",
          "price",
        ]}
        className="px-4"
      >
        {/* Price Range */}
        <AccordionItem value="price" className="border-0">
          <AccordionTrigger className="text-sm font-semibold text-gray-700 py-3 hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Slider
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={500}
              value={priceRange}
              onValueChange={setPriceRange}
              className="**:[[role=slider]]:bg-orange-500 **:[[role=slider]]:border-orange-500 [&_.bg-primary]:bg-orange-500 pt-2 pb-4"
            />
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                ৳{priceRange[0].toLocaleString()}
              </span>
              <span className="text-gray-300">—</span>
              <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                ৳{priceRange[1].toLocaleString()}
              </span>
            </div>
            <Button
              onClick={applyPriceFilter}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm h-9"
            >
              Apply Price Filter
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Collections */}
        <AccordionItem value="collection" className="border-b border-gray-100">
          <AccordionTrigger className="text-sm font-semibold text-gray-700 py-3 hover:no-underline">
            Collections
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <ScrollArea>
              {filteredCollections.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1 hover:bg-gray-50"
                >
                  <Checkbox
                    id={`col-${col.id}`}
                    checked={activeCollections.includes(col.slug)}
                    onCheckedChange={() => toggleCollection(col.slug)}
                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <Label
                    htmlFor={`col-${col.id}`}
                    className="text-sm text-gray-700 cursor-pointer font-normal"
                  >
                    {col.name}
                  </Label>
                </div>
              ))}
              {filteredCollections.length === 0 && (
                <p className="text-xs text-gray-400 px-2 py-2">
                  No collections found.
                </p>
              )}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        {visibleCategories.length > 0 && (
          <AccordionItem value="category" className="border-b border-gray-100">
            <AccordionTrigger className="text-sm font-semibold text-gray-700 py-3 hover:no-underline">
              Categories
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <ScrollArea>
                {filteredCategories.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={activeCategories.includes(cat.slug)}
                      onCheckedChange={() => toggleCategory(cat.slug)}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <Label
                      htmlFor={`cat-${cat.id}`}
                      className="text-sm text-gray-700 cursor-pointer font-normal"
                    >
                      {cat.name}
                    </Label>
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="text-xs text-gray-400 px-2 py-2">
                    No categories found.
                  </p>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* SubCategories */}
        {visibleSubCategories.length > 0 && (
          <AccordionItem
            value="subCategory"
            className="border-b border-gray-100"
          >
            <AccordionTrigger className="text-sm font-semibold text-gray-700 py-3 hover:no-underline">
              Sub Categories
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <ScrollArea>
                {filteredSubCategories.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`sub-${sub.id}`}
                      checked={activeSubCategories.includes(sub.slug)}
                      onCheckedChange={() => toggleSubCategory(sub.slug)}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <Label
                      htmlFor={`sub-${sub.id}`}
                      className="text-sm text-gray-700 cursor-pointer font-normal"
                    >
                      {sub.name}
                    </Label>
                  </div>
                ))}
                {filteredSubCategories.length === 0 && (
                  <p className="text-xs text-gray-400 px-2 py-2">
                    No sub categories found.
                  </p>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Brands */}
        {brands.length > 0 && (
          <AccordionItem value="brand" className="border-b border-gray-100">
            <AccordionTrigger className="text-sm font-semibold text-gray-700 py-3 hover:no-underline">
              Brands
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <ScrollArea>
                {filteredBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={activeBrands.includes(brand.slug)}
                      onCheckedChange={() => toggleBrand(brand.slug)}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-normal"
                    >
                      {brand.image && (
                        <img
                          src={brand.image}
                          alt={brand.title}
                          className="w-5 h-5 object-contain rounded"
                        />
                      )}
                      {brand.title}
                    </Label>
                  </div>
                ))}
                {filteredBrands.length === 0 && (
                  <p className="text-xs text-gray-400 px-2 py-2">
                    No brands found.
                  </p>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
