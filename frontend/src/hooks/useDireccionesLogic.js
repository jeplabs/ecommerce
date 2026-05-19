import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { direccionService } from '../services/direccionService';
import { redirectUnauthorized } from '../utils/apiHelpers';

export const useDireccionesLogic = (enabled = true) => {
    const navigate = useNavigate();
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleAuthError = useCallback(
        (status) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const fetchDirecciones = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);
        try {
            const data = await direccionService.listar();
            setDirecciones(Array.isArray(data) ? data : []);
        } catch (err) {
            if (handleAuthError(err.status)) return;
            setError(err.message);
            setDirecciones([]);
        } finally {
            setLoading(false);
        }
    }, [enabled, handleAuthError]);

    useEffect(() => {
        if (enabled) {
            fetchDirecciones();
        }
    }, [enabled, fetchDirecciones]);

    const crearDireccion = useCallback(
        async (datos) => {
            setSaving(true);
            setError(null);
            try {
                const nueva = await direccionService.crear(datos);
                await fetchDirecciones();
                return { success: true, data: nueva };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: err.message, fields: err.data };
            } finally {
                setSaving(false);
            }
        },
        [fetchDirecciones, handleAuthError]
    );

    const actualizarDireccion = useCallback(
        async (id, datos) => {
            setSaving(true);
            setError(null);
            try {
                await direccionService.actualizar(id, datos);
                await fetchDirecciones();
                return { success: true };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: err.message, fields: err.data };
            } finally {
                setSaving(false);
            }
        },
        [fetchDirecciones, handleAuthError]
    );

    const cambiarPrincipal = useCallback(
        async (id) => {
            setSaving(true);
            try {
                await direccionService.cambiarPrincipal(id);
                await fetchDirecciones();
                return { success: true };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: err.message };
            } finally {
                setSaving(false);
            }
        },
        [fetchDirecciones, handleAuthError]
    );

    const eliminarDireccion = useCallback(
        async (id) => {
            setSaving(true);
            try {
                await direccionService.eliminar(id);
                await fetchDirecciones();
                return { success: true };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: err.message };
            } finally {
                setSaving(false);
            }
        },
        [fetchDirecciones, handleAuthError]
    );

    return {
        direcciones,
        loading,
        saving,
        error,
        fetchDirecciones,
        crearDireccion,
        actualizarDireccion,
        cambiarPrincipal,
        eliminarDireccion,
    };
};
