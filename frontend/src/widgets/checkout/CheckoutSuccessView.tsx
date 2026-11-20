import type { OrderApi } from '@/features/checkout';
import type { PaymentSuccessResult } from '@/features/checkout';
import {
    OrderConfirmationSummary,
    CheckoutSuccessActions,
    CheckoutSuccessRecommendations,
} from '@/features/checkout';
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
