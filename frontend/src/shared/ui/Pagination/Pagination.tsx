import React from 'react';
import styles from './Pagination.module.css';

export type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    scrollToTop?: boolean;
    className?: string;
};

function performScrollToTop() {
    if (typeof window === 'undefined') return;
    try {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
        window.scrollTo(0, 0);
    }
    if (document.documentElement) {
        document.documentElement.scrollTop = 0;
    }
    if (document.body) {
        document.body.scrollTop = 0;
    }
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    scrollToTop = true,
    className = '',
}) => {
    if (totalPages <= 1) {
        return null;
    }

    const handlePageClick = (page: number) => {
        if (page === currentPage || page < 1 || page > totalPages) return;
        onPageChange(page);
        if (scrollToTop) {
            requestAnimationFrame(() => {
                performScrollToTop();
            });
        }
    };

    const getPageNumbers = (): (number | string)[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [
                1,
                '...',
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pages = getPageNumbers();

    return (
        <nav
            className={`${styles.pagination} ${className}`.trim()}
            aria-label="Paginación de resultados"
        >
            <button
                type="button"
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Ir a la página anterior"
            >
                &laquo;
            </button>

            <ul className={styles.pageList}>
                {pages.map((page, index) => {
                    if (typeof page === 'string') {
                        return (
                            <li key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
                                &hellip;
                            </li>
                        );
                    }

                    const isCurrent = page === currentPage;
                    return (
                        <li key={page}>
                            <button
                                type="button"
                                className={`${styles.pageButton} ${isCurrent ? styles.active : ''}`.trim()}
                                onClick={() => handlePageClick(page)}
                                aria-current={isCurrent ? 'page' : undefined}
                                aria-label={`Página ${page}`}
                            >
                                {page}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <button
                type="button"
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Ir a la página siguiente"
            >
                &raquo;
            </button>
        </nav>
    );
};
