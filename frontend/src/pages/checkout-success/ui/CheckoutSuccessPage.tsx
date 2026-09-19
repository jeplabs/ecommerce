import { useCart } from '@/app/providers';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Navigate } from 'react-router-dom';
import type { OrderApi } from '@/entities/order';
import { orderApi } from '@/entities/order/api/orderApi';
import {
    CHECKOUT_STEPS,
    CHECKOUT_SUCCESS_STEP_INDEX,
} from '@/features/checkout/model/checkoutSteps';
import CheckoutSteps from '@/features/checkout/ui/CheckoutSteps/CheckoutSteps';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import CheckoutPageHeader from '@/widgets/checkout/CheckoutPageHeader';
import CheckoutSuccessView from '@/widgets/checkout/CheckoutSuccessView';
import pageStyles from '@/widgets/checkout/checkoutPage.module.css';
import successStyles from '@/widgets/checkout/checkoutSuccessPage.module.css';

type CheckoutSuccessLocationState = {
    orden?: OrderApi;
    payment?: PaymentSuccessResult | null;
    isBankTransfer?: boolean;
};

export function CheckoutSuccessPage() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { orden: stateOrden, payment, isBankTransfer = false } =
        (location.state as CheckoutSuccessLocationState | null) ?? {};
    const { refreshCart } = useCart();

    const ordenParam = searchParams.get('orden') || searchParams.get('ordenId');
    const ordenId = ordenParam && !Number.isNaN(Number(ordenParam)) ? Number(ordenParam) : null;

    const [fetchedOrden, setFetchedOrden] = useState<OrderApi | null>(stateOrden ?? null);
    const [loading, setLoading] = useState<boolean>(!stateOrden && Boolean(ordenId));
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    useEffect(() => {
        if (stateOrden || !ordenId) return;

        let active = true;
        setLoading(true);
        orderApi
            .obtenerOrden(ordenId)
            .then((data) => {
                if (active) {
                    setFetchedOrden(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (active) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [stateOrden, ordenId]);

    const activeOrden = stateOrden ?? fetchedOrden;

    if (loading) {
        return (
            <main className={pageStyles.page}>
                <div className={`${pageStyles.inner} ${successStyles.inner}`}>
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos de tu pedido…</p>
                </div>
            </main>
        );
    }

    if (!activeOrden || error) {
        return <Navigate to="/catalogo" replace />;
    }

    return (
        <main className={pageStyles.page}>
            <div className={`${pageStyles.inner} ${successStyles.inner}`}>
                <CheckoutPageHeader
                    backTo="/catalogo"
                    backLabel="← Seguir comprando"
                />

                <CheckoutSteps
                    steps={CHECKOUT_STEPS}
                    currentIndex={CHECKOUT_SUCCESS_STEP_INDEX}
                    markCurrentComplete
                />

                <CheckoutSuccessView
                    orden={activeOrden}
                    payment={payment}
                    isBankTransfer={isBankTransfer}
                />
            </div>
        </main>
    );
}

export default CheckoutSuccessPage;
