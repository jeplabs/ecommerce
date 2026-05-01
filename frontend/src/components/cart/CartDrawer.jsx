import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useState, useEffect } from "react";
import "./CartDrawer.css";

const MOCK_CART_ITEMS = [
    { id: 1, name: "RTX 4080 Super", price: 1050, qty: 1, image: "https://via.placeholder.com/60" },
    { id: 2, name: "Teclado Mecánico RGB", price: 120, qty: 2, image: "https://via.placeholder.com/60" },
];

export default function CartDrawer({ isOpen, onClose }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { 
        items, 
        cartCount, 
        cartTotal, 
        isEmpty, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart 
    } = useCart();
    
    const [cartItems, setCartItems] = useState(items);
    
    // Estados para controlar el ciclo de vida de la animación
    const [shouldRender, setShouldRender] = useState(isOpen); // Controla si el componente existe en el DOM
    const [isVisible, setIsVisible] = useState(isOpen);       // Controla si tiene la clase 'active'

    const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    //const isEmpty = items.length === 0;

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
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.name}</h4>
                                        <p className="cart-item-meta">
                                            {item.qty} x ${item.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <button className="cart-item-remove">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {!isEmpty && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span className="cart-total-amount">${total.toLocaleString()}</span>
                        </div>
                        
                        <div className="cart-actions">
                            <Link to="/carrito" className="btn-cart-secondary" onClick={handleClose}>
                                Ver carrito completo
                            </Link>
                            <button className="btn-cart-primary" onClick={handleCheckout}>
                                {isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión para Comprar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}