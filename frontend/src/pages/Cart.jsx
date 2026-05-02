import { useMemo } from "react";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/layout/Footer/Footer";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Link } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
    const { items, cartTotal, loading, updateQuantity, removeFromCart, clearCart, isEmpty } = useCart();
    const { showSuccess, showError } = useToast();

    const handleQuantityChange = async (itemId, quantity) => {
        const result = await updateQuantity(itemId, quantity);
        if (result.success) {
            showSuccess('Cantidad actualizada');
        } else {
            showError(result.error || 'Error al actualizar cantidad');
        }
    };

    const handleRemove = async (itemId) => {
        const result = await removeFromCart(itemId);
        if (result.success) {
            showError('Producto eliminado del carrito');
        } else {
            showError(result.error || 'Error al eliminar producto');
        }
    };

    const handleClear = async () => {
        const result = await clearCart();
        if (result.success) {
            showSuccess('Carrito limpiado');
        } else {
            showError(result.error || 'Error al limpiar el carrito');
        }
    };

    const totalDisplay = useMemo(() => {
        return cartTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 });
    }, [cartTotal]);

    return (
        <>
            <Navbar />
            <main className="cart-page">
                <section className="cart-page__content">
                    <h1>Mi Carrito</h1>

                    {isEmpty ? (
                        <div className="cart-empty">
                            <p>Tu carrito está vacío.</p>
                            <Link to="/catalogo" className="btn-go-to-catalog">Ver productos</Link>
                        </div>
                    ) : (
                        <>
                            <div className="cart-table">
                                <div className="cart-table__header">
                                    <span>Producto</span>
                                    <span>Cantidad</span>
                                    <span>Subtotal</span>
                                    <span>Acción</span>
                                </div>
                                {items.map((item) => (
                                    <div key={item.id} className="cart-table__row">
                                        <div className="cart-item__info">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.altText || item.name} className="cart-item__thumb" />
                                            ) : (
                                                <div className="cart-item__thumb-placeholder">Sin imagen</div>
                                            )}
                                            <div className="cart-item__meta">
                                                <p className="cart-item__name">{item.name}</p>
                                                <p className="cart-item__price">${item.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                        <div className="cart-item__qty">
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={loading || item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                disabled={loading}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item__subtotal">
                                            ${ (item.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }
                                        </div>
                                        <button
                                            className="btn-remove-item"
                                            onClick={() => handleRemove(item.id)}
                                            disabled={loading}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-summary">
                                <div>
                                    <span>Total</span>
                                    <strong>${totalDisplay}</strong>
                                </div>
                                <div className="cart-summary__actions">
                                    <button className="btn-clear-cart" onClick={handleClear} disabled={loading}>
                                        Vaciar carrito
                                    </button>
                                    <button className="btn-checkout" disabled={loading}>
                                        Proceder al pago
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}