import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { isAuthError } from '../utils/apiHelpers';
import { useToast } from '../context/ToastContext';

const getToken = () => localStorage.getItem('token');

/**
 * Detalle y actualización de rol de un usuario (admin).
 * Centraliza efectos, token y errores de sesión.
 */
export function useAdminUser(userId) {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [user, setUser] = useState(null);
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {
        if (!userId) {
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
                const data = await authService.getUsuarioById(userId);
                if (cancelled) return;
                setUser(data);
                setRol(data.rol || '');
            } catch (e) {
                if (cancelled) return;
                if (handleAuthError(e.status)) {
                    return;
                }
                showError(e.message);
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
        async (nextRol) => {
            if (!user) {
                return { success: false, error: 'Sin datos de usuario' };
            }

            setSaving(true);
            try {
                const updated = await authService.updateUsuarioRol(user.id, nextRol);
                setUser(updated);
                setRol(updated.rol || '');
                showSuccess('Rol actualizado');
                return { success: true, data: updated };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                showError(err.message);
                return { success: false, error: err.message };
            } finally {
                setSaving(false);
            }
        },
        [user, handleAuthError, showSuccess, showError]
    );

    return { user, rol, setRol, loading, saving, updateRol };
}
