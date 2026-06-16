import { useNavigate } from 'react-router-dom';
import { useFavorites, useToast } from '@/app/providers';
import { Button } from '@/shared/ui/Button';
import styles from './FavoritesTab.module.css';

export default function FavoritesTab() {
    const navigate = useNavigate();
    const { favorites, removeFavorite } = useFavorites();
    const { showSuccess } = useToast();

    const formatPrice = (value: number, moneda: string) =>
        new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: moneda || 'CLP',
        }).format(value);

    const handleRemove = (productId: number, nombre: string) => {
        removeFavorite(productId);
        showSuccess(`${nombre} eliminado de favoritos`);
    };

    return (
        <section className={styles.root} aria-label="Productos favoritos">
            <div className={styles.header}>
                <h2>Mis favoritos</h2>
                <p>Productos que guardaste para revisar más tarde</p>
            </div>

            {favorites.length === 0 ? (
                <div className={styles.empty}>
                    <p>Aún no tienes favoritos.</p>
                    <p>Usa el corazón en la ficha de un producto para guardarlo aquí.</p>
                </div>
            ) : (
                <ul className={styles.list}>
                    {favorites.map((item) => (
                        <li key={item.productId} className={styles.item}>
                            <div className={styles.thumbWrap}>
                                {item.imagenUrl ? (
                                    <img
                                        src={item.imagenUrl}
                                        alt=""
                                        className={styles.thumb}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={styles.thumbPlaceholder}>Sin imagen</div>
                                )}
                            </div>

                            <div className={styles.info}>
                                <h3 className={styles.name}>{item.nombre}</h3>
                                <p className={styles.price}>
                                    {formatPrice(item.precioVenta, item.moneda)}
                                </p>
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    type="button"
                                    variant="primary"
                                    className={styles.viewBtn}
                                    onClick={() =>
                                        navigate(`/producto/${item.slug || item.productId}`)
                                    }
                                >
                                    Ver producto
                                </Button>
                                <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => handleRemove(item.productId, item.nombre)}
                                >
                                    Quitar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
