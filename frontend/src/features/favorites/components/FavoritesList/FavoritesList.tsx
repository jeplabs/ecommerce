import { useNavigate, Link } from 'react-router-dom';
import { useFavorites, useProduct, useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { getMainProductImageUrl } from '@/entities/product';
import styles from './FavoritesList.module.css';
import { formatCurrency } from '@/utils/format';

export function FavoritesList() {
    const navigate = useNavigate();
    const { favorites, removeFavorite } = useFavorites();
    const { productos } = useProduct();
    const { showError } = useToast();

    const handleRemove = async (productId: number, nombre: string) => {
        try {
            await removeFavorite(productId);
            showError(`${nombre} eliminado de favoritos`);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'No se pudo eliminar el favorito';
            showError(message);
        }
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
                    {favorites.map((item) => {
                        const liveProduct = productos.find((p) => p.id === item.productId);
                        const imageSrc = liveProduct ? getMainProductImageUrl(liveProduct) : item.imagenUrl;

                        return (
                            <li key={item.productId} className={styles.item}>
                                <div className={styles.thumbWrap}>
                                    <Link to={`/producto/${item.slug}`} className={styles.itemLink}>
                                        <ProductImage
                                            src={imageSrc ?? undefined}
                                            alt={item.nombre}
                                            className={styles.thumb}
                                            loading="lazy"
                                        />
                                    </Link>
                                </div>

                                <div className={styles.info}>
                                    <Link to={`/producto/${item.slug}`} className={styles.itemLink}>
                                        <h3 className={styles.name}>{item.nombre}</h3>
                                    </Link>
                                    <p className={styles.price}>
                                        {formatCurrency(item.precioVenta)}
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
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

export default FavoritesList;

