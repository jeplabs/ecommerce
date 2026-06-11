import { useAuth, useCart, useToast } from '@/app/providers';
import { Button } from '@/shared/ui/Button';
import buttonStyles from '@/shared/ui/Button/Button.module.css';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './CartDrawer.module.css';

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
        <div className={styles.shell}>
            <div
                className={clsx(styles.overlay, isVisible && styles.overlayActive)}
                onClick={handleClose}
            />

            <div className={clsx(styles.drawer, isVisible && styles.drawerActive)}>
                <div className={styles.header}>
                    <h2>Tu Carrito</h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={handleClose}
                        aria-label="Cerrar carrito"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className={styles.body}>
                    {isEmpty ? (
                        <div className={styles.emptyState}>
                            <span className={clsx('material-symbols-outlined', styles.emptyIcon)}>
                                shopping_cart
                            </span>
                            <p>Tu carrito está vacío</p>
                            <Link
                                to="/catalogo"
                                className={clsx(
                                    buttonStyles.button,
                                    buttonStyles.outlinePrimary,
                                    styles.browseLink
                                )}
                                onClick={handleClose}
                            >
                                Ver productos
                            </Link>
                        </div>
                    ) : (
                        <ul className={styles.itemsList}>
                            {items.map((item) => (
                                <li key={item.id} className={styles.item}>
                                    <div className={styles.itemDetails}>
                                        <h4 className={styles.itemName}>{item.name}</h4>
                                        <p className={styles.itemMeta}>
                                            {item.quantity} x $
                                            {item.price.toLocaleString('es-ES', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className={styles.itemSubtotal}>
                                            Subtotal: $
                                            {(item.price * item.quantity).toLocaleString('es-ES', {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>
                                    <div className={styles.itemControls}>
                                        <div className={styles.itemActions}>
                                            <button
                                                type="button"
                                                className={styles.qtyBtn}
                                                onClick={() =>
                                                    handleUpdateQuantity(item.id, item.quantity - 1)
                                                }
                                                disabled={loading}
                                                aria-label="Disminuir cantidad"
                                            >
                                                −
                                            </button>
                                            <span className={styles.qty}>{item.quantity}</span>
                                            <button
                                                type="button"
                                                className={styles.qtyBtn}
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
                                            type="button"
                                            className={styles.removeBtn}
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
                    <div className={styles.footer}>
                        <div className={styles.total}>
                            <span>Total</span>
                            <span className={styles.totalAmount}>
                                $
                                {cartTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className={styles.actions}>
                            <Link
                                to="/cart"
                                className={clsx(buttonStyles.button, buttonStyles.secondary)}
                                onClick={handleClose}
                            >
                                Ver carrito completo
                            </Link>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {isAuthenticated
                                    ? 'Proceder al Pago'
                                    : 'Iniciar Sesión para Comprar'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
