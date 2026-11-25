"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import { IProduct } from "@/types/productTypes";
import { getSearchSuggestions } from "@/actions/products";
import { cn } from "@/utils/utils";
import { useRouter } from "next/navigation";

const HeaderSearch = ({ className }: { className?: string }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(searchQuery);
        const suggestionsData = data?.data?.data || data?.data || [];

        if (Array.isArray(suggestionsData)) {
          setSuggestions(suggestionsData);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const submitSearch = () => {
    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={cn("relative w-full max-w-xl", className)} ref={searchRef}>
      <div className="relative group flex items-center w-full">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitSearch();
            }
          }}
          className="w-full h-10 pl-10 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#ff7200] focus:ring-1 focus:ring-[#ff7200] transition-all duration-200"
        />
        <Search className="absolute left-3 h-4 w-4 text-gray-400 group-focus-within:text-[#ff7200] transition-colors" />

        {searchQuery && (
          <button
            title="Clear search"
            type="button"
            className="absolute right-2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setSearchQuery("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden max-h-100 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Products
              </div>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={handleSuggestionClick}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="relative w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={
                        product.productImages?.[0]?.url || "/placeholder.svg"
                      }
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-[#ff7200] font-semibold mt-0.5">
                      ৳ {product.basePrice}
                    </p>
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={submitSearch}
                className="mx-2 mt-2 flex w-[calc(100%-1rem)] items-center justify-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                View all search results
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">
                No products found for &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={submitSearch}
                className="mt-4 inline-flex rounded-md border border-orange-300 px-3 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50"
              >
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
