import { useCategorias } from '@/app/providers';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryApi } from '@/entities/category';
import './CategoriasNav.css';

const buildCategoryPath = (parentPath: string, categoria: CategoryApi): string =>
    `${parentPath}/${categoria.slug || categoria.id}`;

type MegaMenuColumnProps = {
    cat: CategoryApi;
    parentPath: string;
};

const MegaMenuColumn = ({ cat, parentPath }: MegaMenuColumnProps) => {
    const hijos = cat.subcategorias || [];
    if (hijos.length === 0) return null;

    const currentPath = buildCategoryPath(parentPath, cat);

    return (
        <div className="mega-column">
            <Link to={currentPath} className="mega-col-title">
                {cat.nombre}
            </Link>
            <ul className="mega-sub-list">
                {hijos.map((hijo) => (
                    <li key={hijo.id}>
                        <Link to={buildCategoryPath(currentPath, hijo)} className="mega-sub-link">
                            {hijo.nombre}
                        </Link>
                        {hijo.subcategorias && hijo.subcategorias.length > 0 && (
                            <ul className="mega-deep-list">
                                {hijo.subcategorias.map((nieto) => (
                                    <li key={nieto.id}>
                                        <Link
                                            to={buildCategoryPath(
                                                buildCategoryPath(currentPath, hijo),
                                                nieto
                                            )}
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

type DrawerItemProps = {
    cat: CategoryApi;
    parentPath: string;
    onClose?: () => void;
};

const DrawerItem = ({ cat, parentPath, onClose }: DrawerItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const hijos = cat.subcategorias || [];
    const currentPath = buildCategoryPath(parentPath, cat);

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    return (
        <li className="drawer-item">
            <div className="drawer-row" onClick={() => setIsOpen(!isOpen)}>
                <Link to={currentPath} className="drawer-link" onClick={handleLinkClick}>
                    {cat.nombre}
                </Link>
                {hijos.length > 0 && (
                    <button type="button" className="drawer-toggle">
                        <span className={`material-symbols-outlined ${isOpen ? 'rotated' : ''}`}>
                            {isOpen ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                )}
            </div>
            {hijos.length > 0 && (
                <ul className={`drawer-sub ${isOpen ? 'open' : ''}`}>
                    {hijos.map((hijo) => (
                        <DrawerItem key={hijo.id} cat={hijo} parentPath={currentPath} onClose={onClose} />
                    ))}
                </ul>
            )}
        </li>
    );
};

const CategoriasNav = () => {
    const { arbolCategorias, loading } = useCategorias();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        if (isDrawerOpen) {
            const scrollY = window.scrollY;

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
                window.scrollTo(0, scrollY);
            };
        }

        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        return undefined;
    }, [isDrawerOpen]);

    if (loading || !arbolCategorias || arbolCategorias.length === 0) return null;

    return (
        <>
            <div className="categorias-wrapper desktop-nav">
                <div className="categorias-container">
                    <ul className="categorias-lista">
                        {arbolCategorias.map((cat) => (
                            <li key={cat.id} className="cat-item">
                                <Link to={`/categoria/${cat.slug || cat.id}`} className="cat-link">
                                    {cat.nombre}
                                </Link>

                                {cat.subcategorias && cat.subcategorias.length > 0 && (
                                    <div className="mega-panel">
                                        <div className="mega-panel-content">
                                            {cat.subcategorias.map((sub) => (
                                                <MegaMenuColumn
                                                    key={sub.id}
                                                    cat={sub}
                                                    parentPath={`/categoria/${cat.slug || cat.id}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mobile-trigger" onClick={() => setIsDrawerOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
                <span>Ver Categorías</span>
            </div>

            <div
                className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`}
                onClick={() => setIsDrawerOpen(false)}
            />
            <div className={`drawer-menu ${isDrawerOpen ? 'active' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-title">Categorías</span>
                    <button
                        type="button"
                        className="drawer-close"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="drawer-content">
                    <ul className="drawer-list">
                        {arbolCategorias.map((cat) => (
                            <DrawerItem
                                key={cat.id}
                                cat={cat}
                                parentPath="/categoria"
                                onClose={() => setIsDrawerOpen(false)}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default CategoriasNav;
