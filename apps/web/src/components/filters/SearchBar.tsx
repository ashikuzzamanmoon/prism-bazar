"use client";

import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const DEBOUNCE_MS = 500;

const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearchTerm = searchParams.get("searchTerm") ?? "";
  const [prevSearchTerm, setPrevSearchTerm] = useState(currentSearchTerm);
  const [value, setValue] = useState(currentSearchTerm);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync if searchTerm param is cleared externally (e.g. "Clear all filters")
  if (currentSearchTerm !== prevSearchTerm) {
    setPrevSearchTerm(currentSearchTerm);
    setValue(currentSearchTerm);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue.trim()) {
        params.set("searchTerm", newValue.trim());
      } else {
        params.delete("searchTerm");
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, DEBOUNCE_MS);
  };

  const handleClear = () => {
    setValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("searchTerm");
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative w-full md:max-w-md ">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />

      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const query = value.trim();
            if (query) {
              router.push(`/search?q=${encodeURIComponent(query)}`);
            }
          }
        }}
        placeholder="Search products..."
        className="w-full h-9 pl-10 pr-9 rounded-md border border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:border-orange-300 bg-white text-sm"
      />

      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
