import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const brandApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createNewBrand: builder.mutation({
      query: (data) => {
        return {
          url: `/brand`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.brand],
    }),
    getAllBrands: builder.query({
      query: (args: any) => {
        return {
          url: "/brand",
          method: "GET",
          params: args,
        };
      },
      providesTags: [TagTypes.brand],
    }),

    getAllBrand: builder.query({
      query: (args: any) => {
        return {
          url: "/brand/all",
          method: "GET",
          params: args,
        };
      },
      providesTags: [TagTypes.brand],
    }),
    getAllQueryBrand: builder.query({
      query: () => {
        return {
          url: "/brand/query",
          method: "GET",
        };
      },
      providesTags: [TagTypes.brand],
    }),
    getSingleBrand: builder.query({
      query: (id: string) => {
        return {
          url: `/brand/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.brand],
    }),
    updateBrand: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/brand/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.brand],
    }),
    deleteBrand: builder.mutation({
      query: (id: string) => {
        return {
          url: `/brand/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.brand],
    }),

    updateBrandOrdering: builder.mutation({
      query: (data: any) => {
        return {
          url: `/brand/ordering`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.brand],
    }),
  }),
});

export const {
  useCreateNewBrandMutation,
  useGetAllBrandsQuery,
  useGetSingleBrandQuery,
  useUpdateBrandMutation,
  useGetAllBrandQuery,
  useDeleteBrandMutation,
  useUpdateBrandOrderingMutation,
  useGetAllQueryBrandQuery,
} = brandApi;
