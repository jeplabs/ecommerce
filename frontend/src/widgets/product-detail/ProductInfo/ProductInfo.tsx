import { useAuth, useToast } from '@/app/providers';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductApi } from '@/entities/product';
import type { CartActionResult } from '@/entities/cart';
import './ProductInfo.css';

type ProductInfoProps = {
    producto: ProductApi;
    precioFormateado: string;
    onAddToCart: (productId: number, quantity?: number) => Promise<CartActionResult>;
};

export default function ProductInfo({ producto, precioFormateado, onAddToCart }: ProductInfoProps) {
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
            const message = error instanceof Error ? error.message : 'Error al agregar al carrito';
            showError(message);
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
                <h4>Características Técnicas: </h4>
                {producto.specs &&
                    Object.entries(producto.specs).map(([key, value]) => (
                        <ul key={key} className="">
                            <span className="">- {key}: </span>
                            <span className="">{String(value)}</span>
                        </ul>
                    ))}
            </div>

            <div className="pd-actions">
                <div className="pd-quantity-selector">
                    <button
                        type="button"
                        className="qty-btn"
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        disabled={!disponible || agregando}
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>
                    <span className="qty-display">{cantidad}</span>
                    <button
                        type="button"
                        className="qty-btn"
                        onClick={() => setCantidad(cantidad + 1)}
                        disabled={!disponible || agregando}
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>
                </div>

                <button
                    type="button"
                    className="btn-submit"
                    disabled={!disponible || agregando}
                    onClick={handleAddToCart}
                >
                    {agregando ? 'Agregando...' : disponible ? 'Añadir al Carrito' : 'Sin Stock'}
                </button>
                <button type="button" className="btn-secondary" aria-label="Añadir a favoritos">
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
