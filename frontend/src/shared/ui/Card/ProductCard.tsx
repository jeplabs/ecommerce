import clsx from 'clsx';
import { ProductImage } from '@/shared/ui/ProductImage';
import { SoldOutBadge } from '@/shared/ui/SoldOutBadge/SoldOutBadge';
import styles from './ProductCard.module.css';

const MAX_TITLE_LENGTH = 50;

type ProductCardProps = {
    className?: string;
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
};

export const ProductCard = ({
    className,
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
}: ProductCardProps) => {
    const displayedTitle =
        title?.length > MAX_TITLE_LENGTH ? `${title.slice(0, MAX_TITLE_LENGTH)}...` : title;
    const outOfStock = typeof stock === 'number' && stock <= 0;
    const showAddButton = Boolean(onAddToCart);

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
                {outOfStock && <SoldOutBadge placement="start" />}
                {price && <span className={styles.priceTag}>${price}</span>}
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
