import { createApi } from "@reduxjs/toolkit/query/react";
import defaultFetchBase from "./defaultFetchBase"; // Ensure this file exports a valid baseQuery

export const reportAPI = createApi({
    reducerPath: "reportAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["Report"],
    endpoints: (builder) => ({
        getAdminReport: builder.query<any, any>({
            query: (params) => ({
                url: "/report/admin",
                method: "GET",
                params,
                credentials: "include",
            }),
            transformResponse: (response: any) => response,
        }),
    }),
});

export const { useGetAdminReportQuery } = reportAPI;
