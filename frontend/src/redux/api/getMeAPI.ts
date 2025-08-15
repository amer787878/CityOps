import { createApi } from "@reduxjs/toolkit/query/react";
import { IUser } from "./types";
import { setUser } from "./userSlice";
import defaultFetchBase from "./defaultFetchBase";

export const getMeAPI = createApi({
    reducerPath: "getMeAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        getMe: builder.query<IUser, null>({
            query() {
                return {
                    url: "/users/personal/me",
                    credentials: "include",
                };
            },
            transformResponse: (result: {  user: IUser }) =>
                result.user,
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                } catch (error) { }
            },
        }),
    }),
});
