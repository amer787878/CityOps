import moment from 'moment';

export const getToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

export const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

export const removeToken = (): void => {
    localStorage.removeItem('accessToken');
};

export const setToken = (val: string): void => {
    localStorage.setItem('accessToken', val);
};

export const setUserData = (val: string) => {
    localStorage.setItem('userData', val);
};

export const removeUserData = () => {
    localStorage.removeItem('userData');
};

export const isObjEmpty = (obj: Record<string, unknown>): boolean => Object.keys(obj).length === 0;

export const isUserLoggedIn = (): boolean => !!localStorage.getItem('userData');

export const removeCookie = (cookieName: string) => {
    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const getHomeRouteForLoggedInUser = (userRole: string): string => {
    if (userRole === 'Admin') return '/admin/dashboard';
    if (userRole === 'Citizen') return '/citizen/issues';
    if (userRole === 'Authority') return '/authority/dashboard';
    return '/login';
};

export const getDateFormat = (formattedDate: any) => {
    const formattedDateMoment = moment(`${formattedDate}`, 'YYYY-MM-DD HH:mm A');
    const formattedDateTime = moment(formattedDateMoment).format('llll');
    return formattedDateTime;
};