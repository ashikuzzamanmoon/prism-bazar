import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const contactApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getNotifications: builder.query({
            query: () => {
                return {
                    url: "/contact",
                    method: "GET",
                };
            },
            providesTags: [TagTypes.user],
        }),
    }),
});

export const { useGetNotificationsQuery } = contactApi;
