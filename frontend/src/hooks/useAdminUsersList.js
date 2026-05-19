import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { isAuthError } from '../utils/apiHelpers';

const getToken = () => localStorage.getItem('token');

/**
 * Carga el listado de usuarios para el panel admin.
 * Maneja 401 (sesión) de forma uniforme con el resto de hooks de datos.
 */
export function useAdminUsersList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAuthError = useCallback(
        (status) => {
            if (isAuthError(status)) {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
                return true;
            }
            return false;
        },
        [navigate]
    );

    const fetchUsers = useCallback(async () => {
        if (!getToken()) {
            navigate('/login', { replace: true });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await authService.listUsuarios();
            setUsers(data);
        } catch (err) {
            if (handleAuthError(err.status)) {
                return;
            }
            console.error('Error al obtener usuarios', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate, handleAuthError]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, setUsers, loading, error, refetch: fetchUsers };
}
