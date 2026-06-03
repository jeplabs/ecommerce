import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth, useCart } from '@/app/providers';
import useClickOutside from '@/shared/lib/useClickOutside';
import LoginDropdown from '@/shared/ui/Dropdown/LoginDropdown';
import CartDrawer from '@/widgets/cart/CartDrawer';
import "./Navbar.css";

/** Rutas donde el buscador sincroniza ?search= con la URL del catálogo. */
function isCatalogSearchPath(pathname) {
    return pathname === '/catalogo' || pathname.startsWith('/categoria');
}

export default function Navbar() {
    const { isAuthenticated, userRol, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const isCatalogSearch = isCatalogSearchPath(location.pathname);
    
    // Estado para el Login Dropdown
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Estado para el Carrito Drawer
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Estado para búsqueda
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

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

    // Sincronizar input con la URL en catálogo; al salir, vaciar para no disparar búsqueda fantasma
    useEffect(() => {
        if (isCatalogSearch) {
            setSearchTerm(searchParams.get('search') || '');
        } else {
            setSearchTerm('');
        }
    }, [isCatalogSearch, searchParams]);

    const updateSearchParams = useCallback(
        (query) => {
            const trimmed = query.trim();
            const newParams = new URLSearchParams(searchParams);
            if (trimmed) {
                newParams.set('search', trimmed);
            } else {
                newParams.delete('search');
            }
            setSearchParams(newParams, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    // Búsqueda desde otras rutas (p. ej. ficha de producto) → catálogo, sin tocar la URL actual
    useEffect(() => {
        if (isCatalogSearch || !searchTerm.trim()) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            navigate(`/catalogo?search=${encodeURIComponent(searchTerm.trim())}`);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, isCatalogSearch, navigate]);

    useEffect(() => {
        if (!isCatalogSearch) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            updateSearchParams(searchTerm);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, updateSearchParams, isCatalogSearch]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
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
                    <div className="search-form">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Buscar productos..." 
                            className="search-input"
                        />
                        <button type="button" className="search-btn" aria-label="Buscar" disabled>
                            🔍
                        </button>
                    </div>
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