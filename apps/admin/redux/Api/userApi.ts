import { TagTypes } from "@/types/tagTypes";
import { baseApi } from "../baseApi";

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    myProfile: builder.query({
      query: (args: any) => {
        return {
          url: `/profile/my-profile`,
          method: "GET",
          params: args,
        };
      },
      providesTags: [TagTypes.user],
    }),
    getAllUser: builder.query({
      query: () => {
        return {
          url: "/users",
          method: "GET",
        };
      },
      providesTags: [TagTypes.user],
    }),
    deleteUser: builder.mutation({
      query: (id: string) => {
        return {
          url: `/users/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [TagTypes.user],
    }),

    // create admin
    createAdmin: builder.mutation({
      query: (data: any) => {
        return {
          url: "/auth/admin/register",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: [TagTypes.user],
    }),
    updateProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/profile/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TagTypes.user],
    }),
  }),
});

export const {
  useMyProfileQuery,
  useGetAllUserQuery,
  useCreateAdminMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
} = userApi;
