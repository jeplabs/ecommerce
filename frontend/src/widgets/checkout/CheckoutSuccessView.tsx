import type { OrderApi } from '@/entities/order';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import CheckoutSuccessHeader from '@/features/checkout/ui/success/CheckoutSuccessHeader/CheckoutSuccessHeader';
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
        <>
            <CheckoutSuccessHeader orderId={orden.id} isBankTransfer={isBankTransfer} />

            <div className={styles.main}>
                <OrderConfirmationSummary
                    orden={orden}
                    payment={payment}
                    isBankTransfer={isBankTransfer}
                />
                <CheckoutSuccessActions />
            </div>

            <CheckoutSuccessRecommendations orden={orden} />
        </>
    );
}
