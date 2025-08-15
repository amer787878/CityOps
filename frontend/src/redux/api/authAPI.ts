import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GenericResponse, LoginUserRequest, RegisterUserRequest } from './types';
import { getMeAPI } from './getMeAPI';
import { removeToken, removeUserData, setToken, setUserData } from '../../utils/Utils';
import { logout } from './userSlice';

const baseUrl = `${process.env.REACT_APP_SERVER_ENDPOINT}/api`;

export const authAPI = createApi({
  reducerPath: 'authAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation<GenericResponse, RegisterUserRequest>({
      query(data) {
        return {
          url: '/auth/register',
          method: 'POST',
          body: data,
        };
      },
    }),
    loginUser: builder.mutation<{ accessToken: string; userData: any, status: string }, LoginUserRequest>({
      query(data) {
        return {
          url: '/auth/login',
          method: 'POST',
          body: data,
          credentials: 'include',
        };
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setToken(data.accessToken);
          setUserData(JSON.stringify(data.userData));
          await dispatch(getMeAPI.endpoints.getMe.initiate(null));
        } catch (error) {}
      },
    }),
    adminLoginUser: builder.mutation<{ accessToken: string, userData: any, status: string }, LoginUserRequest>({
      query(data) {
        return {
          url: '/auth/admin/login',
          method: 'POST',
          body: data,
          credentials: 'include',
        };
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setToken(data.accessToken);
          setUserData(JSON.stringify(data.userData));
          await dispatch(getMeAPI.endpoints.getMe.initiate(null));
        } catch (error) {}
      },
    }),
    logoutUser: builder.mutation<void, void>({
      query() {
        return {
          url: '/users/logout',
          credentials: 'include',
        };
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          removeToken();
          removeUserData();
          dispatch(logout());
        } catch (error) {
          console.log(error);
        }
      }
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
  useAdminLoginUserMutation,
} = authAPI;
