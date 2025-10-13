import { createApi } from "@reduxjs/toolkit/query/react";
import defaultFetchBase from "./defaultFetchBase"; // Ensure this file exports a valid baseQuery

export const moderationAPI = createApi({
    reducerPath: "moderationAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["Moderations"],
    endpoints: (builder) => ({
        getModeration: builder.query<any, void>({
            query: () => ({
                url: "/moderation",
                method: "GET",
                credentials: "include",
            }),
            transformResponse: (response: any) => response,
        }),
    }),
});

// Export the hook for accessing the data
export const { useGetModerationQuery } = moderationAPI;
