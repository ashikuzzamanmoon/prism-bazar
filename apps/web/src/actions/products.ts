const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ProductQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sort?: string;
};

export const buildQueryString = (params: ProductQueryParams) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return query.toString();
};

export const getAllProducts = async (params: ProductQueryParams) => {
  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/products${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  console.log("product response", response);

  return response.json();
};

export const getSearchSuggestions = async (searchTerm: string) => {
  const response = await fetch(
    `/api/search?mode=suggest&q=${encodeURIComponent(searchTerm)}&limit=5`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  return response.json();
};
