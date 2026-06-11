import { useNavigate } from 'react-router-dom';
import CartView from '@/widgets/cart/CartView';
import styles from '@/widgets/cart/CartView.module.css';

export function CartPage() {
    const navigate = useNavigate();

    return (
        <main className={styles.page}>
            <CartView onProceedToCheckout={() => navigate('/checkout')} />
        </main>
    );
}

export default CartPage;
