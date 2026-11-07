import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth, useFavorites, useToast } from '@/app/providers';
import type { ProductApi } from '@/entities/product';
import styles from './FavoriteButton.module.css';

export interface FavoriteButtonProps {
    product: ProductApi;
    className?: string;
    activeClassName?: string;
}

export function FavoriteButton({ product, className, activeClassName }: FavoriteButtonProps) {
    const { isAuthenticated } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [toggling, setToggling] = useState(false);

    const favorito = isFavorite(product.id);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setToggling(true);
        try {
            const result = await toggleFavorite(product);
            if (result.success) {
                if (result.added) {
                    showSuccess(`${product.nombre} agregado a favoritos`);
                } else {
                    showError(`${product.nombre} eliminado de favoritos`);
                }
            } else if (!result.success && 'requiresAuth' in result) {
                navigate('/login');
            } else {
                showError(result.error);
            }
        } finally {
            setToggling(false);
        }
    };

    return (
        <button
            type="button"
            className={clsx(
                styles.favBtn,
                favorito && styles.favBtnActive,
                className,
                favorito && activeClassName
            )}
            onClick={handleToggle}
            disabled={toggling}
            aria-label={favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            aria-pressed={favorito}
        >
            <span className="material-symbols-outlined">
                {favorito ? 'favorite' : 'favorite_border'}
            </span>
        </button>
    );
}

export default FavoriteButton;
