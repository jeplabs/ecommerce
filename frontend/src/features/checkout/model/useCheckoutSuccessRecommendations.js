import { useMemo } from 'react';
import { useProduct } from '@/app/providers/ProductProvider';
import { pickPostCheckoutProducts } from '@/features/checkout/lib/checkout-recommendations';

const DEFAULT_LIMIT = 12;

/**
 * Productos para mostrar en la página de compra exitosa.
 */
export function useCheckoutSuccessRecommendations(orden, limit = DEFAULT_LIMIT) {
    const { productos, loading } = useProduct();

    const recommended = useMemo(
        () => pickPostCheckoutProducts(productos, orden?.items, limit),
        [productos, orden?.items, limit]
    );

    const offers = useMemo(() => {
        const exclude = new Set(recommended.map((p) => p.id));
        (orden?.items || []).forEach((item) => {
            if (item.productoId != null) exclude.add(item.productoId);
        });
        const rest = (productos || []).filter((p) => p?.id != null && !exclude.has(p.id));
        return pickPostCheckoutProducts(rest, [], Math.min(8, limit));
    }, [productos, recommended, orden?.items, limit]);

    return {
        recommended,
        offers,
        loading,
    };
}
