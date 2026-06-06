import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getPerfil,
    updatePerfil,
    updatePassword as updatePasswordApi,
} from '../api/profileApi';
import type { UserApi } from './schemas/api';
import type {
    UpdatePasswordFormValues,
    UpdateProfileRequest,
} from './schemas/forms';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';

export type ProfileActionResult<T = UserApi> =
    | { success: true; data: T }
    | { success: false; error: string };

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

export function useProfileLogic() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState<UserApi | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const fetchPerfil = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getPerfil();
            setUsuario(data);
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return;
            setError(toErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [navigate, handleAuthError]);

    useEffect(() => {
        void fetchPerfil();
    }, [fetchPerfil]);

    const updatePerfilHandler = useCallback(
        async (datos: UpdateProfileRequest): Promise<ProfileActionResult> => {
            setSaving(true);
            setError(null);
            try {
                const actualizado = await updatePerfil(datos);
                setUsuario(actualizado);
                return { success: true, data: actualizado };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    throw new Error('Sesión expirada');
                }
                return { success: false, error: toErrorMessage(err) };
            } finally {
                setSaving(false);
            }
        },
        [handleAuthError]
    );

    const updatePassword = useCallback(
        async (
            datos: UpdatePasswordFormValues
        ): Promise<ProfileActionResult<{ mensaje: string }>> => {
            setSaving(true);
            setError(null);
            try {
                const result = await updatePasswordApi(datos);
                return { success: true, data: result };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    throw new Error('Sesión expirada');
                }
                return { success: false, error: toErrorMessage(err) };
            } finally {
                setSaving(false);
            }
        },
        [handleAuthError]
    );

    return {
        usuario,
        loading,
        saving,
        error,
        fetchPerfil,
        updatePerfil: updatePerfilHandler,
        updatePassword,
    };
}
