import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createNewBanner: builder.mutation({
      query: (data) => {
        return {
          url: `/banners`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.banner],
    }),
    getAllBanners: builder.query({
      query: (args: any) => {
        return {
          url: "/banners",
          method: "GET",
          params: args,
        };
      },
      providesTags: [TagTypes.banner],
    }),
    getSingleBanner: builder.query({
      query: (id: string) => {
        return {
          url: `/banners/${id}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.banner],
    }),
    updateBanner: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/banners/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.banner],
    }),
    bannerPublish: builder.mutation({
      query: ({ id, publish }: { id: string; publish: any }) => {
        return {
          url: `/banners/publish/${id}`,
          method: "PATCH",
          body: publish,
        };
      },
      invalidatesTags: [TagTypes.banner],
    }),
    bannerSidePublish: builder.mutation({
      query: ({ id, side }: { id: string; side: any }) => {
        return {
          url: `/banners/publish-sidebar/${id}`,
          method: "PATCH",
          body: side,
        };
      },
      invalidatesTags: [TagTypes.banner],
    }),

    deleteBanner: builder.mutation({
      query: (id: string) => {
        return {
          url: `/banners/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.banner],
    }),
  }),
});

export const {
  useCreateNewBannerMutation,
  useGetAllBannersQuery,
  useGetSingleBannerQuery,
  useUpdateBannerMutation,
  useBannerPublishMutation,
  useDeleteBannerMutation,
  useBannerSidePublishMutation,
} = bannerApi;
