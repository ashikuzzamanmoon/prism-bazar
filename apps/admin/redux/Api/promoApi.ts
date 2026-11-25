import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

type GetAllPromoCodeArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: "FLAT" | "PERCENT";
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

export const promoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createNewPromo: builder.mutation({
      query: (data) => {
        return {
          url: `/promocode`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.promo],
    }),
    getAllPromoCode: builder.query({
      query: (args: GetAllPromoCodeArgs) => {
        const params: Record<string, any> = {};

        if (args?.page) params.page = args.page;
        if (args?.limit) params.limit = args.limit;
        if (args?.searchTerm) params.searchTerm = args.searchTerm;
        if (args?.type) params.type = args.type;
        if (typeof args?.isActive === "boolean")
          params.isActive = args.isActive;
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;

        return {
          url: "/promocode",
          method: "GET",
          params,
        };
      },
      providesTags: [TagTypes.promo],
    }),
    updatePromoCode: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/promocode/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.promo],
    }),
    deletePromoCode: builder.mutation({
      query: (id: string) => {
        return {
          url: `/promocode/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.promo],
    }),
  }),
});

export const {
  useCreateNewPromoMutation,
  useGetAllPromoCodeQuery,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
} = promoApi;
