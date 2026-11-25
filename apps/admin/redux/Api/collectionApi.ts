import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

type GetAllCollectionsArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

export const collectionApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createCollection: builder.mutation({
      query: (data) => {
        return {
          url: `/collections`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.collection],
    }),
    getAllCollections: builder.query({
      query: (args: GetAllCollectionsArgs) => {
        const params: Record<string, any> = {};

        if (args?.page) params.page = args.page;
        if (args?.limit) params.limit = args.limit;
        if (args?.searchTerm) params.searchTerm = args.searchTerm;
        if (typeof args?.isActive === "boolean")
          params.isActive = args.isActive;
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;

        return {
          url: "/collections",
          method: "GET",
          params,
        };
      },
      providesTags: [TagTypes.collection],
    }),
    getAllQueryCollections: builder.query({
      query: () => {
        return {
          url: "/collections/query",
          method: "GET",
        };
      },
      providesTags: [TagTypes.collection],
    }),
    getSingleCollection: builder.query({
      query: (id: string) => {
        return {
          url: `/collections/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.collection],
    }),
    updateCollection: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/collections/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.collection],
    }),
    updateHomeShowStatus: builder.mutation({
      query: ({ id, data }: { id: string; data: { isHomeShow: boolean } }) => {
        return {
          url: `/collections/${id}/home-show`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.collection],
    }),

    deleteCollection: builder.mutation({
      query: (id: string) => {
        return {
          url: `/collections/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.collection],
    }),
  }),
});

export const {
  useGetAllCollectionsQuery,
  useCreateCollectionMutation,
  useGetSingleCollectionQuery,
  useUpdateCollectionMutation,
  useUpdateHomeShowStatusMutation,
  useDeleteCollectionMutation,
  useGetAllQueryCollectionsQuery,
} = collectionApi;
