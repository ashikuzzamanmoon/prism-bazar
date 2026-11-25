import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

type GetAllOrdersArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  orderStatus?: string[];
  paymentStatus?: string[];
  type?: string;
  promoCodeId?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortOrder?: "asc" | "desc";
};

export const orderApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: (args: GetAllOrdersArgs) => {
        const params: Record<string, any> = {};

        if (args?.page) params.page = args.page;
        if (args?.limit) params.limit = args.limit;
        if (args?.searchTerm) params.searchTerm = args.searchTerm;
        if (args?.orderStatus?.length) params.orderStatus = args.orderStatus;
        if (args?.paymentStatus?.length)
          params.paymentStatus = args.paymentStatus;
        if (args?.type) params.type = args.type;
        if (args?.promoCodeId) params.promoCodeId = args.promoCodeId;
        if (args?.startDate) params.startDate = args.startDate;
        if (args?.endDate) params.endDate = args.endDate;
        if (args?.sort) params.sort = args.sort;
        if (args?.sortOrder) params.sortOrder = args.sortOrder;

        return {
          url: "/orders/all-orders",
          method: "GET",
          params,
        };
      },
      providesTags: [TagTypes.order],
    }),
    getSingleOrder: builder.query({
      query: (orderId: string) => {
        return {
          url: `/orders/order/${orderId}`,
          method: "GET",
        };
      },
      providesTags: [TagTypes.order],
    }),
    updateOrderStatus: builder.mutation({
      query: ({
        orderId,
        data,
      }: {
        orderId: string;
        data: {
          orderStatus?: string;
          paymentStatus?: string;
          transactionId?: string;
        };
      }) => ({
        url: `/orders/order/${orderId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.order],
    }),
    verifyOrderPayment: builder.mutation({
      query: (orderId: string) => ({
        url: `/orders/${orderId}/verify-payment`,
        method: "PATCH",
      }),
      invalidatesTags: [TagTypes.order],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetSingleOrderQuery,
  useUpdateOrderStatusMutation,
  useVerifyOrderPaymentMutation,
} = orderApi;
