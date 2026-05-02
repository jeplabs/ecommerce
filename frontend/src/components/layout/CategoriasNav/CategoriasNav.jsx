import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCategorias } from "../../../context/CategoriasContext";
import "./CategoriasNav.css";

const MegaMenuColumn = ({ cat }) => {
    const hijos = cat.subcategorias || [];
    if (hijos.length === 0) return null;

    return (
        <div className="mega-column">
            <Link to={`/categoria/${cat.id}`} className="mega-col-title">
                {cat.nombre}
            </Link>
            <ul className="mega-sub-list">
                {hijos.map((hijo) => (
                    <li key={hijo.id}>
                        <Link to={`/categoria/${hijo.id}`} className="mega-sub-link">
                            {hijo.nombre}
                        </Link>
                        {hijo.subcategorias && hijo.subcategorias.length > 0 && (
                            <ul className="mega-deep-list">
                                {hijo.subcategorias.map((nieto) => (
                                    <li key={nieto.id}>
                                        <Link to={`/categoria/${nieto.id}`}>{nieto.nombre}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CategoriasNav = () => {
    const { arbolCategorias, loading } = useCategorias();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Controlar scroll del body cuando el drawer está abierto
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen]);

    if (loading || !arbolCategorias || arbolCategorias.length === 0) return null;

    return (
        <>
            {/* DESKTOP NAV */}
            <div className="categorias-wrapper desktop-nav">
                <div className="categorias-container">
                    <ul className="categorias-lista">
                        {arbolCategorias.map((cat) => (
                            <li key={cat.id} className="cat-item">
                                <Link to={`/categoria/${cat.id}`} className="cat-link">
                                    {cat.nombre}
                                </Link>
                                
                                {/* El menú está ahora correctamente anidado dentro del LI */}
                                {cat.subcategorias && cat.subcategorias.length > 0 && (
                                    <div className="mega-panel">
                                        <div className="mega-panel-content">
                                            {cat.subcategorias.map((sub) => (
                                                <MegaMenuColumn key={sub.id} cat={sub} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* MÓVIL / TABLET */}
            <div className="mobile-trigger" onClick={() => setIsDrawerOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
                <span>Ver Categorías</span>
            </div>

            <div className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
            <div className={`drawer-menu ${isDrawerOpen ? 'active' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-title">Categorías</span>
                    <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="drawer-content">
                    <ul className="drawer-list">
                        {arbolCategorias.map((cat) => (
                            <DrawerItem key={cat.id} cat={cat} onClose={() => setIsDrawerOpen(false)} />
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

const DrawerItem = ({ cat, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hijos = cat.subcategorias || [];

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    return (
        <li className="drawer-item">
            <div className="drawer-row" onClick={() => setIsOpen(!isOpen)}>
                <Link to={`/categoria/${cat.id}`} className="drawer-link" onClick={handleLinkClick}>
                    {cat.nombre}
                </Link>
                {hijos.length > 0 && (
                    <button className="drawer-toggle">
                        <span className={`material-symbols-outlined ${isOpen ? 'rotated' : ''}`}>
                            {isOpen ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                )}
            </div>
            {hijos.length > 0 && (
                <ul className={`drawer-sub ${isOpen ? 'open' : ''}`}>
                    {hijos.map((hijo) => (
                        <DrawerItem key={hijo.id} cat={hijo} onClose={onClose} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default CategoriasNav;