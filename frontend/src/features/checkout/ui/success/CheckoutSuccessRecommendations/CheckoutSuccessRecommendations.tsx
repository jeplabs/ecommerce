import { useAuth, useCart, useToast } from '@/app/providers';
import { useNavigate } from 'react-router-dom';

import { useCheckoutSuccessRecommendations } from '@/features/checkout';
import { ProductSlider } from '@/shared/ui/ProductSlider/ProductSlider';
import type { OrderApi } from '@/entities/order';
import './CheckoutSuccessRecommendations.css';

type CheckoutSuccessRecommendationsProps = {
    orden: OrderApi | null | undefined;
};

export default function CheckoutSuccessRecommendations({ orden }: CheckoutSuccessRecommendationsProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useToast();
    const { recommended, offers, loading } = useCheckoutSuccessRecommendations(orden);

    const handleAddToCart = async (productoId: number, productoNombre: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const result = await addToCart(productoId, 1);
        if (result.success) {
            showSuccess(`${productoNombre} agregado al carrito`);
        } else {
            showError(result.error || 'No se pudo agregar el producto');
        }
    };

    if (loading) {
        return (
            <section className="checkout-success-recommendations" aria-busy="true">
                <p className="checkout-success-recommendations__loading">Cargando sugerencias…</p>
            </section>
        );
    }

    if (recommended.length === 0 && offers.length === 0) {
        return null;
    }

    return (
        <section
            className="checkout-success-recommendations"
            aria-labelledby="checkout-recommendations-title"
        >
            <div className="checkout-success-recommendations__intro">
                <h2 id="checkout-recommendations-title">También te puede interesar</h2>
                <p>Descubre más productos mientras preparamos tu pedido.</p>
            </div>

            <div className="checkout-success-recommendations__sliders">
                {recommended.length > 0 && (
                    <ProductSlider
                        title="Recomendados para ti"
                        products={recommended}
                        onAddToCart={handleAddToCart}
                    />
                )}
                {offers.length > 0 && (
                    <ProductSlider
                        title="Más del catálogo"
                        products={offers}
                        onAddToCart={handleAddToCart}
                    />
                )}
            </div>
        </section>
    );
}
