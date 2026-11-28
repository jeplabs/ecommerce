import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth, useCart } from '@/app/providers';
import { useClickOutside } from '@/hooks';
import { LoginDropdown } from '@/features/auth';
import { CartDrawer } from '@/features/cart';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { isAuthenticated, userRol, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const isAtCatalogo = location.pathname === '/catalogo';

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const menuRef = useClickOutside<HTMLDivElement>(() => {
        setIsMenuOpen(false);
    });

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);
    const toggleCart = useCallback(() => setIsCartOpen((open) => !open), []);

    useEffect(() => {
        if (isAtCatalogo) {
            setSearchTerm(searchParams.get('search') || '');
        } else {
            setSearchTerm('');
        }
    }, [isAtCatalogo, searchParams]);

    // Ejecución de la búsqueda con debounce (400ms)
    useEffect(() => {
        const trimmed = searchTerm.trim();

        // Si el término en el input es idéntico al actual en la URL de catálogo, no hacer nada
        if (isAtCatalogo && (searchParams.get('search') || '') === trimmed) {
            return undefined;
        }

        // Si está vacío y no estamos en catálogo, no hacer nada
        if (!trimmed && !isAtCatalogo) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            if (trimmed) {
                // Siempre navega a /catalogo limpio con el nuevo término de búsqueda (búsqueda global)
                navigate(`/catalogo?search=${encodeURIComponent(trimmed)}`);
            } else if (isAtCatalogo) {
                // Si el usuario borra el texto estando en catálogo, remueve el parámetro search
                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete('search');
                navigate(`/catalogo${nextParams.toString() ? `?${nextParams.toString()}` : ''}`, { replace: true });
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, isAtCatalogo, searchParams, navigate]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const trimmed = searchTerm.trim();
            if (trimmed) {
                navigate(`/catalogo?search=${encodeURIComponent(trimmed)}`);
            }
        }
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.navbarLeft}>
                    <Link to="/" className={styles.navbarLogo}>
                        JEPLabs
                    </Link>
                </div>

                <div className={styles.navbarCenter}>
                    <div className={styles.searchForm}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Buscar productos, marcas, modelos o SKU..."
                            className={styles.searchInput}
                        />
                        <button type="button" className={styles.searchBtn} aria-label="Buscar" disabled>
                            🔍
                        </button>
                    </div>
                </div>

                <div className={styles.navbarRight}>
                    {!isAuthenticated ? (
                        <div className={styles.authLinks} ref={menuRef}>
                            <div className={styles.loginDropdownAnchor}>
                                <button
                                    type="button"
                                    className={styles.loginTrigger}
                                    onClick={toggleMenu}
                                    aria-expanded={isMenuOpen}
                                >
                                    Iniciar sesión
                                </button>

                                {isMenuOpen && <LoginDropdown onClose={closeMenu} />}
                            </div>

                            <button
                                type="button"
                                className={styles.cartTrigger}
                                onClick={toggleCart}
                                aria-label="Abrir carrito"
                            >
                                <span className={`material-symbols-outlined ${styles.materialIcon}`}>
                                    shopping_cart
                                </span>
                                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                            </button>
                        </div>
                    ) : (
                        <div className={styles.userMenu}>
                            {(userRol === 'ROLE_CUSTOMER' || userRol !== 'ROLE_ADMIN') && (
                                <div className={styles.authLinks}>
                                    <Link to="/profile" className={styles.btnLink}>
                                        Perfil
                                    </Link>

                                    <button
                                        type="button"
                                        className={styles.cartTrigger}
                                        onClick={openCart}
                                        aria-label="Abrir carrito"
                                    >
                                        <span
                                            className={`material-symbols-outlined ${styles.materialIcon}`}
                                            style={{ fontSize: '1.2rem' }}
                                        >
                                            shopping_cart
                                        </span>
                                        {cartCount > 0 && (
                                            <span className={styles.cartBadge}>{cartCount}</span>
                                        )}
                                    </button>
                                </div>
                            )}

                            {userRol === 'ROLE_ADMIN' && (
                                <Link to="/admin" className={styles.btnLink}>
                                    Admin
                                </Link>
                            )}

                            <button type="button" onClick={logout} className={styles.btnLogout}>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
        </>
    );
}
