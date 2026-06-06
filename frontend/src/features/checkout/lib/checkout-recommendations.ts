import type { OrderItemApi } from '@/entities/order';
import type { ProductApi } from '@/entities/product';

/**
 * Productos sugeridos tras una compra (excluye lo ya pedido).
 */
export function pickPostCheckoutProducts(
    productos: ProductApi[] | null | undefined,
    orderItems: OrderItemApi[] | null | undefined = [],
    limit = 12
): ProductApi[] {
    if (!Array.isArray(productos) || productos.length === 0) return [];

    const purchasedIds = new Set(
        (orderItems ?? [])
            .map((item) => item.productoId)
            .filter((id): id is number => id != null)
    );

    const hidden = ['OCULTO', 'DESCONTINUADO'];
    const candidates = productos.filter((p) => {
        if (p?.id == null || purchasedIds.has(p.id)) return false;
        const estado = (p.estado || '').toUpperCase().replace(/[-\s]/g, '_');
        return !hidden.includes(estado);
    });

    if (candidates.length === 0) return [];

    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, limit);
}
