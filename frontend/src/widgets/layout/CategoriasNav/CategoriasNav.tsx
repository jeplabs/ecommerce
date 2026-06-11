import { useCategorias } from '@/app/providers';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryApi } from '@/entities/category';
import styles from './CategoriasNav.module.css';

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
        <div className={styles.megaColumn}>
            <Link to={currentPath} className={styles.megaColTitle}>
                {cat.nombre}
            </Link>
            <ul className={styles.megaSubList}>
                {hijos.map((hijo) => (
                    <li key={hijo.id}>
                        <Link to={buildCategoryPath(currentPath, hijo)} className={styles.megaSubLink}>
                            {hijo.nombre}
                        </Link>
                        {hijo.subcategorias && hijo.subcategorias.length > 0 && (
                            <ul className={styles.megaDeepList}>
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
        <li className={styles.drawerItem}>
            <div className={styles.drawerRow} onClick={() => setIsOpen(!isOpen)}>
                <Link to={currentPath} className={styles.drawerLink} onClick={handleLinkClick}>
                    {cat.nombre}
                </Link>
                {hijos.length > 0 && (
                    <button type="button" className={styles.drawerToggle}>
                        <span
                            className={clsx(
                                'material-symbols-outlined',
                                styles.toggleIcon,
                                isOpen && styles.toggleIconRotated
                            )}
                        >
                            {isOpen ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                )}
            </div>
            {hijos.length > 0 && (
                <ul className={clsx(styles.drawerSub, isOpen && styles.drawerSubOpen)}>
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
        <div className={styles.root}>
            <div className={styles.desktopNav}>
                <div className={styles.categoriasContainer}>
                    <ul className={styles.categoriasLista}>
                        {arbolCategorias.map((cat) => (
                            <li key={cat.id} className={styles.catItem}>
                                <Link to={`/categoria/${cat.slug || cat.id}`} className={styles.catLink}>
                                    {cat.nombre}
                                </Link>

                                {cat.subcategorias && cat.subcategorias.length > 0 && (
                                    <div className={styles.megaPanel}>
                                        <div className={styles.megaPanelContent}>
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

            <div className={styles.mobileTrigger} onClick={() => setIsDrawerOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
                <span>Ver Categorías</span>
            </div>

            <div
                className={clsx(styles.drawerOverlay, isDrawerOpen && styles.drawerOverlayActive)}
                onClick={() => setIsDrawerOpen(false)}
            />
            <div className={clsx(styles.drawerMenu, isDrawerOpen && styles.drawerMenuActive)}>
                <div className={styles.drawerHeader}>
                    <span className={styles.drawerTitle}>Categorías</span>
                    <button
                        type="button"
                        className={styles.drawerClose}
                        onClick={() => setIsDrawerOpen(false)}
                        aria-label="Cerrar menú de categorías"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className={styles.drawerContent}>
                    <ul className={styles.drawerList}>
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
        </div>
    );
};

export default CategoriasNav;
