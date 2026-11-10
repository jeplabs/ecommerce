import CheckoutReturn from '../CheckoutReturn/CheckoutReturn';
import CheckoutPageHeader from '../CheckoutPageHeader/CheckoutPageHeader';
import styles from './CheckoutReturnView.module.css';

export function CheckoutReturnView() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <CheckoutPageHeader backTo="/checkout" backLabel="← Volver al checkout" title="Retorno Webpay" />
                <CheckoutReturn />
            </div>
        </main>
    );
}

export default CheckoutReturnView;
