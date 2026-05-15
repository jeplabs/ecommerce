import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar/Navbar';
import Footer from '../components/layout/Footer/Footer';
import { CheckoutProvider } from '../context/CheckoutContext';
import CheckoutContent from '../components/checkout/CheckoutContent/CheckoutContent';
import './Checkout.css';

export default function Checkout() {
    return (
        <>
            <Navbar />
            <main className="checkout-page">
                <div className="checkout-page__inner">
                    <header className="checkout-page__header">
                        <Link to="/cart" className="checkout-page__back">
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
            <Footer />
        </>
    );
}
