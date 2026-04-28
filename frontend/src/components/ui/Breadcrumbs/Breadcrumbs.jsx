import { Link } from "react-router-dom";
import "./Breadcrumbs.css";

export default function Breadcrumbs({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <nav className="pd-breadcrumbs" aria-label="Ruta de navegación">
            {items.map((crumb, index) => {
                const isLast = index === items.length - 1;
                return (
                    <div key={index} className="bc-item">
                        {!isLast ? (
                            <>
                                <Link to={crumb.path} className="bc-link">
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