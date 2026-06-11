import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth, useCart } from '@/app/providers';
import useClickOutside from '@/shared/lib/useClickOutside';
import LoginDropdown from '@/shared/ui/Dropdown/LoginDropdown';
import CartDrawer from '@/widgets/cart/CartDrawer';
import styles from './Navbar.module.css';

/** Rutas donde el buscador sincroniza ?search= con la URL del catálogo. */
function isCatalogSearchPath(pathname: string): boolean {
    return pathname === '/catalogo' || pathname.startsWith('/categoria');
}

export default function Navbar() {
    const { isAuthenticated, userRol, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const isCatalogSearch = isCatalogSearchPath(location.pathname);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const menuRef = useClickOutside<HTMLDivElement>(() => {
        setIsMenuOpen(false);
    });

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    useEffect(() => {
        if (isCatalogSearch) {
            setSearchTerm(searchParams.get('search') || '');
        } else {
            setSearchTerm('');
        }
    }, [isCatalogSearch, searchParams]);

    const updateSearchParams = useCallback(
        (query: string) => {
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
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
                            placeholder="Buscar productos..."
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
                            {userRol === 'ROLE_CUSTOMER' && (
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
