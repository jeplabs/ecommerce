import clsx from 'clsx';
import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export type CategoryBreadcrumbItem = {
    label: string;
    path?: string | null;
};

type BreadcrumbsProps = {
    items: CategoryBreadcrumbItem[];
    className?: string;
};

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    if (!items || items.length === 0) return null;

    return (
        <nav className={clsx(styles.breadcrumbs, className)} aria-label="Ruta de navegación">
            {items.map((crumb, index) => {
                const isLast = index === items.length - 1;
                return (
                    <div key={index} className={styles.item}>
                        {!isLast ? (
                            <>
                                <Link to={crumb.path ?? ''} className={styles.link}>
                                    {crumb.label}
                                </Link>
                                <span className={styles.separator}> /</span>
                            </>
                        ) : (
                            <span className={styles.current} aria-current="page">
                                {crumb.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
