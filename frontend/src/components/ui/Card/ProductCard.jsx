import "./ProductCard.css";

export const ProductCard = ({ className = '', imageSrc, altText, title, description, price, actionLabel = "Ver producto", onAction, onAddToCart, addLabel = "Agregar" }) => {
    return (
        <article className={`product-card ${className}`.trim()}>
            <figure className="card-preview">
                <img 
                    src={imageSrc} 
                    alt={altText || title} 
                    className="product-image"
                    loading="lazy"
                />
                {price && (
                    <span className="product-price-tag">${price}</span>
                )}
            </figure>
            
            <div className="card-body">
                <h3 className="card-name">{title}</h3>
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
