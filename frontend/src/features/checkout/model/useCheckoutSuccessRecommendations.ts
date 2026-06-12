import { useMemo } from 'react';
import { useProduct } from '@/app/providers/ProductProvider';
import { pickPostCheckoutProducts } from '@/features/checkout/lib/checkout-recommendations';
import type { OrderApi } from '@/entities/order';
import type { ProductApi } from '@/entities/product';

const DEFAULT_LIMIT = 12;

/**
 * Productos para mostrar en la página de compra exitosa.
 */
export function useCheckoutSuccessRecommendations(
    orden: OrderApi | null | undefined,
    limit = DEFAULT_LIMIT
) {
    const { productos, loading } = useProduct();
    const catalog = useMemo(() => (productos ?? []) as ProductApi[], [productos]);

    const recommended = useMemo(
        () => pickPostCheckoutProducts(catalog, orden?.items, limit),
        [catalog, orden?.items, limit]
    );

    const offers = useMemo(() => {
        const exclude = new Set(recommended.map((p) => p.id));
        (orden?.items ?? []).forEach((item) => {
            if (item.productoId != null) exclude.add(item.productoId);
        });
        const rest = catalog.filter(
            (p) => p?.id != null && !exclude.has(p.id)
        );
        return pickPostCheckoutProducts(rest, [], Math.min(8, limit));
    }, [catalog, recommended, orden?.items, limit]);

    return {
        recommended,
        offers,
        loading,
    };
}
