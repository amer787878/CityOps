import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';
import { INotification } from './types';

export const notificationAPI = createApi({
    reducerPath: 'notificationAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Notifications'],
    endpoints: (builder) => ({

        getNotifications: builder.query<INotification[], any>({
            query: (params) => ({
                url: '/notifications',
                credentials: 'include',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Notifications' as const, id: _id })),
                        { type: 'Notifications', id: 'LIST' },
                    ]
                    : [{ type: 'Notifications', id: 'LIST' }],
            transformResponse: (response: INotification[]) => response,
        }),

    }),
});

export const {
    useGetNotificationsQuery,
} = notificationAPI;