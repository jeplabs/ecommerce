import QPayProReturn from '../QPayProReturn/QPayProReturn';
import CheckoutPageHeader from '../CheckoutPageHeader/CheckoutPageHeader';
import styles from './QPayProReturnView.module.css';

export function QPayProReturnView() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <CheckoutPageHeader backTo="/checkout" backLabel="← Volver al checkout" title="Retorno QPayPro" />
                <QPayProReturn />
            </div>
        </main>
    );
}

export default QPayProReturnView;
