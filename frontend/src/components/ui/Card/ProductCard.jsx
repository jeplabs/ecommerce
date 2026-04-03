import { useState } from "react";

export const ProductCard = ({ imageSrc, altText, title, description, price, actionLabel = "Ver producto", onAction }) => {
    return (
        <article className="product-card">
        {/* La imagen del producto va en figure */}
            <figure className="card-preview">
                <img 
                src={imageSrc} 
                alt={altText || title} 
                className="product-image"
                loading="lazy"
                />
                {/* Opcional: Etiqueta de oferta o categoría sobre la imagen */}
                {price && (
                <span className="product-price-tag">${price}</span>
                )}
            </figure>
            
            <div className="card-body">
                <h3 className="card-name">{title}</h3>
                <p className="card-desc">{description}</p>
                
                {/* Botón de acción en lugar de swatches */}
                <button 
                className="product-btn" 
                onClick={onAction}
                aria-label={`Ver detalles de ${title}`}
                >
                {actionLabel}
                </button>
            </div>
        </article>
    );
};
