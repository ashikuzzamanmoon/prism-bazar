import { API_ENDPOINTS } from "@/apiService/config";
import { rankSearchResults } from "@/lib/search/ranking";
import type { IProduct } from "@/types/productTypes";

export async function fetchSearchResults({
  query,
  page = 1,
  limit = 12,
}: {
  query: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({
    searchTerm: query,
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${API_ENDPOINTS.PRODUCT.GetAll}?${params}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  const payload = await response.json();
  const products = (payload?.data?.data || payload?.data || []) as IProduct[];
  return rankSearchResults(products, query);
}

export async function fetchSearchSuggestions(query: string, limit = 5) {
  const ranked = await fetchSearchResults({ query, page: 1, limit });
  return ranked.slice(0, limit);
}
