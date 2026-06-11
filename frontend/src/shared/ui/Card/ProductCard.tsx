import clsx from 'clsx';
import styles from './ProductCard.module.css';

const MAX_TITLE_LENGTH = 50;

type ProductCardProps = {
    className?: string;
    imageSrc: string;
    altText?: string;
    title: string;
    description?: string | null;
    price?: number | string;
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
    actionLabel = 'Ver producto',
    onAction,
    onAddToCart,
    addLabel = 'Agregar',
}: ProductCardProps) => {
    const displayedTitle =
        title?.length > MAX_TITLE_LENGTH ? `${title.slice(0, MAX_TITLE_LENGTH)}...` : title;

    return (
        <article className={clsx(styles.card, className)}>
            <figure className={styles.preview}>
                <img
                    src={imageSrc}
                    alt={altText || title}
                    className={styles.image}
                    loading="lazy"
                    onClick={onAction}
                    aria-label={`Ver detalles de ${title}`}
                />
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
                    {onAddToCart && (
                        <button
                            type="button"
                            className={clsx(styles.actionBtn, styles.actionBtnPrimary)}
                            onClick={onAddToCart}
                            aria-label={`Agregar ${title} al carrito`}
                        >
                            {addLabel}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};
