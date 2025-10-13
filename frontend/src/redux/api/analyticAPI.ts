import { createApi } from "@reduxjs/toolkit/query/react";
import defaultFetchBase from "./defaultFetchBase"; // Ensure this file exports a valid baseQuery

export const analyticAPI = createApi({
    reducerPath: "analyticAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["Analytics"],
    endpoints: (builder) => ({
        getAuthorityAnalytics: builder.query<any, any>({
            query: (params) => ({
                url: "/analytics/authority",
                method: "GET",
                params,
                credentials: "include",
            }),
            transformResponse: (response: any) => response,
        }),
    }),
});

// Export the hook for accessing the data
export const { useGetAuthorityAnalyticsQuery } = analyticAPI;
