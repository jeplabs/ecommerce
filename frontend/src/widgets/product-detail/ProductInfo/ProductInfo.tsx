import { useAuth, useToast } from '@/app/providers';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductApi } from '@/entities/product';
import type { CartActionResult } from '@/entities/cart';
import { Button } from '@/shared/ui/Button';
import clsx from 'clsx';
import styles from './ProductInfo.module.css';

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
        <div className={styles.info}>
            <h1 className={styles.title}>{producto.nombre}</h1>

            <div className={styles.meta}>
                <span>SKU: {producto.sku}</span>
                <span className={clsx(disponible ? styles.stockIn : styles.stockOut)}>
                    {disponible ? '✓ Disponible' : '✕ Sin Stock'}
                </span>
            </div>

            <div className={styles.price}>{precioFormateado}</div>

            <div className={styles.shortDesc}>
                <h4>Características Técnicas: </h4>
                {producto.specs &&
                    Object.entries(producto.specs).map(([key, value]) => (
                        <ul key={key}>
                            <span>- {key}: </span>
                            <span>{String(value)}</span>
                        </ul>
                    ))}
            </div>

            <div className={styles.actions}>
                <div className={styles.quantitySelector}>
                    <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        disabled={!disponible || agregando}
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>
                    <span className={styles.qtyDisplay}>{cantidad}</span>
                    <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setCantidad(cantidad + 1)}
                        disabled={!disponible || agregando}
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    className={styles.addBtn}
                    disabled={!disponible || agregando}
                    onClick={handleAddToCart}
                >
                    {agregando ? 'Agregando...' : disponible ? 'Añadir al Carrito' : 'Sin Stock'}
                </Button>
                <button type="button" className={styles.favBtn} aria-label="Añadir a favoritos">
                    <span className="material-symbols-outlined">favorite_border</span>
                </button>
            </div>

            <div className={styles.trust}>
                <div className={styles.trustItem}>
                    <span className="material-symbols-outlined">local_shipping</span>
                    <span>Envío Seguro</span>
                </div>
                <div className={styles.trustItem}>
                    <span className="material-symbols-outlined">security</span>
                    <span>Compra Protegida</span>
                </div>
            </div>
        </div>
    );
}
