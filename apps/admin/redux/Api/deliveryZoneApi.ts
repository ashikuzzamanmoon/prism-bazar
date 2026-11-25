import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const deliveryZoneApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllDeliveryZones: builder.query({
      query: () => ({
        url: "/delivery-zones/all",
        method: "GET",
      }),
      providesTags: [TagTypes.deliveryZone],
    }),
    createDeliveryZone: builder.mutation({
      query: (data) => ({
        url: "/delivery-zones",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TagTypes.deliveryZone],
    }),
    updateDeliveryZone: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/delivery-zones/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.deliveryZone],
    }),
    deleteDeliveryZone: builder.mutation({
      query: (id: string) => ({
        url: `/delivery-zones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TagTypes.deliveryZone],
    }),
  }),
});

export const {
  useGetAllDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
} = deliveryZoneApi;
