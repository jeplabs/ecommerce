import { useNavigate } from 'react-router-dom';
import CartView from '@/widgets/cart/CartView';
import '@/widgets/cart/CartView.css';

export function CartPage() {
    const navigate = useNavigate();

    return (
        <main className="cart-page">
            <CartView onProceedToCheckout={() => navigate('/checkout')} />
        </main>
    );
}

export default CartPage;
