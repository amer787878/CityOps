import { createApi } from "@reduxjs/toolkit/query/react";
import { PendingSubmission, ReportedComment } from "./types";
import defaultFetchBase from "./defaultFetchBase";


export interface ModerationResponse {
    pendingSubmissionIssues: PendingSubmission[];
    reportedComments: ReportedComment[];
}

export interface RejectRequest {
    id: string;
    reason: string;
}

export const moderationAPI = createApi({
    reducerPath: "moderationAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["Moderations"],
    endpoints: (builder) => ({
        getModeration: builder.query<ModerationResponse, void>({
            query: () => ({
                url: "/moderation",
                method: "GET",
                credentials: "include",
            }),
            transformResponse: (response: any) => response as ModerationResponse,
            providesTags: ["Moderations"],
        }),
        approveSubmission: builder.mutation<void, string>({
            query: (id) => ({
                url: `/moderation/approve/issue/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["Moderations"],
        }),
        rejectSubmission: builder.mutation<void, RejectRequest>({
            query: ({ id, reason }) => ({
                url: `/moderation/reject/issue/${id}`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Moderations"],
        }),
        approveComment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/moderation/approve/comment/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["Moderations"],
        }),
        rejectComment: builder.mutation<any, any>({
            query: ({ id, reason }) => ({
                url: `/moderation/reject/comment/${id}`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Moderations"],
        }),
    }),
});

// Export hooks for accessing API
export const {
    useGetModerationQuery,
    useApproveSubmissionMutation,
    useRejectSubmissionMutation,
    useApproveCommentMutation,
    useRejectCommentMutation,
} = moderationAPI;
