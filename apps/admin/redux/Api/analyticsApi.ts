import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const analyticsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query({
      query: (args?: Record<string, any>) => {
        return {
          url: "/analysis/dashboard",
          method: "GET",
          params: args,
        };
      },
      providesTags: [TagTypes.analytics],
    }),
  }),
});

export const { useGetDashboardAnalyticsQuery } = analyticsApi;
