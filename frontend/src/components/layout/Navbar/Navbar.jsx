import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import useClickOutside from "../../../hooks/useClickOutside";
import LoginDropdown from "../../ui/Dropdown/LoginDropdown";
import CartDrawer from "../../cart/CartDrawer"; // Asegúrate que la ruta sea correcta
import "./Navbar.css";

export default function Navbar() {
    const { isAuthenticated, userRol, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    
    // Estado para el Login Dropdown
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Estado para el Carrito Drawer
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Hook para cerrar el login al hacer clic fuera
    const menuRef = useClickOutside(() => {
        setIsMenuOpen(false);
    });     
    
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);
    
    // Handlers para el carrito
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // Handlers para el carrito
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.searchQuery.value;
        if (query.trim()) {
            console.log("Buscando producto:", query);
            navigate(`/products?search=${query}`);
        }
    };

    return (
        <>
            <nav className="navbar">
                {/* Izquierda: Logo / Home */}
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo">JEPLabs</Link>
                </div>

                {/* Centro: Buscador */}
                <div className="navbar-center">
                    <form onSubmit={handleSearch} className="search-form">
                        <input 
                            type="text" 
                            name="searchQuery" 
                            placeholder="Buscar productos..." 
                            className="search-input"
                        />
                        <button type="submit" className="search-btn" aria-label="Buscar">
                            🔍
                        </button>
                    </form>
                </div>

                {/* Derecha: Autenticación, Roles y Carrito */}
                <div className="navbar-right">
                    {!isAuthenticated ? (
                        <div className="auth-links" ref={menuRef}>
                            {/* Botón Login */}
                            <button 
                                className="btn-login-trigger" 
                                onClick={toggleMenu}
                                aria-expanded={isMenuOpen}
                            >
                                Iniciar sesión
                            </button>
                            
                            {/* Login Dropdown */}
                            {isMenuOpen && (
                                <LoginDropdown onClose={closeMenu} />
                            )}
                            
                            {/* Botón Carrito (Icono o Texto) */}
                            <button 
                                className="btn-cart-trigger" 
                                onClick={toggleCart}
                                aria-label="Abrir carrito"
                            >
                                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '1.2rem' }}>
                                    shopping_cart
                                </span>
                                {cartCount > 0 && (
                                    <span className="cart-badge">{cartCount}</span>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="user-menu">
                            {userRol === 'ROLE_CUSTOMER' && (
                                <div className="auth-links">
                                    <Link to="/profile" className="btn-link">Perfil</Link>
                                    
                                    {/* Botón Carrito para Usuarios Logueados */}
                                    <button 
                                        className="btn-cart-trigger" 
                                        onClick={openCart}
                                        aria-label="Abrir carrito"
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--cat-text-muted)', display: 'flex', alignItems: 'center', position: 'relative' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                                            shopping_cart
                                        </span>
                                        {cartCount > 0 && (
                                            <span className="cart-badge">{cartCount}</span>
                                        )}
                                    </button>
                                </div>
                            )}
                            
                            {userRol === 'ROLE_ADMIN' && (
                                <Link to="/admin" className="btn-link">Admin</Link>
                            )}
                            
                            <button onClick={logout} className="btn-logout">
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Componente Carrito Drawer (Fuera del nav, al mismo nivel) */}
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
        </>
    );
}