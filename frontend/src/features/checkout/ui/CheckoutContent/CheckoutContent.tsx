import { useCheckout, useToast } from '@/app/providers';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import CheckoutSteps from '../CheckoutSteps/CheckoutSteps';
import ShippingStep from '../ShippingStep/ShippingStep';
import PaymentStep from '../PaymentStep/PaymentStep';
import ConfirmStep from '../ConfirmStep/ConfirmStep';
import OrderSummary from '../OrderSummary/OrderSummary';
import sharedStyles from '../checkoutShared.module.css';
import pageStyles from '@/widgets/checkout/checkoutPage.module.css';
import styles from './CheckoutContent.module.css';

export default function CheckoutContent() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

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
        formaPagoEnvio,
        selectedServicioCostos,
        cartLoading,
        isEmpty,
        error,
        processing,
        canContinueShipping,
        canContinuePayment,
        goNext,
        goBack,
        completeCheckout,
    } = useCheckout();

    if (cartLoading || isEmpty) {
        return <p className={pageStyles.loading}>Preparando checkout…</p>;
    }

    const handleNext = () => {
        if (currentStep === 'envio' && !canContinueShipping) return;
        if (currentStep === 'pago' && !canContinuePayment) return;
        goNext();
    };

    const handlePay = async () => {
        const result = await completeCheckout();
        if (result.success) {
            showSuccess('¡Pedido realizado con éxito!');
            navigate('/checkout/success', {
                state: {
                    orden: result.orden,
                    payment: result.payment,
                },
            });
        } else if (result.error) {
            showError(result.error);
        }
    };

    const isLastStep = currentStep === 'confirmar';

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
                    {currentStep === 'envio' && <ShippingStep />}
                    {currentStep === 'pago' && <PaymentStep />}
                    {currentStep === 'confirmar' && <ConfirmStep />}

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

                        {!isLastStep ? (
                            <button
                                type="button"
                                className={clsx(
                                    sharedStyles.btn,
                                    sharedStyles.btnPrimary,
                                    styles.navBtn
                                )}
                                onClick={handleNext}
                                disabled={
                                    processing ||
                                    (currentStep === 'envio' && !canContinueShipping) ||
                                    (currentStep === 'pago' && !canContinuePayment)
                                }
                            >
                                Continuar
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
                                disabled={processing}
                            >
                                {processing ? 'Procesando pago…' : 'Pagar y confirmar'}
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
                    formaPagoEnvio={formaPagoEnvio}
                    servicioCostos={selectedServicioCostos}
                />
            </div>
        </div>
    );
}
