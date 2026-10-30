import { API_URL } from '@/shared/config';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import { branchListSchema, type BranchApi } from '../model/schemas/api';

export async function listar(): Promise<BranchApi[]> {
    const response = await fetch(`${API_URL}/api/sucursales`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError(getErrorMessage(raw, 'Error al listar sucursales'), response.status, raw);
    }
    return parseApi(branchListSchema, raw);
}

export const branchApi = { listar };

