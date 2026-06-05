import { useCart } from '@/app/providers';
import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import CheckoutSuccessView from '@/widgets/checkout/CheckoutSuccessView';
import '@/widgets/checkout/CheckoutSuccessView.css';

export function CheckoutSuccessPage() {
    const location = useLocation();
    const { orden, payment } = (location.state as {
        orden?: { id: number };
        payment?: unknown;
    }) || {};
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
                <CheckoutSuccessView orden={orden} payment={payment} />
            </div>
        </main>
    );
}

export default CheckoutSuccessPage;
