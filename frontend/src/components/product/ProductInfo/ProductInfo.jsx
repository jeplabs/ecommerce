import "./ProductInfo.css";
import { useState } from "react";

export default function ProductInfo({ producto, precioFormateado, onAddToCart }) {
    const disponible = producto.stock > 0;
    const [cantidad, setCantidad] = useState(1);
    const [agregando, setAgregando] = useState(false);

    const handleAddToCart = async () => {
        setAgregando(true);
        try {
            const resultado = await onAddToCart(producto.id, cantidad);
            if (resultado?.success) {
                // Opcional: mostrar toast de éxito
                setCantidad(1);
            }
        } finally {
            setAgregando(false);
        }
    };

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
                <div className="pd-quantity-selector">
                    <button
                        className="qty-btn"
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        disabled={!disponible || agregando}
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>
                    <span className="qty-display">{cantidad}</span>
                    <button
                        className="qty-btn"
                        onClick={() => setCantidad(cantidad + 1)}
                        disabled={!disponible || agregando}
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>
                </div>

                <button 
                    className="btn-submit"
                    disabled={!disponible || agregando}
                    onClick={handleAddToCart}
                >
                    {agregando ? 'Agregando...' : (disponible ? 'Añadir al Carrito' : 'Sin Stock')}
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