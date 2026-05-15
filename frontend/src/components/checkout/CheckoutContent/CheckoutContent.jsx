import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../../context/CheckoutContext';
import { useToast } from '../../../context/ToastContext';
import CheckoutSteps from '../CheckoutSteps/CheckoutSteps';
import ShippingStep from '../ShippingStep/ShippingStep';
import PaymentStep from '../PaymentStep/PaymentStep';
import ConfirmStep from '../ConfirmStep/ConfirmStep';
import OrderSummary from '../OrderSummary/OrderSummary';
import './CheckoutContent.css';

export default function CheckoutContent() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const {
        steps,
        step,
        currentStep,
        cartItems,
        cartTotal,
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
        return <p className="checkout-page__loading">Preparando checkout…</p>;
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
        <div className="checkout-content">
            <CheckoutSteps steps={steps} currentIndex={step} />

            {error && (
                <p className="checkout-content__error" role="alert">
                    {error}
                </p>
            )}

            <div className="checkout-content__layout">
                <div className="checkout-content__main">
                    {currentStep === 'envio' && <ShippingStep />}
                    {currentStep === 'pago' && <PaymentStep />}
                    {currentStep === 'confirmar' && <ConfirmStep />}

                    <div className="checkout-content__nav">
                        {step > 0 && (
                            <button
                                type="button"
                                className="checkout-btn checkout-btn--secondary"
                                onClick={goBack}
                                disabled={processing}
                            >
                                Atrás
                            </button>
                        )}

                        {!isLastStep ? (
                            <button
                                type="button"
                                className="checkout-btn checkout-btn--primary"
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
                                className="checkout-btn checkout-btn--primary checkout-btn--pay"
                                onClick={handlePay}
                                disabled={processing}
                            >
                                {processing ? 'Procesando pago…' : 'Pagar y confirmar'}
                            </button>
                        )}
                    </div>
                </div>

                <OrderSummary items={cartItems} total={cartTotal} />
            </div>
        </div>
    );
}
