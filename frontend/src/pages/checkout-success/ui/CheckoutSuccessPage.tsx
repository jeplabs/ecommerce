import { useCart } from '@/app/providers';
import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import type { OrderApi } from '@/entities/order';
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

                <CheckoutSuccessView orden={orden} payment={payment} />
            </div>
        </main>
    );
}

export default CheckoutSuccessPage;
