import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

type GetAllContentsArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  minNumber?: number;
  maxNumber?: number;
  sort?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const contentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createContent: builder.mutation({
      query: (data) => {
        return {
          url: `/contents`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.content],
    }),
    getAllContents: builder.query({
      query: (args: GetAllContentsArgs) => {
        const params: Record<string, any> = {};

        if (args?.page) params.page = args.page;
        if (args?.limit) params.limit = args.limit;
        if (args?.searchTerm) params.searchTerm = args.searchTerm;
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        if (args?.minNumber !== undefined) params.minNumber = args.minNumber;
        if (args?.maxNumber !== undefined) params.maxNumber = args.maxNumber;
        if (args?.sort) params.sort = args.sort;
        if (args?.sortBy) params.sortBy = args.sortBy;
        if (args?.sortOrder) params.sortOrder = args.sortOrder;

        return {
          url: "/contents",
          method: "GET",
          params,
        };
      },
      providesTags: [TagTypes.content],
    }),
    getSingleContent: builder.query({
      query: (id: string) => {
        return {
          url: `/contents/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.content],
    }),
    updateContent: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/contents/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.content],
    }),
    deleteContent: builder.mutation({
      query: (id: string) => {
        return {
          url: `/contents/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.content],
    }),
  }),
});

export const {
  useGetAllContentsQuery,
  useCreateContentMutation,
  useGetSingleContentQuery,
  useUpdateContentMutation,
  useDeleteContentMutation,
} = contentApi;
