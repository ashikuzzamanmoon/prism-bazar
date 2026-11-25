import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const subCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubCategory: builder.mutation({
      query: (data: any) => {
        return {
          url: `/sub-category`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.subCategory],
    }),
    getAllSubCategory: builder.query({
      query: (args: any) => {
        return {
          url: "/sub-category",
          method: "GET",
          params: args,
        };
      },
      providesTags: [TagTypes.subCategory],
    }),
    getAllQuerySubCategory: builder.query({
      query: (args: { categoryIds?: string[] }) => ({
        url: "/sub-category/query",
        method: "GET",
        params: args?.categoryIds?.length
          ? { categoryIds: args.categoryIds.join(",") }
          : {},
      }),
      providesTags: [TagTypes.subCategory],
    }),
    getSingleSubCategory: builder.query({
      query: (id: string) => {
        return {
          url: `/sub-category/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.category],
    }),
    updateSubCategory: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/sub-category/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.subCategory],
    }),
    createNestedSubCategory: builder.mutation({
      query: (data: any) => {
        return {
          url: `/sub-category/nested`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.subCategory],
    }),
    updateNestedSubCategory: builder.mutation({
      query: ({ id, data }: { id: number; data: any }) => {
        return {
          url: `/sub-category/nested/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.subCategory],
    }),
    deleteSubCategory: builder.mutation({
      query: (id: string) => {
        return {
          url: `/sub-category/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.subCategory],
    }),
  }),
});

export const {
  useCreateSubCategoryMutation,
  useGetAllSubCategoryQuery,
  useGetSingleSubCategoryQuery,
  useUpdateSubCategoryMutation,
  useCreateNestedSubCategoryMutation,
  useUpdateNestedSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetAllQuerySubCategoryQuery
} = subCategoryApi;
