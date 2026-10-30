import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchApi, type BranchApi, type CreateBranchRequest, type UpdateBranchRequest } from '@/entities/branch';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';
import { getAccessToken } from '@/shared/lib/auth-token-store';

const getToken = () => getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

export function useAdminBranches() {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<BranchApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const loadBranches = useCallback(async () => {
        if (!getToken()) {
            navigate('/login', { replace: true });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await branchApi.listarAdmin();
            setBranches(data);
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return;
            console.error('Error al cargar sucursales (admin):', err);
            setError(toErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [navigate, handleAuthError]);

    useEffect(() => {
        void loadBranches();
    }, [loadBranches]);

    const crearSucursal = async (datos: CreateBranchRequest) => {
        try {
            const created = await branchApi.crearAdmin(datos);
            setBranches((prev) => [...prev, created]);
            return { success: true, branch: created };
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return { success: false, error: 'Sesión expirada' };
            const msg = toErrorMessage(err) || 'Error al crear la sucursal';
            return { success: false, error: msg };
        }
    };

    const actualizarSucursal = async (id: number, datos: UpdateBranchRequest) => {
        try {
            const updated = await branchApi.actualizarAdmin(id, datos);
            setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
            return { success: true, branch: updated };
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return { success: false, error: 'Sesión expirada' };
            const msg = toErrorMessage(err) || 'Error al actualizar la sucursal';
            return { success: false, error: msg };
        }
    };

    const activarSucursal = async (id: number) => {
        try {
            await branchApi.activarAdmin(id);
            setBranches((prev) =>
                prev.map((b) => (b.id === id ? { ...b, activo: true } : b))
            );
            return { success: true };
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return { success: false, error: 'Sesión expirada' };
            const msg = toErrorMessage(err) || 'Error al activar la sucursal';
            return { success: false, error: msg };
        }
    };

    const desactivarSucursal = async (id: number) => {
        try {
            await branchApi.desactivarAdmin(id);
            setBranches((prev) =>
                prev.map((b) => (b.id === id ? { ...b, activo: false } : b))
            );
            return { success: true };
        } catch (err) {
            if (handleAuthError(toErrorStatus(err))) return { success: false, error: 'Sesión expirada' };
            const msg = toErrorMessage(err) || 'Error al desactivar la sucursal';
            return { success: false, error: msg };
        }
    };

    return {
        branches,
        setBranches,
        loading,
        error,
        loadBranches,
        crearSucursal,
        actualizarSucursal,
        activarSucursal,
        desactivarSucursal,
    };
}

