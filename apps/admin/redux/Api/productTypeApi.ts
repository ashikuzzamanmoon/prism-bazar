import { baseApi } from "../baseApi";
import { TagTypes } from "@/types/tagTypes";

export const productTypeApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createProductType: builder.mutation({
      query: (data: any) => ({
        url: "/product-type-entity",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.productType],
    }),

    getAllProductTypes: builder.query({
      query: (params: any) => ({
        url: "/product-type-entity",
        method: "GET",
        params,
      }),
      providesTags: [TagTypes.productType],
    }),

    getSingleProductType: builder.query({
      query: (id: string) => ({
        url: `/product-type-entity/${id}`,
        method: "GET",
      }),
      providesTags: [TagTypes.productType],
    }),

    updateProductType: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/product-type-entity/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.productType],
    }),

    deleteProductType: builder.mutation({
      query: (id: string) => ({
        url: `/product-type-entity/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TagTypes.productType],
    }),
  }),
});

export const {
  useCreateProductTypeMutation,
  useGetAllProductTypesQuery,
  useGetSingleProductTypeQuery,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
} = productTypeApi;
