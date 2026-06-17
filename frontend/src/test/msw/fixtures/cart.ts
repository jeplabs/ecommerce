import type { CartApi } from '@/entities/cart/model/schemas/api';

export const mockEmptyCart: CartApi = {
    id: 1,
    estado: 'ACTIVO',
    expiraAt: null,
    items: [],
    total: 0,
    totalItems: 0,
};
