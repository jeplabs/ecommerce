import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children, requiredRol }) => {
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
    } else if (userRol === 'ROLE_CUSTOMER') {
        return <Navigate to="/profile" replace />;
    }

    return <Navigate to="/" replace />;
};

export default PrivateRoute;