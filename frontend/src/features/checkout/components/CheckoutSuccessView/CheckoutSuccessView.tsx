import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { useCart } from '@/app/providers';
import type { OrderApi } from '../../types/order';
import { orderApi } from '../../api/orderApi';
import {
    CHECKOUT_STEPS,
    CHECKOUT_SUCCESS_STEP_INDEX,
} from '../../lib/checkoutSteps';
import type { PaymentSuccessResult } from '../../types';
import CheckoutSteps from '../CheckoutSteps/CheckoutSteps';
import CheckoutPageHeader from '../CheckoutPageHeader/CheckoutPageHeader';
import OrderConfirmationSummary from '../success/OrderConfirmationSummary/OrderConfirmationSummary';
import CheckoutSuccessActions from '../success/CheckoutSuccessActions/CheckoutSuccessActions';
import CheckoutSuccessRecommendations from '../success/CheckoutSuccessRecommendations/CheckoutSuccessRecommendations';
import styles from './CheckoutSuccessView.module.css';

export type CheckoutSuccessViewProps = {
    orden?: OrderApi;
    payment?: PaymentSuccessResult | null;
    isBankTransfer?: boolean;
};

type CheckoutSuccessLocationState = {
    orden?: OrderApi;
    payment?: PaymentSuccessResult | null;
    isBankTransfer?: boolean;
};

export function CheckoutSuccessView({
    orden: propOrden,
    payment: propPayment,
    isBankTransfer: propIsBankTransfer,
}: CheckoutSuccessViewProps = {}) {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { refreshCart } = useCart();

    const locationState = (location.state as CheckoutSuccessLocationState | null) ?? {};
    const stateOrden = propOrden ?? locationState.orden;
    const payment = propPayment !== undefined ? propPayment : locationState.payment;
    const isBankTransfer =
        propIsBankTransfer !== undefined
            ? propIsBankTransfer
            : Boolean(locationState.isBankTransfer);

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
            <main className={styles.page}>
                <div className={styles.inner}>
                    <p className={styles.loadingMessage}>Cargando datos de tu pedido…</p>
                </div>
            </main>
        );
    }

    if (!activeOrden || error) {
        return <Navigate to="/catalogo" replace />;
    }

    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.header}>
                    <CheckoutPageHeader backTo="/" backLabel="← Volver al inicio" />
                    <CheckoutSteps
                        steps={CHECKOUT_STEPS}
                        currentIndex={CHECKOUT_SUCCESS_STEP_INDEX}
                        markCurrentComplete
                    />
                </div>

                <div className={styles.view}>
                    <OrderConfirmationSummary
                        orden={activeOrden}
                        payment={payment}
                        isBankTransfer={isBankTransfer}
                    />

                    <CheckoutSuccessActions />

                    <CheckoutSuccessRecommendations orden={activeOrden} />
                </div>
            </div>
        </main>
    );
}

export default CheckoutSuccessView;
