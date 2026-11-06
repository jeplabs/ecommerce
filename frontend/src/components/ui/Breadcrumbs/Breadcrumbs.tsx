import clsx from 'clsx';
import { Fragment } from 'react';
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
                    <Fragment key={index}>
                        {index > 0 && (
                            <span className={styles.separator} aria-hidden="true">
                                /
                            </span>
                        )}
                        {!isLast ? (
                            <Link to={crumb.path ?? ''} className={styles.link}>
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className={styles.current} aria-current="page">
                                {crumb.label}
                            </span>
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}
