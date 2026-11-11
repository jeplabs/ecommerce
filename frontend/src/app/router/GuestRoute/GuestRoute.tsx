import type { ReactNode } from 'react';
import { useAuth } from '@/app/providers';
import { Navigate } from 'react-router-dom';

type GuestRouteProps = {
    children: ReactNode;
};

/** Rutas solo para visitantes: redirige a perfil o admin si ya hay sesión. */
export function GuestRoute({ children }: GuestRouteProps) {
    const { isAuthenticated, userRol, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
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

export default GuestRoute;
