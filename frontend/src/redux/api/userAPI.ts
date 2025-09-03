import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';
import { IUser } from './types';
import { setUserData } from '../../utils/Utils';
import { setUser } from './userSlice';

export const userAPI = createApi({
    reducerPath: 'userAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        createUser: builder.mutation<any, any>({
            query(user) {
                return {
                    url: '/users',
                    method: 'POST',
                    credentials: 'include',
                    body: user,
                };
            },
            invalidatesTags: [{ type: 'Users', id: 'LIST' }],
            transformResponse: (result: { data: { user: any } }) =>
                result.data.user,
        }),
        updateUser: builder.mutation<any, any>(
            {
                query({id, user}) {
                    return {
                        url: `/users/update/${id}`,
                        method: 'PUT',
                        credentials: 'include',
                        body: user,
                    };
                },
                invalidatesTags: (result, _error, { id }) =>
                    result
                        ? [
                            { type: 'Users', id },
                            { type: 'Users', id: 'LIST' },
                        ]
                        : [{ type: 'Users', id: 'LIST' }],
                transformResponse: (response: any) =>
                    response,
            }
        ),
        suspendUser: builder.mutation<any, any>(
            {
                query(id) {
                    return {
                        url: `/users/suspend/${id}`,
                        method: 'PUT',
                        credentials: 'include',
                    };
                },
                invalidatesTags: [{ type: 'Users', id: 'LIST' }],
                transformResponse: (response: any) =>
                    response,
            }
        ),
        getUser: builder.query<any, string>({
            query(id) {
                return {
                    url: `/users/getOneUser/${id}`,
                    credentials: 'include',
                };
            },
            providesTags: (_result, _error, id) => [{ type: 'Users', id }],
        }),

        getUsers: builder.query<IUser[], { status?: string; role?: string }>({
            query: (params) => ({
                url: '/users',
                params, // Pass query parameters directly
                credentials: 'include',
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({ type: 'Users' as const, id: _id })),
                          { type: 'Users', id: 'LIST' },
                      ]
                    : [{ type: 'Users', id: 'LIST' }],
            transformResponse: (response: { users: IUser[] }) => response.users,
        }),
        
        getProfile: builder.query<any, any>({
            query() {
                return {
                    url: `/users/getProfile`,
                    credentials: 'include',
                };
            },
            providesTags: (_result, _error, id) => [{ type: 'Users', id }],
        }),
        deleteUser: builder.mutation<any, string>({
            query(id) {
                return {
                    url: `/users/delete/${id}`,
                    method: 'Delete',
                    credentials: 'include',
                };
            },
            invalidatesTags: [{ type: 'Users', id: 'LIST' }],
        }),
        uploadProfileImg: builder.mutation<any, any>({
            query: (avatarFile) => {
                var formData = new FormData();
                formData.append('avatarFile', avatarFile);
                return {
                    url: '/users/upload/avatarFile',
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                };
            },
            invalidatesTags: [{ type: 'Users', id: 'LIST' }],
            transformResponse(result: any) {
                return result;
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const response = await queryFulfilled;
                    setUserData(JSON.stringify(response.data.updateAvatar));
                    dispatch(setUser(response.data.updateAvatar));
                } catch (error) {
                    console.log(error);
                }
            }
        })

    }),
});

export const {
    useCreateUserMutation,
    useDeleteUserMutation,
    useUpdateUserMutation,
    useGetUserQuery,
    useGetUsersQuery,
    useGetProfileQuery,
    useUploadProfileImgMutation,
    useSuspendUserMutation,
} = userAPI;
