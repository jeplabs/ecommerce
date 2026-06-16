import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressApi } from '../api';
import type { AddressApi } from './schemas/api';
import type { CreateAddressRequest, UpdateAddressRequest } from './schemas/forms';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';

export type AddressActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string; fields?: unknown };

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

function toErrorFields(error: unknown): unknown {
    return error instanceof ApiError ? error.data : undefined;
}

export function useDireccionesLogic(enabled = true) {
    const navigate = useNavigate();
    const [direcciones, setDirecciones] = useState<AddressApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const direccionesCountRef = useRef(0);
    direccionesCountRef.current = direcciones.length;

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const fetchDirecciones = useCallback(async () => {
        if (!enabled) return;

        if (direccionesCountRef.current === 0) {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await addressApi.listar();
            setDirecciones(Array.isArray(data) ? data : []);
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return;
            setError(toErrorMessage(err));
            setDirecciones([]);
        } finally {
            setLoading(false);
        }
    }, [enabled, handleAuthError]);

    useEffect(() => {
        if (enabled) {
            void fetchDirecciones();
        }
    }, [enabled, fetchDirecciones]);

    const crearDireccion = useCallback(
        async (datos: CreateAddressRequest): Promise<AddressActionResult<AddressApi>> => {
            setSaving(true);
            setError(null);
            try {
                const nueva = await addressApi.crear(datos);
                await fetchDirecciones();
                return { success: true, data: nueva };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return {
                    success: false,
                    error: toErrorMessage(err),
                    fields: toErrorFields(err),
                };
            } finally {
                setSaving(false);
            }
        },
        [fetchDirecciones, handleAuthError]
    );

    const actualizarDireccion = useCallback(
        async (
            id: number,
            datos: UpdateAddressRequest
        ): Promise<AddressActionResult> => {
            setSaving(true);
            setError(null);
            try {
                await addressApi.actualizar(id, datos);
                await fetchDirecciones();
                return { success: true };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return {
                    success: false,
                    error: toErrorMessage(err),
                    fields: toErrorFields(err),
                };
            } finally {
                setSaving(false);
            }
        },
        [fetchDirecciones, handleAuthError]
    );

    const cambiarPrincipal = useCallback(
        async (id: number): Promise<AddressActionResult> => {
            setSaving(true);
            try {
                await addressApi.cambiarPrincipal(id);
                await fetchDirecciones();
                return { success: true };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: toErrorMessage(err) };
            } finally {
                setSaving(false);
            }
        },
        [fetchDirecciones, handleAuthError]
    );

    const eliminarDireccion = useCallback(
        async (id: number): Promise<AddressActionResult> => {
            setSaving(true);
            try {
                await addressApi.eliminar(id);
                await fetchDirecciones();
                return { success: true };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: toErrorMessage(err) };
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
}
