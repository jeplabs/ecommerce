import type { OrderApi } from '@/entities/order';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import CheckoutSuccessHeader from '@/features/checkout/ui/success/CheckoutSuccessHeader/CheckoutSuccessHeader';
import OrderConfirmationSummary from '@/features/checkout/ui/success/OrderConfirmationSummary/OrderConfirmationSummary';
import CheckoutSuccessActions from '@/features/checkout/ui/success/CheckoutSuccessActions/CheckoutSuccessActions';
import CheckoutSuccessRecommendations from '@/features/checkout/ui/success/CheckoutSuccessRecommendations/CheckoutSuccessRecommendations';

type CheckoutSuccessViewProps = {
    orden: OrderApi;
    payment?: PaymentSuccessResult | null;
};

export default function CheckoutSuccessView({ orden, payment }: CheckoutSuccessViewProps) {
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
