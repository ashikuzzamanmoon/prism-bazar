"use client";

import { IProduct, IProductImage } from "@/types/productTypes";
import { Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getSingleProduct } from "@/apiService/apiService";

const getPrimaryImage = (images: IProductImage[]): string => {
  if (!images || images.length === 0) return "/placeholder.svg";
  const primary = images.find((img) => img.isPrimary);
  return primary?.url || images[0]?.url || "/placeholder.svg";
};

const COMPARE_SLOTS = 3;
const SEARCH_DEBOUNCE_MS = 350;

const formatPrice = (value?: string) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0";
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const normalizeFeatureKey = (key: string) => key.trim().toLowerCase();

const buildFeatureLookup = (product: any) => {
  const map = new Map<string, string>();
  if (product?.productFeatures?.length) {
    product.productFeatures.forEach((pf: any) => {
      const title = pf.title || "General";
      pf.features?.forEach((f: any) => {
        if (f.key) {
          map.set(`${title}::${normalizeFeatureKey(f.key)}`, f.value || "-");
        }
      });
    });
  } else if (product?.features?.length) {
    product.features.forEach((feature: any) => {
      const featureKey = feature?.key?.trim();
      if (!featureKey) return;
      map.set(`General::${normalizeFeatureKey(featureKey)}`, feature.value || "-");
    });
  }
  return map;
};

const CompareFeatureRow = ({
  category,
  label,
  products,
  featureLookups,
  isLast,
}: {
  category: string;
  label: string;
  products: (IProduct | null)[];
  featureLookups: Map<string, string>[];
  isLast?: boolean;
}) => {
  const key = `${category}::${normalizeFeatureKey(label)}`;

  return (
    <div className={`grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 xl:gap-6 py-2 md:py-3 px-2 md:px-4 ${isLast ? '' : 'border-b border-gray-100'}`}>
      <div className="flex text-[11px] md:text-sm xl:text-base font-medium text-gray-500 xl:text-gray-700 items-center col-span-1 pr-1">
        {label}
      </div>

      {products.map((product, index) => {
        const value = featureLookups[index].get(key) || "-";

        return (
          <div
            key={`${label}-${index}`}
            className={`flex-col justify-center py-1 xl:py-0 col-span-1 ${index === 2 ? 'hidden md:flex' : 'flex'}`}
          >
            <span className="text-[11px] md:text-sm text-gray-900 text-left min-w-0 flex-1 wrap-break-word">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const CompareProductShow = ({ productData }: { productData: IProduct }) => {
  const [selectedProducts, setSelectedProducts] = useState<(IProduct | null)[]>(
    [productData, null, null],
  );
  const [queries, setQueries] = useState<string[]>(["", "", ""]);
  const [suggestions, setSuggestions] = useState<IProduct[][]>([[], [], []]);
  const [loadingSlots, setLoadingSlots] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [openSlot, setOpenSlot] = useState<number | null>(null);

  const selectedCount = useMemo(
    () => selectedProducts.filter(Boolean).length,
    [selectedProducts],
  );

  const featureLookups = useMemo(
    () => selectedProducts.map((product) => buildFeatureLookup(product)),
    [selectedProducts],
  );

  const featureGroups = useMemo(() => {
    const groupsMap = new Map<string, { keys: Set<string>; image?: string }>();

    selectedProducts.forEach((product: any) => {
      if (product?.productFeatures?.length) {
        product.productFeatures.forEach((pf: any) => {
          const title = pf.title || "General";
          if (!groupsMap.has(title)) {
            groupsMap.set(title, { keys: new Set(), image: pf.image });
          } else if (pf.image && !groupsMap.get(title)!.image) {
            groupsMap.get(title)!.image = pf.image;
          }
          pf.features?.forEach((f: any) => {
            if (f.key) groupsMap.get(title)!.keys.add(f.key);
          });
        });
      } else if (product?.features?.length) {
        const title = "General";
        if (!groupsMap.has(title)) {
          groupsMap.set(title, { keys: new Set() });
        }
        product.features.forEach((f: any) => {
          if (f.key) groupsMap.get(title)!.keys.add(f.key);
        });
      }
    });

    const groups: { title: string; image?: string; keys: string[] }[] = [];
    groupsMap.forEach((data, title) => {
      groups.push({ title, image: data.image, keys: Array.from(data.keys) });
    });
    return groups;
  }, [selectedProducts]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceTimers = useRef<Array<ReturnType<typeof setTimeout> | null>>([
    null,
    null,
    null,
  ]);

  const selectedIds = useMemo(
    () =>
      new Set(selectedProducts.filter(Boolean).map((product) => product!.id)),
    [selectedProducts],
  );

  useEffect(() => {
    setSelectedProducts((current) => [productData, current[1], current[2]]);
  }, [productData]);

  useEffect(() => {
    const closeDropdownOnOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpenSlot(null);
      }
    };

    document.addEventListener("mousedown", closeDropdownOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeDropdownOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const updateSlotState = (
    slot: number,
    updater: (prev: (IProduct | null)[]) => (IProduct | null)[],
  ) => {
    if (slot < 0 || slot >= COMPARE_SLOTS) return;
    setSelectedProducts(updater);
  };

  const fetchSuggestions = async (slot: number, query: string) => {
    if (!query.trim()) {
      setSuggestions((current) => {
        const next = [...current];
        next[slot] = [];
        return next;
      });
      setLoadingSlots((current) => {
        const next = [...current];
        next[slot] = false;
        return next;
      });
      return;
    }

    setLoadingSlots((current) => {
      const next = [...current];
      next[slot] = true;
      return next;
    });

    try {
      const response = await fetch(
        `/api/search?mode=suggest&q=${encodeURIComponent(query)}&limit=7`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const payload = await response.json();
      const products = (payload?.data || []) as IProduct[];

      setSuggestions((current) => {
        const next = [...current];
        next[slot] = products.filter((item) => !selectedIds.has(item.id));
        return next;
      });
    } catch {
      setSuggestions((current) => {
        const next = [...current];
        next[slot] = [];
        return next;
      });
    } finally {
      setLoadingSlots((current) => {
        const next = [...current];
        next[slot] = false;
        return next;
      });
    }
  };

  const handleQueryChange = (slot: number, value: string) => {
    setQueries((current) => {
      const next = [...current];
      next[slot] = value;
      return next;
    });
    setOpenSlot(slot);

    const existing = debounceTimers.current[slot];
    if (existing) clearTimeout(existing);

    debounceTimers.current[slot] = setTimeout(() => {
      fetchSuggestions(slot, value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSelectProduct = async (slot: number, product: IProduct) => {
    updateSlotState(slot, (current) => {
      const next = [...current];
      next[slot] = product;
      return next;
    });

    try {
      const fullProduct = await getSingleProduct(product.id);
      if (fullProduct) {
        updateSlotState(slot, (current) => {
          const next = [...current];
          next[slot] = fullProduct;
          return next;
        });
      }
    } catch (error) {
      console.error("Error fetching full product details:", error);
    }

    setQueries((current) => {
      const next = [...current];
      next[slot] = "";
      return next;
    });
    setSuggestions((current) => {
      const next = [...current];
      next[slot] = [];
      return next;
    });
    setOpenSlot(null);
  };

  const handleRemoveProduct = (slot: number) => {
    updateSlotState(slot, (current) => {
      const next = [...current];
      next[slot] = null;
      return next;
    });
    setQueries((current) => {
      const next = [...current];
      next[slot] = "";
      return next;
    });
    setSuggestions((current) => {
      const next = [...current];
      next[slot] = [];
      return next;
    });
    setOpenSlot(slot);
  };

  return (
    <div className="space-y-5 md:space-y-6" ref={wrapperRef}>
      <div className="rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Product Compare
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Search, select, and compare up to 3 products side by side.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs md:text-sm font-medium text-emerald-700">
            Selected {selectedCount}/{COMPARE_SLOTS}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-5 rounded-2xl border border-slate-200 bg-white p-2 md:p-4">
        <div className="hidden md:flex rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 items-center justify-center min-h-90 md:min-h-105">
          <p className="text-center text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
            Compare up to 3 products
          </p>
        </div>

        {Array.from({ length: COMPARE_SLOTS }).map((_, slot) => {
          const currentProduct = selectedProducts[slot];
          const currentSuggestions = suggestions[slot];
          const currentQuery = queries[slot];

          return (
            <div
              key={slot}
              className={`rounded-xl border border-slate-200 bg-white min-h-72 md:min-h-105 flex-col shadow-sm ${slot === 2 ? 'hidden md:flex' : 'flex'}`}
            >
              <div className="border-b border-slate-100 p-3 relative">
                {currentProduct ? (
                  <div className="flex items-center justify-between gap-1 md:gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 md:px-3 py-1.5 md:py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-slate-500 truncate">
                        Product {slot + 1}
                      </p>
                      <h3 className="text-xs md:text-base font-semibold text-slate-900 truncate">
                        {currentProduct.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(slot)}
                      className="text-slate-500 hover:text-slate-900 rounded-md p-1 hover:bg-white shrink-0"
                      aria-label={`Remove ${currentProduct.title} from compare`}
                    >
                      <X className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <label className="text-[11px] uppercase tracking-wide text-slate-500 mb-1 block">
                      Product {slot + 1}
                    </label>
                    <input
                      value={currentQuery}
                      onChange={(event) =>
                        handleQueryChange(slot, event.target.value)
                      }
                      onFocus={() => setOpenSlot(slot)}
                      placeholder="Search and select product"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                    <Search className="absolute right-3 top-[65%] h-5 w-5 -translate-y-1/2 text-emerald-600" />

                    {openSlot === slot &&
                      (currentQuery.trim() || loadingSlots[slot]) && (
                        <div className="absolute left-0 top-[calc(100%+8px)] z-10 w-full rounded-lg border border-slate-200 bg-white shadow-xl max-h-64 overflow-y-auto">
                          {loadingSlots[slot] && (
                            <p className="px-3 py-2 text-sm text-slate-500">
                              Searching...
                            </p>
                          )}

                          {!loadingSlots[slot] &&
                            currentSuggestions.length === 0 && (
                              <p className="px-3 py-2 text-sm text-slate-500">
                                No matching product found.
                              </p>
                            )}

                          {!loadingSlots[slot] &&
                            currentSuggestions.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() =>
                                  handleSelectProduct(slot, product)
                                }
                                className="w-full border-b border-slate-100 last:border-b-0 px-3 py-2 text-left hover:bg-slate-50"
                              >
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {product.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {product.modelNumber}
                                </p>
                              </button>
                            ))}
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex items-center justify-center">
                {currentProduct ? (
                  <div className="w-full">
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg mb-3 bg-slate-50 border border-slate-100">
                      <Image
                        src={
                          getPrimaryImage(
                            currentProduct.productImages as IProductImage[],
                          ).includes("example.com")
                            ? "/prism-bazar.jpg"
                            : getPrimaryImage(
                              currentProduct.productImages as IProductImage[],
                            )
                        }
                        alt={currentProduct.title}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-orange-500">
                        {formatPrice(currentProduct.price)}
                      </p>
                      {Number(currentProduct.basePrice) >
                        Number(currentProduct.price) && (
                          <p className="text-base text-slate-500 line-through mt-1">
                            {formatPrice(currentProduct.basePrice)}
                          </p>
                        )}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm md:text-base text-slate-400">
                    Search to add a product here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-5 rounded-2xl border border-slate-200 bg-white p-2 md:p-4">
        <div className="hidden md:flex text-lg md:text-2xl font-semibold text-slate-700 px-2 py-3 md:py-4 items-center">
          Action
        </div>

        {selectedProducts.map((product, index) => (
          <div
            key={index}
            className={`px-1 md:px-2 py-2 items-center justify-center ${index === 2 ? 'hidden md:flex' : 'flex'}`}
          >
            {product ? (
              <Link
                href={`/products/${product.slug}`}
                className="h-10 md:h-12 w-full max-w-75 rounded-lg bg-[#F27221] text-white font-semibold text-sm md:text-base flex items-center justify-center gap-1 md:gap-2 hover:opacity-90 transition-opacity"
              >
                Buy Now <ShoppingCart className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-full border-b border-slate-200" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 flex flex-col gap-2">
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">
            Specifications Comparison
          </h3>
          <p className="text-sm md:text-base text-slate-600">
            Detailed side-by-side comparison of technical specifications.
          </p>
        </div>

        {featureGroups.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
            <p className="text-slate-500 text-sm md:text-base text-center py-8">
              Select products to view side-by-side feature comparison.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {featureGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="bg-slate-50 px-4 md:px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                  {group.image && (
                    <Image src={group.image} alt={group.title} width={28} height={28} className="object-contain" />
                  )}
                  <h4 className="text-lg md:text-xl font-semibold text-[#F27221]">{group.title}</h4>
                </div>
                <div className="p-0">
                  {group.keys.map((label, idx) => (
                    <CompareFeatureRow
                      key={label}
                      category={group.title}
                      label={label}
                      products={selectedProducts}
                      featureLookups={featureLookups}
                      isLast={idx === group.keys.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProductShow;
