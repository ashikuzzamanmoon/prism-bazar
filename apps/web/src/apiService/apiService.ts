"use server";
import { cookies } from "next/headers";
import { API_ENDPOINTS } from "./config";
import { Brand, Collection, FilterParams } from "@/types/filter.types";
import { IProduct } from "@/types/productTypes";
import { IUserProfile } from "@/app/(commonLayout)/profile/ProfileForm";

export default async function getServerData(endpoint: string, query?: string) {
  const cookieStore = cookies();
  const userToken = (await cookieStore).get("pbToken")?.value;

  const url = `${endpoint}${query ? `${query}` : ""}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    return false;
  }

  return await response.json();
}

export const getSingleProduct = async (id: string) => {
  try {
    const url = `${API_ENDPOINTS.PRODUCT.GetSingle}/${id}`;
    const responseData = await getServerData(url);
    if (responseData && responseData.data) {
      return responseData.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching single product:", error);
    return null;
  }
};

export const getRelevantProducts = async (categoryId?: string, collectionId?: string) => {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryIds", categoryId);
    if (collectionId) params.set("collectionIds", collectionId);

    const query = `?${params.toString()}`;
    const url = `${API_ENDPOINTS.PRODUCT.GetRelevant}`;
    const responseData = await getServerData(url, query);
    if (responseData && responseData.data) {
      return responseData.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching relevant products:", error);
    return [];
  }
};

export const getAllCollections = async (): Promise<Collection[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.Collection.getAll, {
      next: { revalidate: 3600 },
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    return responseData?.data ?? [];
  } catch (error) {
    return [];
  }
};

export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.BRAND.GetAllBrands, {
      next: { revalidate: 3600 },
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    return responseData?.data ?? [];
  } catch (error) {
    return [];
  }
};

export const getAllCategories = async (collectionSlugs?: string[]) => {
  try {
    const query = collectionSlugs?.length
      ? `?collectionSlugs=${collectionSlugs.join(",")}`
      : "";
    const responseData = await getServerData(
      API_ENDPOINTS.CATEGORY.GetAll,
      query,
    );
    if (responseData && responseData.data) {
      return responseData.data as { id: string; name: string; slug: string }[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getAllSubCategories = async (categorySlugs?: string[]) => {
  try {
    const query = categorySlugs?.length
      ? `?categorySlugs=${categorySlugs.join(",")}`
      : "";
    const responseData = await getServerData(
      API_ENDPOINTS.SUB_CATEGORY.GetAll,
      query,
    );
    if (responseData && responseData.data) {
      return responseData.data as { id: string; name: string; slug: string }[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
};

export const getProducts = async (
  filters: FilterParams,
): Promise<{ data: IProduct[]; meta: any }> => {
  try {
    const params = new URLSearchParams();
    if (filters.collection) params.set("collectionSlugs", filters.collection);
    if (filters.category) params.set("categorySlugs", filters.category);
    if (filters.subCategory)
      params.set("subCategorySlugs", filters.subCategory);
    if (filters.brand) params.set("brandSlugs", filters.brand);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sortByPrice) params.set("sortByPrice", filters.sortByPrice);
    if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
    if (filters.page) params.set("page", filters.page);
    params.set("limit", "10");

    const query = `?${params.toString()}`;
    const responseData = await getServerData(
      API_ENDPOINTS.PRODUCT.GetAll,
      query,
    );

    if (responseData && responseData.data) {
      return {
        data: responseData.data as IProduct[],
        meta: responseData.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }
};


export async function postServerData(endpoint: string, body: any) {
  const cookieStore = cookies();
  const userToken = (await cookieStore).get("pbToken")?.value;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("POST Request failed:", errorData || response.statusText);
    return { error: true, data: errorData };
  }

  return await response.json();
}

export async function patchServerData(endpoint: string, body: any) {
  const cookieStore = cookies();
  const userToken = (await cookieStore).get("pbToken")?.value;

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("PATCH Request failed:", errorData || response.statusText);
    return { error: true, data: errorData };
  }

  return await response.json();
}

export const checkPromoCode = async (code: string) => {
  try {
    const payload = {
      code: code,
    };
    const responseData = await postServerData(API_ENDPOINTS.PROMOCODE.GET_ALL, payload);
    if (responseData && !responseData.error) {
      return responseData.data || responseData;
    }
    return [];
  } catch (error) {
    console.error("Error checking promo code:", error);
    return [];
  }
};

export const applyPromoCode = async (code: string) => {
  try {
    const payload = {
      code: code,
    };
    const responseData = await postServerData(API_ENDPOINTS.PROMOCODE.APPLY, payload);
    if (responseData && !responseData.error) {
      return responseData;
    }
    return null;
  } catch (error) {
    console.error("Error applying promo code:", error);
    return null;
  }
};

export const createOrder = async (data: any) => {
  try {
    const responseData = await postServerData(API_ENDPOINTS.ORDER.CREATE, data);
    return responseData;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};
export const createCashOrder = async (data: any) => {
  try {
    const responseData = await postServerData(API_ENDPOINTS.ORDER.CASH_ON_DELIVERY, data);
    console.log("response check", responseData)
    return responseData;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};


export const createCODOrder = async (data: any) => {
  try {
    const responseData = await postServerData(API_ENDPOINTS.ORDER.CASH_ON_DELIVERY, data);
    return responseData;
  } catch (error) {
    console.error("Error creating COD order:", error);
    return null;
  }
};

export const createManualPaymentOrder = async (data: any) => {
  try {
    const responseData = await postServerData(API_ENDPOINTS.ORDER.MANUAL_PAYMENT, data);
    return responseData;
  } catch (error) {
    console.error("Error creating manual payment order:", error);
    return null;
  }
};

export const getActiveDeliveryZones = async () => {
  try {
    const responseData = await getServerData(API_ENDPOINTS.DELIVERY_ZONE.GET_ACTIVE);
    return responseData?.data || responseData || [];
  } catch (error) {
    console.error("Error fetching delivery zones:", error);
    return [];
  }
};

export const getMyProfile = async () => {
  try {
    const responseData = await getServerData(API_ENDPOINTS.USER.MY_PROFILE);
    if (responseData) {
      return responseData.data || responseData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const updateProfile = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<IUserProfile>;
}) => {
  try {
    const url = `${API_ENDPOINTS.USER.UPDATE_PROFILE}/${id}`;
    const responseData = await patchServerData(url, data);
    if (responseData && !responseData.error) {
      return responseData;
    }
    return null;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const fileUpload = async (
  files: File[],
  filePath: string
): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('filePath', filePath);
    const res = await fetch(API_ENDPOINTS.FILE.UPLOAD, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Image upload failed');
    }

    const data = await res.json();
    return data?.data || data;
  } catch (err) {
    console.error('Image Upload Error:', err);
    throw err;
  }
};