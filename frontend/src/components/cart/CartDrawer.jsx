import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useState, useEffect } from "react";
import "./CartDrawer.css";

export default function CartDrawer({ isOpen, onClose }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { 
        items, 
        cartCount, 
        cartTotal, 
        isEmpty, 
        loading,
        updateQuantity, 
        removeFromCart
    } = useCart();
    
    // Estados para controlar el ciclo de vida de la animación
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(isOpen);

    // Lógica maestra de sincronización
    useEffect(() => {
        if (isOpen) {
            // --- AL ABRIR ---
            // 1. Primero renderizamos el componente (shouldRender = true)
            setShouldRender(true);
            
            // 2. Pequeño retraso (20ms) para permitir que el navegador pinte el estado inicial (sin clase active)
            // Esto fuerza a que la transición CSS se active al añadir la clase.
            const timer = setTimeout(() => {
                setIsVisible(true); // Añade la clase 'active' -> Anima entrada
            }, 20);
            
            return () => clearTimeout(timer);

        } else {
            // --- AL CERRAR ---
            // 1. Quitamos la clase 'active' inmediatamente -> Anima salida
            setIsVisible(false);
            
            // 2. Esperamos a que termine la animación (300ms) antes de eliminar del DOM
            const timer = setTimeout(() => {
                setShouldRender(false);
                onClose(); // Avisar al padre
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    const handleClose = () => {
        onClose();
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            handleClose();
            navigate("/login");
        } else {
            alert("Redirigiendo a pasarela de pago...");
            handleClose();
        }
    };

    // Cerrar con ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && isOpen) handleClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <>
            {/* Overlay: Usa isVisible para la opacidad */}
            <div 
                className={`cart-overlay ${isVisible ? 'active' : ''}`} 
                onClick={handleClose}
            ></div>

            {/* Panel: Usa isVisible para la posición (right) */}
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
                                            {item.quantity} x ${item.price.toLocaleString('es-ES', {minimumFractionDigits: 2})}
                                        </p>
                                        <p className="cart-item-subtotal">
                                            Subtotal: ${(item.price * item.quantity).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                                        </p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="cart-item-actions">
                                            <button 
                                                className="cart-item-qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={loading}
                                                aria-label="Disminuir cantidad"
                                            >
                                                −
                                            </button>
                                            <span className="cart-item-qty">{item.quantity}</span>
                                            <button 
                                                className="cart-item-qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={loading}
                                                aria-label="Aumentar cantidad"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            className="cart-item-remove"
                                            onClick={() => removeFromCart(item.id)}
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
                            <span className="cart-total-amount">${cartTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
                        </div>
                        
                        <div className="cart-actions">
                            <Link to="/carrito" className="btn-cart-secondary" onClick={handleClose}>
                                Ver carrito completo
                            </Link>
                            <button className="btn-cart-primary" onClick={handleCheckout} disabled={loading}>
                                {isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión para Comprar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}