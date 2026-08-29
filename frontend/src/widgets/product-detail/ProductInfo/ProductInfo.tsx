import { useAuth, useToast, useFavorites } from '@/app/providers';
import { useEffect, useState } from 'react';
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
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const favorito = isFavorite(producto.id);

    useEffect(() => {
        setCantidad((prev) => {
            if (producto.stock <= 0) return 1;
            return Math.min(prev, producto.stock);
        });
    }, [producto.stock]);

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

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const result = await toggleFavorite(producto);
        if (!result.success) {
            if ('requiresAuth' in result) {
                navigate('/login');
            } else {
                showError(result.error);
            }
            return;
        }

        if (result.added) {
            showSuccess(`${producto.nombre} agregado a favoritos`);
        } else {
            showError(`${producto.nombre} eliminado de favoritos`);
        }
    };

    return (
        <div className={styles.info}>
            <h1 className={styles.title}>{producto.nombre}</h1>

            <div className={styles.meta}>
                <div className={styles.metaBadges}>
                    <span className={clsx(styles.metaBadge, styles.skuBadge)}>SKU: {producto.sku}</span>
                    <span className={clsx(styles.metaBadge, disponible ? styles.stockIn : styles.stockOut)}>
                        {disponible
                            ? `✓ Disponible · ${producto.stock} en stock`
                            : '✕ Sin stock'}
                    </span>
                </div>
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
                        onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                        disabled={!disponible || agregando || cantidad >= producto.stock}
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
                <button
                    type="button"
                    className={clsx(styles.favBtn, favorito && styles.favBtnActive)}
                    onClick={handleToggleFavorite}
                    aria-label={favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    aria-pressed={favorito}
                >
                    <span className="material-symbols-outlined">
                        {favorito ? 'favorite' : 'favorite_border'}
                    </span>
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
