import { CheckoutProvider } from '@/app/providers';
import CheckoutContent from '@/features/checkout/ui/CheckoutContent/CheckoutContent';
import CheckoutPageHeader from '@/widgets/checkout/CheckoutPageHeader';
import styles from '@/widgets/checkout/checkoutPage.module.css';

export function CheckoutPage() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <CheckoutPageHeader />

                <CheckoutProvider>
                    <CheckoutContent />
                </CheckoutProvider>
            </div>
        </main>
    );
}

export default CheckoutPage;
