import QPayProReturn from '@/features/checkout/ui/QPayProReturn/QPayProReturn';
import CheckoutPageHeader from '@/widgets/checkout/CheckoutPageHeader';
import styles from '@/widgets/checkout/checkoutPage.module.css';

export function QPayProReturnPage() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <CheckoutPageHeader backTo="/checkout" backLabel="← Volver al checkout" />
                <QPayProReturn />
            </div>
        </main>
    );
}

export default QPayProReturnPage;

