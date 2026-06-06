import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

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
        <nav
            className={className ? `${className} pd-breadcrumbs` : 'pd-breadcrumbs'}
            aria-label="Ruta de navegación"
        >
            {items.map((crumb, index) => {
                const isLast = index === items.length - 1;
                return (
                    <div key={index} className="bc-item">
                        {!isLast ? (
                            <>
                                <Link to={crumb.path ?? ''} className="bc-link">
                                    {crumb.label}
                                </Link>
                                <span className="bc-separator"> /</span>
                            </>
                        ) : (
                            <span className="bc-current" aria-current="page">
                                {crumb.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
