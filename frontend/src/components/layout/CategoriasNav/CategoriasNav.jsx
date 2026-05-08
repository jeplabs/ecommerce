import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useCategorias } from "../../../context/CategoriasContext";
import "./CategoriasNav.css";

const buildCategoryPath = (parentPath, categoria) => `${parentPath}/${categoria.slug || categoria.id}`;

const MegaMenuColumn = ({ cat, parentPath, onCategoryClick }) => {
    const hijos = cat.subcategorias || [];
    if (hijos.length === 0) return null;

    const currentPath = buildCategoryPath(parentPath, cat);

    return (
        <div className="mega-column">
            <Link 
                to={currentPath} 
                className="mega-col-title"
                onClick={(e) => onCategoryClick && onCategoryClick(cat.id, e)}
            >
                {cat.nombre}
            </Link>
            <ul className="mega-sub-list">
                {hijos.map((hijo) => (
                    <li key={hijo.id}>
                        <Link 
                            to={buildCategoryPath(currentPath, hijo)} 
                            className="mega-sub-link"
                            onClick={(e) => onCategoryClick && onCategoryClick(hijo.id, e)}
                        >
                            {hijo.nombre}
                        </Link>
                        {hijo.subcategorias && hijo.subcategorias.length > 0 && (
                            <ul className="mega-deep-list">
                                {hijo.subcategorias.map((nieto) => (
                                    <li key={nieto.id}>
                                        <Link 
                                            to={buildCategoryPath(buildCategoryPath(currentPath, hijo), nieto)}
                                            onClick={(e) => onCategoryClick && onCategoryClick(nieto.id, e)}
                                        >
                                            {nieto.nombre}
                                        </Link>
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
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleCategoryClick = (categoriaId, e) => {
        if (location.pathname === '/catalogo') {
            // Si estamos en catálogo, actualizar params para filtrar
            e.preventDefault();
            const newParams = new URLSearchParams(searchParams);
            newParams.set('categoriaId', categoriaId);
            // Limpiar otros filtros si cambiamos categoría
            newParams.delete('search');
            setSearchParams(newParams);
        } else {
            // Si no estamos en catálogo, navegar normalmente (el Link se encarga)
        }
    };

    // Controlar scroll del body cuando el drawer está abierto
    useEffect(() => {
        if (isDrawerOpen) {
            // Guardar posición actual de scroll
            const scrollY = window.scrollY;
            
            // Hacer scroll al top
            window.scrollTo(0, 0);
            
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollY}px`;
            
            return () => {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                // Restaurar la posición de scroll anterior
                window.scrollTo(0, scrollY);
            };
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
        }
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
                                <Link 
                                    to={`/categoria/${cat.slug || cat.id}`} 
                                    className="cat-link"
                                    onClick={(e) => handleCategoryClick(cat.id, e)}
                                >
                                    {cat.nombre}
                                </Link>
                                
                                {/* El menú está ahora correctamente anidado dentro del LI */}
                                {cat.subcategorias && cat.subcategorias.length > 0 && (
                                    <div className="mega-panel">
                                        <div className="mega-panel-content">
                                            {cat.subcategorias.map((sub) => (
                                                <MegaMenuColumn key={sub.id} cat={sub} parentPath={`/categoria/${cat.slug || cat.id}`} onCategoryClick={handleCategoryClick} />
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
                            <DrawerItem key={cat.id} cat={cat} parentPath="/categoria" onClose={() => setIsDrawerOpen(false)} onCategoryClick={handleCategoryClick} />
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

const DrawerItem = ({ cat, parentPath, onClose, onCategoryClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hijos = cat.subcategorias || [];
    const currentPath = buildCategoryPath(parentPath, cat);

    const handleLinkClick = (e) => {
        if (onCategoryClick) {
            onCategoryClick(cat.id, e);
        }
        if (onClose) onClose();
    };

    return (
        <li className="drawer-item">
            <div className="drawer-row" onClick={() => setIsOpen(!isOpen)}>
                <Link to={currentPath} className="drawer-link" onClick={handleLinkClick}>
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
                        <DrawerItem key={hijo.id} cat={hijo} parentPath={currentPath} onClose={onClose} onCategoryClick={onCategoryClick} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default CategoriasNav;