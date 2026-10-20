import type { OrderApi } from '@/entities/order';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import OrderConfirmationSummary from '@/features/checkout/ui/success/OrderConfirmationSummary/OrderConfirmationSummary';
import CheckoutSuccessActions from '@/features/checkout/ui/success/CheckoutSuccessActions/CheckoutSuccessActions';
import CheckoutSuccessRecommendations from '@/features/checkout/ui/success/CheckoutSuccessRecommendations/CheckoutSuccessRecommendations';
import styles from '@/widgets/checkout/checkoutSuccessPage.module.css';

type CheckoutSuccessViewProps = {
    orden: OrderApi;
    payment?: PaymentSuccessResult | null;
    isBankTransfer?: boolean;
};

export default function CheckoutSuccessView({
    orden,
    payment,
    isBankTransfer = false,
}: CheckoutSuccessViewProps) {
    return (
        <div className={styles.view}>
            <OrderConfirmationSummary
                orden={orden}
                payment={payment}
                isBankTransfer={isBankTransfer}
            />

            <CheckoutSuccessActions />

            <CheckoutSuccessRecommendations orden={orden} />
        </div>
    );
}
