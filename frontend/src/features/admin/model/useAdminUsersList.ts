import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/entities/user/api';
import type { UserApi } from '@/entities/user';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';
import type { UseAdminUsersListResult } from './types';

const getToken = () => localStorage.getItem('token');

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

/**
 * Carga el listado de usuarios para el panel admin.
 * Maneja 401 (sesión) de forma uniforme con el resto de hooks de datos.
 */
export function useAdminUsersList(): UseAdminUsersListResult {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
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
            const data = await authApi.listUsuarios();
            setUsers(data);
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) {
                return;
            }
            console.error('Error al obtener usuarios', err);
            setError(toErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [navigate, handleAuthError]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, setUsers, loading, error, refetch: fetchUsers };
}
