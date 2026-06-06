import './ProductCard.css';

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
    className = '',
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
        <article className={`product-card ${className}`.trim()}>
            <figure className="card-preview">
                <img
                    src={imageSrc}
                    alt={altText || title}
                    className="product-image"
                    loading="lazy"
                    onClick={onAction}
                    aria-label={`Ver detalles de ${title}`}
                />
                {price && <span className="product-price-tag">${price}</span>}
            </figure>

            <div className="card-body">
                <h3 className="card-name">{displayedTitle}</h3>
                <p className="card-desc">{description}</p>

                <div className="card-actions">
                    <button
                        className="product-btn secondary"
                        onClick={onAction}
                        aria-label={`Ver detalles de ${title}`}
                    >
                        {actionLabel}
                    </button>
                    {onAddToCart && (
                        <button
                            className="product-btn primary"
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
