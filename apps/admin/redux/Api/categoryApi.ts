import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const categoryApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createNewCategory: builder.mutation({
      query: (data: any) => {
        return {
          url: `/categories`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.category],
    }),
    getAllCategory: builder.query({
      query: (args: any) => {
        return {
          url: "/categories",
          method: "GET",
          params: args,
        };
      },
      providesTags: [TagTypes.category],
    }),
    getAllQueryCategory: builder.query({
      query: (args: { collectionIds?: string[] }) => {
        return {
          url: "/categories/query",
          method: "GET",
          params: args?.collectionIds?.length
            ? { collectionIds: args?.collectionIds.join(",") }
            : {},
        };
      },
      providesTags: [TagTypes.category],
    }),
    getSingleCategory: builder.query({
      query: (id: string) => {
        return {
          url: `/categories/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.category],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/categories/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.category],
    }),
    deleteCategory: builder.mutation({
      query: (id: string) => {
        return {
          url: `/categories/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.category],
    }),
    updateCategoryOrdering: builder.mutation({
      query: (data: any) => {
        return {
          url: "categories/ordering",
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.category],
    }),
  }),
});

export const {
  useCreateNewCategoryMutation,
  useGetAllCategoryQuery,
  useGetSingleCategoryQuery,
  useUpdateCategoryMutation,
  useGetAllQueryCategoryQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryOrderingMutation,
} = categoryApi;
