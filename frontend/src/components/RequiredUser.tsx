import { FC } from 'react'; // Explicit import for Function Component type
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import FullScreenLoader from './FullScreenLoader';
import { getMeAPI } from '../redux/api/getMeAPI';

interface RequireUserProps {
    allowedRoles: string[];
}

const RequireUser: FC<RequireUserProps> = ({ allowedRoles }) => {
    // Use cookies to check logged-in status
    const [cookies] = useCookies(['isLoggedIn']);

    // Get current location for redirect purposes
    const location = useLocation();

    // Fetch user data using Redux query API
    const { isLoading, isFetching } = getMeAPI.endpoints.getMe.useQuery(null, {
        skip: false,
        refetchOnMountOrArgChange: true,
    });

    // Determine if still loading
    const loading = isLoading || isFetching;

    // Select user data from query state
    const user = getMeAPI.endpoints.getMe.useQueryState(null, {
        selectFromResult: ({ data }) => data!,
    });

    if (loading) {
        // Display loader while fetching user data
        return <FullScreenLoader />;
    }

    return (cookies.isLoggedIn || user) &&
        allowedRoles.includes(user?.role as string) ? (
        // If user is logged in and has an allowed role, render child components
        <Outlet />
    ) : cookies.isLoggedIn && user ? (
        // If logged in but not authorized, navigate to unauthorized page
        <Navigate to='/unauthorized' state={{ from: location }} replace />
    ) : (
        // If not logged in at all, navigate to login page
        <Navigate to='/login' state={{ from: location }} replace />
    );
};

export default RequireUser;
