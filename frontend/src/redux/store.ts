import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { authAPI } from './api/authAPI';
import { getMeAPI } from './api/getMeAPI';
import userReducer from './api/userSlice';
import { userAPI } from './api/userAPI';
import { teamAPI } from './api/teamAPI';
import { issueAPI } from './api/issueAPI';
import { notificationAPI } from './api/notificationAPI';
import { analyticAPI } from './api/analyticAPI';
import { moderationAPI } from './api/moderationAPI';
import { reportAPI } from './api/reportAPI';

export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer,
    [getMeAPI.reducerPath]: getMeAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [teamAPI.reducerPath]: teamAPI.reducer,
    [issueAPI.reducerPath]: issueAPI.reducer,
    [notificationAPI.reducerPath]: notificationAPI.reducer,
    [analyticAPI.reducerPath]: analyticAPI.reducer,
    [moderationAPI.reducerPath]: moderationAPI.reducer,
    [reportAPI.reducerPath]: reportAPI.reducer,
    userState: userReducer

  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([
        authAPI.middleware,
        getMeAPI.middleware,
        userAPI.middleware,
        teamAPI.middleware,
        issueAPI.middleware,
        notificationAPI.middleware,
        analyticAPI.middleware,
        moderationAPI.middleware,
        reportAPI.middleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
