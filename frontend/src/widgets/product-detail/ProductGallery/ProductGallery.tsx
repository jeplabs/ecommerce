import { useState } from 'react';
import type { ProductApi } from '@/entities/product';
import { getProductImageUrls, getMainProductImageUrl } from '@/entities/product';
import './ProductGallery.css';

type ProductGalleryProps = {
    producto: ProductApi;
};

export default function ProductGallery({ producto }: ProductGalleryProps) {
    const [imagenActiva, setImagenActiva] = useState(getMainProductImageUrl(producto));
    const imagenes = getProductImageUrls(producto);
    const tieneVarias = imagenes.length > 1;

    return (
        <div className="pd-gallery">
            <div className="main-image-wrapper">
                <img src={imagenActiva} alt={producto.nombre} className="main-img" />
                {producto.stock === 0 && <div className="stock-badge out">Agotado</div>}
            </div>

            {tieneVarias && (
                <div className="thumbnail-list">
                    {imagenes.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className={`thumb-btn ${imagenActiva === img ? 'active' : ''}`}
                            onClick={() => setImagenActiva(img)}
                            aria-label={`Ver imagen ${idx + 1} de ${producto.nombre}`}
                        >
                            <img src={img} alt={`Vista ${idx + 1}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
