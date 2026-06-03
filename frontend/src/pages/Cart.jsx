import { useMemo } from "react";
import Navbar from "../components/layout/Navbar/Navbar";
import Footer from "../components/layout/Footer/Footer";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
    const navigate = useNavigate();
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
                            <div className="cart-table" role="table" aria-label="Productos en el carrito">
                                <div className="cart-table__header" role="row">
                                    <span role="columnheader">Producto</span>
                                    <span role="columnheader">Cantidad</span>
                                    <span role="columnheader">Subtotal</span>
                                    <span role="columnheader">Acción</span>
                                </div>
                                {items.map((item) => {
                                    const subtotalFormatted = (item.price * item.quantity).toLocaleString(
                                        'es-ES',
                                        { minimumFractionDigits: 2 }
                                    );
                                    return (
                                        <article key={item.id} className="cart-table__row" role="row">
                                            <div className="cart-item__info" role="cell">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.altText || item.name}
                                                        className="cart-item__thumb"
                                                    />
                                                ) : (
                                                    <div className="cart-item__thumb-placeholder">Sin imagen</div>
                                                )}
                                                <div className="cart-item__meta">
                                                    <p className="cart-item__name">{item.name}</p>
                                                    <p className="cart-item__price">
                                                        ${item.price.toLocaleString('es-ES', {
                                                            minimumFractionDigits: 2,
                                                        })}{' '}
                                                        <span className="cart-item__price-unit">c/u</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className="cart-item__qty"
                                                role="cell"
                                                data-label="Cantidad"
                                            >
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    aria-label="Disminuir cantidad"
                                                    onClick={() =>
                                                        handleQuantityChange(item.id, item.quantity - 1)
                                                    }
                                                    disabled={loading || item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <span className="cart-item__qty-value" aria-live="polite">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    aria-label="Aumentar cantidad"
                                                    onClick={() =>
                                                        handleQuantityChange(item.id, item.quantity + 1)
                                                    }
                                                    disabled={loading}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div
                                                className="cart-item__subtotal"
                                                role="cell"
                                                data-label="Subtotal"
                                            >
                                                ${subtotalFormatted}
                                            </div>
                                            <div
                                                className="cart-item__actions"
                                                role="cell"
                                                data-label="Acción"
                                            >
                                                <button
                                                    type="button"
                                                    className="btn-remove-item"
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={loading}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
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
                                    <button
                                        type="button"
                                        className="btn-checkout"
                                        disabled={loading}
                                        onClick={() => navigate('/checkout')}
                                    >
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