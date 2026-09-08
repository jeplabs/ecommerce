import { useRef } from 'react';
import { useCheckout, useToast } from '@/app/providers';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { isBankTransferPaymentMethod } from '@/features/checkout/model/schemas/payment';
import { PAYMENT_METHODS } from '@/features/checkout';

import CheckoutSteps from '../CheckoutSteps/CheckoutSteps';
import ReviewAndShippingStep from '../ReviewAndShippingStep/ReviewAndShippingStep';
import PaymentStep from '../PaymentStep/PaymentStep';
import OrderSummary from '../OrderSummary/OrderSummary';
import sharedStyles from '../checkoutShared.module.css';
import pageStyles from '@/widgets/checkout/checkoutPage.module.css';
import styles from './CheckoutContent.module.css';
import RedirectToWebpay from '../RedirectToWebpay/RedirectToWebpay';
import RedirectToQPayPro from '../RedirectToQPayPro/RedirectToQPayPro';

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
        shippingCostInTotal,
        orderTotal,
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
        paymentMethod,
        redirectInfo,
    } = useCheckout();

    const isBankTransfer = isBankTransferPaymentMethod(paymentMethod);
    const isContraEntrega = paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA;
    const isWebpay = paymentMethod === PAYMENT_METHODS.WEBPAY;
    const isQPayPro = paymentMethod === PAYMENT_METHODS.QPAYPRO;

    if ((cartLoading || isEmpty) && !processing && !checkoutCompleted) {
        return <p className={pageStyles.loading}>Preparando checkout…</p>;
    }

    if (redirectInfo) {
        if (isQPayPro) {
            return <RedirectToQPayPro redirectUrl={redirectInfo.urlRedireccion} />;
        }
        return (
            <RedirectToWebpay
                urlRedireccion={redirectInfo.urlRedireccion}
                token={redirectInfo.token}
            />
        );
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
            if (result.success && result.needsRedirect) {
                return;
            }
            if (result.success) {
                showSuccess(
                    result.isBankTransfer
                        ? 'Pedido registrado. Realiza la transferencia y sube el comprobante desde tu historial.'
                        : isContraEntrega
                          ? '¡Pedido realizado con éxito! Se pagará contraentrega al recibirlo.'
                          : '¡Pedido realizado con éxito!'
                );
                navigate('/checkout/success', {
                    replace: true,
                    state: {
                        orden: result.orden,
                        payment: result.payment,
                        isBankTransfer: result.isBankTransfer,
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
                                {processing
                                    ? isWebpay || isQPayPro
                                        ? 'Creando pedido…'
                                        : isBankTransfer
                                            ? 'Registrando pedido…'
                                            : isContraEntrega
                                                ? 'Registrando pedido…'
                                                : 'Procesando pago…'
                                    : isWebpay
                                        ? 'Ir a Webpay Plus'
                                        : isQPayPro
                                            ? 'Ir a QPayPro'
                                            : isBankTransfer
                                                ? 'Confirmar pedido'
                                                : isContraEntrega
                                                    ? 'Confirmar pedido'
                                                    : 'Pagar y finalizar'}
                            </button>
                        )}
                    </div>
                </div>

                <OrderSummary
                    items={cartItems}
                    subtotal={cartTotal}
                    shippingCostInTotal={shippingCostInTotal}
                    total={orderTotal}
                    servicioCostos={selectedServicioCostos}
                    isContraEntrega={isContraEntrega}
                />
            </div>
        </div>
    );
}
