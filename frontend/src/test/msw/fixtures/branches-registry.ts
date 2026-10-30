import type { BranchApi } from '@/entities/branch/model/schemas/api';
import { mockBranches as seedBranches } from './branches';

let branches: BranchApi[] = [];
let nextId = 10;

export function resetDynamicBranches() {
    branches = seedBranches.map((branch) => ({ ...branch }));
    nextId = 10;
}

resetDynamicBranches();

export function getDynamicBranches(soloActivas = false): BranchApi[] {
    const list = soloActivas ? branches.filter((b) => b.activo) : branches;
    return [...list].sort(
        (a, b) => (a.ordenVisualizacion ?? 999) - (b.ordenVisualizacion ?? 999) || a.id - b.id
    );
}

export function findDynamicBranch(id: number): BranchApi | undefined {
    return branches.find((branch) => branch.id === id);
}

export function createDynamicBranch(
    data: Omit<BranchApi, 'id' | 'creadoAt' | 'actualizadoAt' | 'activo'> & { activo?: boolean }
): BranchApi {
    const now = '2026-10-30T15:00:00';
    const created: BranchApi = {
        estado: null,
        codigoPostal: null,
        referencias: null,
        mapaUrl: null,
        ordenVisualizacion: null,
        ...data,
        activo: data.activo ?? true,
        id: nextId++,
        creadoAt: now,
        actualizadoAt: now,
    };
    branches.push(created);
    return { ...created };
}

export function updateDynamicBranch(
    id: number,
    data: Partial<Omit<BranchApi, 'id' | 'creadoAt' | 'actualizadoAt'>>
): BranchApi {
    const index = branches.findIndex((branch) => branch.id === id);
    if (index === -1) {
        throw new Error('Sucursal no encontrada');
    }

    const updated: BranchApi = {
        ...branches[index],
        ...data,
        id,
        actualizadoAt: '2026-10-30T15:00:00',
    };
    branches[index] = updated;
    return { ...updated };
}

export function activarDynamicBranch(id: number): void {
    const branch = findDynamicBranch(id);
    if (!branch) {
        throw new Error('Sucursal no encontrada');
    }
    branch.activo = true;
    branch.actualizadoAt = '2026-10-30T15:00:00';
}

export function desactivarDynamicBranch(id: number): void {
    const branch = findDynamicBranch(id);
    if (!branch) {
        throw new Error('Sucursal no encontrada');
    }
    branch.activo = false;
    branch.actualizadoAt = '2026-10-30T15:00:00';
}

