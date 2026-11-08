import { useNavigate } from 'react-router-dom';
import { CartView } from '@/features/cart';
import styles from '@/features/cart/components/CartView/CartView.module.css';

export function CartPage() {
    const navigate = useNavigate();

    return (
        <main className={styles.page}>
            <CartView onProceedToCheckout={() => navigate('/checkout')} />
        </main>
    );
}

export default CartPage;
