import { useCart } from '@/app/providers';
import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import type { OrderApi } from '@/entities/order';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import CheckoutSuccessView from '@/widgets/checkout/CheckoutSuccessView';
import '@/widgets/checkout/CheckoutSuccessView.css';

type CheckoutSuccessLocationState = {
    orden?: OrderApi;
    payment?: PaymentSuccessResult;
};

export function CheckoutSuccessPage() {
    const location = useLocation();
    const { orden, payment } = (location.state as CheckoutSuccessLocationState | null) ?? {};
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
