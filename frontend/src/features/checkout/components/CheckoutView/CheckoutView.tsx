import { CheckoutProvider } from '@/app/providers';
import CheckoutContent from '../CheckoutContent/CheckoutContent';
import styles from './CheckoutView.module.css';

export function CheckoutView() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <CheckoutProvider>
                    <CheckoutContent />
                </CheckoutProvider>
            </div>
        </main>
    );
}

export default CheckoutView;
