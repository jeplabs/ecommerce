import "./ProductInfo.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

export default function ProductInfo({ producto, precioFormateado, onAddToCart }) {
    const disponible = producto.stock > 0;
    const [cantidad, setCantidad] = useState(1);
    const [agregando, setAgregando] = useState(false);
    const { isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setAgregando(true);
        try {
            const resultado = await onAddToCart(producto.id, cantidad);
            if (resultado?.success) {
                showSuccess(`${producto.nombre} agregado al carrito`);
                setCantidad(1);
            } else {
                showError(resultado?.error || 'No se pudo agregar el producto');
            }
        } catch (error) {
            showError(error?.message || 'Error al agregar al carrito');
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