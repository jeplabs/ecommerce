import type { ReactNode } from 'react';
import { useAuth } from '@/app/providers';
import type { UserRole } from '@/entities/user';
import { Navigate, useLocation } from 'react-router-dom';

type PrivateRouteProps = {
    children: ReactNode;
    requiredRol?: UserRole;
};

export function PrivateRoute({ children, requiredRol }: PrivateRouteProps) {
    const { isAuthenticated, userRol, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!requiredRol || userRol === requiredRol) {
        return children;
    }

    if (userRol === 'ROLE_ADMIN') {
        return <Navigate to="/admin" replace />;
    }
    if (userRol === 'ROLE_CUSTOMER') {
        return <Navigate to="/profile" replace />;
    }

    return <Navigate to="/" replace />;
}

export default PrivateRoute;
