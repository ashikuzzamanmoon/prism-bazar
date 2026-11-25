import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

type GetAllProductsArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  isPublish?: boolean;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortByPrice?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
};

export const productApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createNewProduct: builder.mutation({
      query: (data: any) => {
        return {
          url: `/products`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    addProductVariants: builder.mutation({
      query: (data: any) => {
        return {
          url: `/products/variants`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),

    getAllProducts: builder.query({
      query: (args: GetAllProductsArgs) => {
        const params: Record<string, any> = {};

        if (args?.page) params.page = args.page;
        if (args?.limit) params.limit = args.limit;
        if (args?.searchTerm) params.searchTerm = args.searchTerm;
        if (typeof args?.isPublish === "boolean")
          params.isPublish = args.isPublish;
        if (typeof args?.minPrice === "number") params.minPrice = args.minPrice;
        if (typeof args?.maxPrice === "number") params.maxPrice = args.maxPrice;
        if (args?.sortByPrice) params.sortByPrice = args.sortByPrice;
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;

        return {
          url: "/products",
          method: "GET",
          params,
        };
      },
      providesTags: [TagTypes.product],
    }),

    getAllQueryProducts: builder.query({
      query: () => {
        return {
          url: "/products/query",
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),
    getProductEditFields: builder.query({
      query: (id: string) => {
        return {
          url: `/products/edit/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),
    getProductVariantEditFields: builder.query({
      query: (id: string) => {
        return {
          url: `/products/variants-edit/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),
    getSingleProduct: builder.query({
      query: (id: string) => {
        return {
          url: `/products/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),
    getUpdateProduct: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    getUpdateProductVariant: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/variants-update/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    createProductFeature: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/feature/${id}`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    getAllProductFeatures: builder.query({
      query: (id: string) => {
        return {
          url: `/products/features/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),
    updateProductFeature: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/features/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    deleteProduct: builder.mutation({
      query: (id: string) => {
        return {
          url: `/products/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    productPublishing: builder.mutation({
      query: ({ id, isPublish }: { id: string; isPublish: boolean }) => {
        return {
          url: `/products/publish/${id}?publish=${isPublish}`,
          method: "PATCH",
          body: { isPublish: Boolean(isPublish) },
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    updateProductAdditionFeature: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/additional-features-sorting/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    getAllSortingProducts: builder.query({
      query: () => {
        return {
          url: `/products/sorting-all`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),
    updateProductOrdering: builder.mutation({
      query: (data: { id: string; order: number }[]) => {
        return {
          url: `/products/ordering`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
    updateProductFeatureOrdering: builder.mutation({
      query: (data: { id: string; order: number }[]) => {
        return {
          url: `/products/feature-ordering`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),

    // product price update hook
    updateProductPrice: builder.mutation({
      query: ({ id, data }: { id: string; data: { price: string } }) => {
        return {
          url: `/products/${id}/price`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),

    // get all product features
    getProductFeatures: builder.query({
      query: (id: string) => {
        return {
          url: `/products/${id}/product-features`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),

    // get all features from product features
    getFeaturesFromProductFeature: builder.query({
      query: (id: string) => {
        return {
          url: `/products/feature/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),

    // update product features sorting
    updateProductFeaturesSorting: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/${id}/features-sorting`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),

    // update product features sorting
    updateFeaturesFromProductFeature: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/feature/${id}/features-sorting`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),

    // update product features sorting
    updateMainFeatures: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/${id}/main-features-sorting`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),

    // get product inventory
    getProductInventories: builder.query({
      query: () => {
        return {
          url: `/products/inventory`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.product],
    }),

    // update product price+stock quantity
    updateProductPriceStock: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/products/${id}/inventory`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.product],
    }),
  }),
});

export const {
  useCreateNewProductMutation,
  useAddProductVariantsMutation,
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useGetUpdateProductMutation,
  useCreateProductFeatureMutation,
  useGetAllProductFeaturesQuery,
  useUpdateProductFeatureMutation,
  useDeleteProductMutation,
  useProductPublishingMutation,
  useUpdateProductAdditionFeatureMutation,
  useGetAllSortingProductsQuery,
  useUpdateProductOrderingMutation,
  useUpdateProductFeatureOrderingMutation,
  useGetAllQueryProductsQuery,
  useGetProductEditFieldsQuery,
  useGetProductVariantEditFieldsQuery,
  useGetUpdateProductVariantMutation,
  useUpdateProductPriceMutation,
  useGetProductFeaturesQuery,
  useUpdateProductFeaturesSortingMutation,
  useGetFeaturesFromProductFeatureQuery,
  useUpdateFeaturesFromProductFeatureMutation,
  useUpdateMainFeaturesMutation,
  useGetProductInventoriesQuery,
  useUpdateProductPriceStockMutation,
} = productApi;
