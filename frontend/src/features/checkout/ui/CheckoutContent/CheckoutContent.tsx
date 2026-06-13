import { useRef } from 'react';
import { useCheckout, useToast } from '@/app/providers';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import CheckoutSteps from '../CheckoutSteps/CheckoutSteps';
import ReviewAndShippingStep from '../ReviewAndShippingStep/ReviewAndShippingStep';
import PaymentStep from '../PaymentStep/PaymentStep';
import OrderSummary from '../OrderSummary/OrderSummary';
import sharedStyles from '../checkoutShared.module.css';
import pageStyles from '@/widgets/checkout/checkoutPage.module.css';
import styles from './CheckoutContent.module.css';

export default function CheckoutContent() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const payingRef = useRef(false);

    const {
        steps,
        step,
        currentStep,
        cartItems,
        cartTotal,
        shippingCostDisplay,
        shippingCostInTotal,
        orderTotal,
        envioOpciones,
        selectedServicioCostos,
        cartLoading,
        isEmpty,
        checkoutCompleted,
        error,
        processing,
        canContinueShipping,
        canContinuePayment,
        goNext,
        goBack,
        completeCheckout,
    } = useCheckout();

    if ((cartLoading || isEmpty) && !processing && !checkoutCompleted) {
        return <p className={pageStyles.loading}>Preparando checkout…</p>;
    }

    const isPaymentStep = currentStep === 'pago';

    const handleContinue = () => {
        if (!canContinueShipping) return;
        goNext();
    };

    const handlePay = async () => {
        if (!canContinuePayment || payingRef.current) return;
        payingRef.current = true;
        try {
            const result = await completeCheckout();
            if (result.success) {
                showSuccess('¡Pedido realizado con éxito!');
                navigate('/checkout/success', {
                    replace: true,
                    state: {
                        orden: result.orden,
                        payment: result.payment,
                    },
                });
            } else if (result.error) {
                showError(result.error);
            }
        } finally {
            payingRef.current = false;
        }
    };

    return (
        <div>
            <CheckoutSteps steps={steps} currentIndex={step} />

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <div className={styles.layout}>
                <div className={styles.main}>
                    {currentStep === 'pedido' && <ReviewAndShippingStep />}
                    {currentStep === 'pago' && <PaymentStep />}

                    <div className={styles.nav}>
                        {step > 0 && (
                            <button
                                type="button"
                                className={clsx(
                                    sharedStyles.btn,
                                    sharedStyles.btnSecondary,
                                    styles.navBtn
                                )}
                                onClick={goBack}
                                disabled={processing}
                            >
                                Atrás
                            </button>
                        )}

                        {!isPaymentStep ? (
                            <button
                                type="button"
                                className={clsx(
                                    sharedStyles.btn,
                                    sharedStyles.btnPrimary,
                                    styles.navBtn
                                )}
                                onClick={handleContinue}
                                disabled={processing || !canContinueShipping}
                            >
                                Continuar al pago
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={clsx(
                                    sharedStyles.btn,
                                    sharedStyles.btnPrimary,
                                    styles.btnPay,
                                    styles.navBtn
                                )}
                                onClick={handlePay}
                                disabled={processing || !canContinuePayment}
                            >
                                {processing ? 'Procesando pago…' : 'Pagar y finalizar'}
                            </button>
                        )}
                    </div>
                </div>

                <OrderSummary
                    items={cartItems}
                    subtotal={cartTotal}
                    shippingCostDisplay={shippingCostDisplay}
                    shippingCostInTotal={shippingCostInTotal}
                    total={orderTotal}
                    envioGratis={envioOpciones?.envioGratis}
                    servicioCostos={selectedServicioCostos}
                />
            </div>
        </div>
    );
}
