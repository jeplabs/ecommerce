import "./ProductInfo.css";

export default function ProductInfo({ producto, precioFormateado, onAddToCart }) {
    const disponible = producto.stock > 0;

    return (
        <div className="pd-info">
            <h1 className="pd-title">{producto.nombre}</h1>
            
            <div className="pd-meta">
                <span className="pd-sku">SKU: {producto.sku}</span>
                <span className={`pd-stock ${disponible ? 'in' : 'out'}`}>
                    {disponible ? '✓ Disponible' : '✕ Sin Stock'}
                </span>
            </div>

            <div className="pd-price">{precioFormateado}</div>

            <div className="pd-short-desc">
                <p>{producto.descripcion.substring(0, 150)}...</p>
            </div>

            <div className="pd-actions">
                <button 
                    className="btn-submit"
                    disabled={!disponible}
                    onClick={onAddToCart}
                >
                    {disponible ? 'Añadir al Carrito' : 'Sin Stock'}
                </button>
                <button className="btn-secondary" aria-label="Añadir a favoritos">
                    <span className="material-symbols-outlined">favorite_border</span>
                </button>
            </div>

            <div className="pd-trust">
                <div className="trust-item">
                    <span className="material-symbols-outlined">local_shipping</span>
                    <span>Envío Seguro</span>
                </div>
                <div className="trust-item">
                    <span className="material-symbols-outlined">security</span>
                    <span>Compra Protegida</span>
                </div>
            </div>
        </div>
    );
}