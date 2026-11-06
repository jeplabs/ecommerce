import { useRef, useState } from 'react';
import clsx from 'clsx';
import { ProductCard } from '@/shared/ui/Card/ProductCard';
import { getMainProductImageUrl } from '@/entities/product';
import type { ProductApi } from '@/entities/product';
import { useNavigate } from 'react-router-dom';
import styles from './ProductSlider.module.css';

type ProductSliderProps = {
    title: string;
    products: ProductApi[];
    onAddToCart?: (productId: number, productName: string) => void;
};

export const ProductSlider = ({ title, products, onAddToCart }: ProductSliderProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [showLeftBtn, setShowLeftBtn] = useState(false);
    const [showRightBtn, setShowRightBtn] = useState(true);
    const navigate = useNavigate();

    const checkScroll = () => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setShowLeftBtn(scrollLeft > 10);
            setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.clientWidth * 0.75;
            const newScroll =
                direction === 'left'
                    ? sliderRef.current.scrollLeft - scrollAmount
                    : sliderRef.current.scrollLeft + scrollAmount;

            sliderRef.current.scrollTo({
                left: newScroll,
                behavior: 'smooth',
            });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.titleContainer}>
                <h2>{title}</h2>
            </div>

            <div className={styles.wrapper}>
                <button
                    type="button"
                    className={clsx(
                        styles.navBtn,
                        styles.navBtnLeft,
                        !showLeftBtn && styles.navBtnHidden
                    )}
                    onClick={() => scroll('left')}
                    aria-label="Ver anteriores"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <div className={styles.track} ref={sliderRef} onScroll={checkScroll}>
                    {products.map((producto) => (
                        <div key={producto.id} className={styles.cardItem}>
                            <ProductCard
                                imageSrc={getMainProductImageUrl(producto)}
                                altText={producto.nombre}
                                title={producto.nombre}
                                description={producto.descripcion}
                                price={producto.precioVenta}
                                stock={producto.stock}
                                actionLabel="Ver producto"
                                onAction={() =>
                                    navigate(`/producto/${producto.slug || producto.id}`)
                                }
                                onAddToCart={
                                    onAddToCart
                                        ? () => onAddToCart(producto.id, producto.nombre)
                                        : undefined
                                }
                                addLabel="Agregar"
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className={clsx(
                        styles.navBtn,
                        styles.navBtnRight,
                        !showRightBtn && styles.navBtnHidden
                    )}
                    onClick={() => scroll('right')}
                    aria-label="Ver siguientes"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        </section>
    );
};
