import { CheckoutProvider } from '@/app/providers';
import { Link } from 'react-router-dom';
import CheckoutContent from '@/features/checkout/ui/CheckoutContent/CheckoutContent';
import styles from '@/widgets/checkout/checkoutPage.module.css';

export function CheckoutPage() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <header className={styles.header}>
                    <Link to="/cart" className={styles.back}>
                        ← Volver al carrito
                    </Link>
                    <h1>Checkout</h1>
                    <p>Completa tu compra de forma segura</p>
                </header>

                <CheckoutProvider>
                    <CheckoutContent />
                </CheckoutProvider>
            </div>
        </main>
    );
}

export default CheckoutPage;
