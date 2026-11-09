import clsx from 'clsx';
import { ProductImage } from '@/shared/ui/ProductImage';
import { SoldOutBadge } from '@/shared/ui/SoldOutBadge/SoldOutBadge';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { formatCurrency } from '@/utils/format';
import type { ProductApi } from '../../types';
import styles from './ProductCard.module.css';

const MAX_TITLE_LENGTH = 50;

export type ProductCardProps = {
    className?: string;
    product?: ProductApi;
    imageSrc?: string | null;
    altText?: string;
    title: string;
    description?: string | null;
    price?: number | string;
    stock?: number;
    actionLabel?: string;
    onAction?: () => void;
    onAddToCart?: () => void;
    addLabel?: string;
    showFavorite?: boolean;
};

export const ProductCard = ({
    className,
    product,
    imageSrc,
    altText,
    title,
    description,
    price,
    stock,
    actionLabel = 'Ver producto',
    onAction,
    onAddToCart,
    addLabel = 'Agregar',
    showFavorite = true,
}: ProductCardProps) => {
    const displayedTitle =
        title?.length > MAX_TITLE_LENGTH ? `${title.slice(0, MAX_TITLE_LENGTH)}...` : title;
    const outOfStock = typeof stock === 'number' && stock <= 0;
    const showAddButton = Boolean(onAddToCart);
    const canShowFavorite = showFavorite && Boolean(product);

    return (
        <article className={clsx(styles.card, className)}>
            <figure className={styles.preview}>
                <ProductImage
                    src={imageSrc}
                    alt={altText || title}
                    className={styles.image}
                    loading="lazy"
                    onClick={onAction}
                    aria-label={`Ver detalles de ${title}`}
                />
                {price != null && <span className={styles.priceTag}>{formatCurrency(price)}</span>}
                {outOfStock && (
                    <SoldOutBadge
                        placement="start"
                        className={clsx(styles.soldOutBadge, price != null && styles.soldOutWithPrice)}
                    />
                )}
                {canShowFavorite && product && (
                    <div className={styles.favContainer}>
                        <FavoriteButton
                            product={product}
                            className={styles.favoriteBtn}
                            activeClassName={styles.favoriteBtnActive}
                        />
                    </div>
                )}
            </figure>

            <div className={styles.body}>
                <h3 className={styles.name}>{displayedTitle}</h3>
                <p className={styles.desc}>{description}</p>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={clsx(styles.actionBtn, styles.actionBtnSecondary)}
                        onClick={onAction}
                        aria-label={`Ver detalles de ${title}`}
                    >
                        {actionLabel}
                    </button>
                    {showAddButton && (
                        <button
                            type="button"
                            className={clsx(styles.actionBtn, styles.actionBtnPrimary)}
                            onClick={onAddToCart}
                            disabled={outOfStock}
                            aria-label={
                                outOfStock
                                    ? `${title} agotado`
                                    : `Agregar ${title} al carrito`
                            }
                        >
                            {outOfStock ? 'Agotado' : addLabel}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};
