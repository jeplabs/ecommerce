import { useState } from 'react';
import clsx from 'clsx';
import type { ProductApi } from '@/entities/product';
import { getProductImageUrls, getMainProductImageUrl } from '@/entities/product';
import { SoldOutBadge } from '@/shared/ui/SoldOutBadge/SoldOutBadge';
import styles from './ProductGallery.module.css';

type ProductGalleryProps = {
    producto: ProductApi;
};

export default function ProductGallery({ producto }: ProductGalleryProps) {
    const [imagenActiva, setImagenActiva] = useState(getMainProductImageUrl(producto));
    const imagenes = getProductImageUrls(producto);
    const tieneVarias = imagenes.length > 1;

    return (
        <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
                <img
                    src={imagenActiva}
                    alt={producto.nombre}
                    className={styles.mainImg}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                />
                {producto.stock === 0 && <SoldOutBadge placement="end" />}
            </div>

            {tieneVarias && (
                <div className={styles.thumbnailList}>
                    {imagenes.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className={clsx(
                                styles.thumbBtn,
                                imagenActiva === img && styles.thumbBtnActive
                            )}
                            onClick={() => setImagenActiva(img)}
                            aria-label={`Ver imagen ${idx + 1} de ${producto.nombre}`}
                        >
                            <img src={img} alt={`Vista ${idx + 1}`} loading="lazy" decoding="async" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
