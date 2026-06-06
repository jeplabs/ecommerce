import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/entities/user/api';
import type { UserApi, UserRole } from '@/entities/user';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { useToast } from '@/app/providers/ToastProvider';
import { ApiError } from '@/shared';
import type { AdminActionResult, UseAdminUserResult } from './types';

const getToken = () => localStorage.getItem('token');

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

function parseUserId(userId: string | number | undefined): number | null {
    if (userId == null || userId === '') return null;
    const parsed = typeof userId === 'number' ? userId : Number(userId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Detalle y actualización de rol de un usuario (admin).
 * Centraliza efectos, token y errores de sesión.
 */
export function useAdminUser(userId: string | number | undefined): UseAdminUserResult {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [user, setUser] = useState<UserApi | null>(null);
    const [rol, setRol] = useState<UserRole | ''>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    useEffect(() => {
        const numericId = parseUserId(userId);
        if (numericId == null) {
            setLoading(false);
            return;
        }

        if (!getToken()) {
            navigate('/login', { replace: true });
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const data = await authApi.getUsuarioById(numericId);
                if (cancelled) return;
                setUser(data);
                setRol(data.rol || '');
            } catch (err) {
                if (cancelled) return;
                if (handleAuthError(toErrorStatus(err))) {
                    return;
                }
                showError(toErrorMessage(err));
                navigate('/admin/users', { replace: true });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userId, navigate, handleAuthError, showError]);

    const updateRol = useCallback(
        async (nextRol: UserRole): Promise<AdminActionResult<UserApi>> => {
            if (!user) {
                return { success: false, error: 'Sin datos de usuario' };
            }

            setSaving(true);
            try {
                const updated = await authApi.updateUsuarioRol(user.id, nextRol);
                setUser(updated);
                setRol(updated.rol || '');
                showSuccess('Rol actualizado');
                return { success: true, data: updated };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                const message = toErrorMessage(err);
                showError(message);
                return { success: false, error: message };
            } finally {
                setSaving(false);
            }
        },
        [user, handleAuthError, showSuccess, showError]
    );

    return { user, rol, setRol, loading, saving, updateRol };
}
