import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { redirectUnauthorized } from '../utils/apiHelpers';

export const useProfileLogic = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleAuthError = useCallback(
        (status) => redirectUnauthorized(status, navigate),
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
            const data = await profileService.getPerfil();
            setUsuario(data);
        } catch (err) {
            if (handleAuthError(err.status)) return;
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate, handleAuthError]);

    useEffect(() => {
        fetchPerfil();
    }, [fetchPerfil]);

    const updatePerfil = useCallback(
        async (datos) => {
            setSaving(true);
            setError(null);
            try {
                const actualizado = await profileService.updatePerfil(datos);
                setUsuario(actualizado);
                return { success: true, data: actualizado };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    throw new Error('Sesión expirada');
                }
                return { success: false, error: err.message };
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
        updatePerfil,
    };
};
