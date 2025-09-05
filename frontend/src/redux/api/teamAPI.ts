import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';
import { ITeam, IUser } from './types';

export const teamAPI = createApi({
    reducerPath: 'teamAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Teams'],
    endpoints: (builder) => ({
        createTeam: builder.mutation<any, any>({
            query(team) {
                return {
                    url: '/teams/create',
                    method: 'POST',
                    credentials: 'include',
                    body: team,
                };
            },
            invalidatesTags: [{ type: 'Teams', id: 'LIST' }],
            transformResponse: (result: { data: { team: any } }) =>
                result
        }),
        updateTeam: builder.mutation<any, any>({
            query({ id, team }) {
                return {
                    url: `/teams/update/${id}`,
                    method: 'PUT',
                    credentials: 'include',
                    body: team,
                };
            },
            invalidatesTags: (result, _error, { id }) =>
                result
                    ? [
                        { type: 'Teams', id },
                        { type: 'Teams', id: 'LIST' },
                    ]
                    : [{ type: 'Teams', id: 'LIST' }],
            transformResponse: (response: any) =>
                response,
        }),
        getTeam: builder.query<any, string>({
            query(id) {
                return {
                    url: `/teams/getOneTeam/${id}`,
                    credentials: 'include',
                };
            },
            providesTags: (_result, _error, id) => [{ type: 'Teams', id }],
        }),

        getTeams: builder.query<ITeam[], void>({
            query: () => ({
                url: '/teams',
                credentials: 'include',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Teams' as const, id: _id })),
                        { type: 'Teams', id: 'LIST' },
                    ]
                    : [{ type: 'Teams', id: 'LIST' }],
            transformResponse: (response: ITeam[]) => response,
        }),

        getTeamMembers: builder.query<IUser[], void>({
            query: () => ({
                url: '/teams/getTeamMembers',
                credentials: 'include',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Teams' as const, id: _id })),
                        { type: 'Teams', id: 'LIST' },
                    ]
                    : [{ type: 'Teams', id: 'LIST' }],
            transformResponse: (response: IUser[]) => response,
        }),

        deleteTeam: builder.mutation<any, string>({
            query(id) {
                return {
                    url: `/teams/delete/${id}`,
                    method: 'Delete',
                    credentials: 'include',
                };
            },
            invalidatesTags: [{ type: 'Teams', id: 'LIST' }],
        }),

    }),
});

export const {
    useCreateTeamMutation,
    useUpdateTeamMutation,
    useGetTeamQuery,
    useGetTeamsQuery,
    useDeleteTeamMutation,
    useGetTeamMembersQuery,
} = teamAPI;