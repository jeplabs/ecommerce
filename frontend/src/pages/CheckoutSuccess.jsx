import { useCart } from '@/app/providers';
import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import CheckoutSuccessHeader from '@/features/checkout/ui/success/CheckoutSuccessHeader/CheckoutSuccessHeader';
import OrderConfirmationSummary from '@/features/checkout/ui/success/OrderConfirmationSummary/OrderConfirmationSummary';
import CheckoutSuccessActions from '@/features/checkout/ui/success/CheckoutSuccessActions/CheckoutSuccessActions';
import CheckoutSuccessRecommendations from '@/features/checkout/ui/success/CheckoutSuccessRecommendations/CheckoutSuccessRecommendations';
import './CheckoutSuccess.css';

export default function CheckoutSuccess() {
    const location = useLocation();
    const { orden, payment } = location.state || {};
    const { refreshCart } = useCart();

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    if (!orden) {
        return <Navigate to="/catalogo" replace />;
    }

    return (
        <main className="checkout-success-page">
                <div className="checkout-success-page__inner">
                    <CheckoutSuccessHeader orderId={orden.id} />

                    <div className="checkout-success-page__main">
                        <OrderConfirmationSummary orden={orden} payment={payment} />
                        <CheckoutSuccessActions />
                    </div>

                    <CheckoutSuccessRecommendations orden={orden} />
                </div>
        </main>
    );
}
