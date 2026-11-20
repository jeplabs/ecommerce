import type { CartApi } from '@/features/cart';

export const mockEmptyCart: CartApi = {
    id: 1,
    estado: 'ACTIVO',
    expiraAt: null,
    items: [],
    total: 0,
    totalItems: 0,
};
