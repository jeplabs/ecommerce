import { useAuth, useCart, useToast } from '@/app/providers';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CartDrawer.css';

type CartDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { isAuthenticated } = useAuth();
    const { showError } = useToast();
    const navigate = useNavigate();

    const {
        items,
        cartTotal,
        isEmpty,
        loading,
        updateQuantity,
        removeFromCart,
    } = useCart();

    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);

            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 20);

            return () => clearTimeout(timer);
        }

        setIsVisible(false);

        const timer = setTimeout(() => {
            setShouldRender(false);
            onClose();
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen, onClose]);

    const handleClose = () => {
        onClose();
    };

    const handleCheckout = () => {
        handleClose();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/checkout' } });
        } else {
            navigate('/checkout');
        }
    };

    const handleRemove = async (itemId: number) => {
        const result = await removeFromCart(itemId);
        if (result.success) {
            showError('Producto eliminado del carrito');
        } else {
            showError(result.error || 'Error al eliminar producto');
        }
    };

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        const result = await updateQuantity(itemId, quantity);
        if (!result.success) {
            showError(result.error || 'Error al actualizar cantidad');
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <>
            <div
                className={`cart-overlay ${isVisible ? 'active' : ''}`}
                onClick={handleClose}
            />

            <div className={`cart-drawer ${isVisible ? 'active' : ''}`}>
                <div className="cart-header">
                    <h2>Tu Carrito</h2>
                    <button className="cart-close-btn" onClick={handleClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="cart-body">
                    {isEmpty ? (
                        <div className="cart-empty-state">
                            <span className="material-symbols-outlined empty-icon">shopping_cart</span>
                            <p>Tu carrito está vacío</p>
                            <Link to="/catalogo" className="btn-browse" onClick={handleClose}>
                                Ver productos
                            </Link>
                        </div>
                    ) : (
                        <ul className="cart-items-list">
                            {items.map((item) => (
                                <li key={item.id} className="cart-item">
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.name}</h4>
                                        <p className="cart-item-meta">
                                            {item.quantity} x $
                                            {item.price.toLocaleString('es-ES', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className="cart-item-subtotal">
                                            Subtotal: $
                                            {(item.price * item.quantity).toLocaleString('es-ES', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="cart-item-actions">
                                            <button
                                                className="cart-item-qty-btn"
                                                onClick={() =>
                                                    handleUpdateQuantity(item.id, item.quantity - 1)
                                                }
                                                disabled={loading}
                                                aria-label="Disminuir cantidad"
                                            >
                                                −
                                            </button>
                                            <span className="cart-item-qty">{item.quantity}</span>
                                            <button
                                                className="cart-item-qty-btn"
                                                onClick={() =>
                                                    handleUpdateQuantity(item.id, item.quantity + 1)
                                                }
                                                disabled={loading}
                                                aria-label="Aumentar cantidad"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => handleRemove(item.id)}
                                            disabled={loading}
                                            title="Eliminar del carrito"
                                            aria-label="Eliminar producto"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {!isEmpty && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span className="cart-total-amount">
                                $
                                {cartTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="cart-actions">
                            <Link to="/cart" className="btn-cart-secondary" onClick={handleClose}>
                                Ver carrito completo
                            </Link>
                            <button
                                className="btn-cart-primary"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {isAuthenticated
                                    ? 'Proceder al Pago'
                                    : 'Iniciar Sesión para Comprar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
