import CheckoutSuccessHeader from '@/features/checkout/ui/success/CheckoutSuccessHeader/CheckoutSuccessHeader';
import OrderConfirmationSummary from '@/features/checkout/ui/success/OrderConfirmationSummary/OrderConfirmationSummary';
import CheckoutSuccessActions from '@/features/checkout/ui/success/CheckoutSuccessActions/CheckoutSuccessActions';
import CheckoutSuccessRecommendations from '@/features/checkout/ui/success/CheckoutSuccessRecommendations/CheckoutSuccessRecommendations';

export default function CheckoutSuccessView({ orden, payment }) {
    return (
        <>
            <CheckoutSuccessHeader orderId={orden.id} />

            <div className="checkout-success-page__main">
                <OrderConfirmationSummary orden={orden} payment={payment} />
                <CheckoutSuccessActions />
            </div>

            <CheckoutSuccessRecommendations orden={orden} />
        </>
    );
}
