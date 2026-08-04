import CheckoutReturn from '@/features/checkout/ui/CheckoutReturn/CheckoutReturn';
import CheckoutPageHeader from '@/widgets/checkout/CheckoutPageHeader';
import styles from '@/widgets/checkout/checkoutPage.module.css';

export function CheckoutReturnPage() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <CheckoutPageHeader backTo="/checkout" backLabel="← Volver al checkout" />
                <CheckoutReturn />
            </div>
        </main>
    );
}

export default CheckoutReturnPage;