import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import styles from './Carousel.module.css';

export type CarouselSlide = {
    desktopSrc: string;
    mobileSrc?: string | null;
    alt: string;
    link?: string | null;
};

export type HomeHeroSlide = CarouselSlide;

type CarouselProps = {
    slides: CarouselSlide[];
};

const Carousel = ({ slides }: CarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!slides || slides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [slides]);

    const goToSlide = (index: number) => setCurrentIndex(index);
    const nextSlide = () =>
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    const prevSlide = () =>
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

    if (!slides || slides.length === 0) return null;

    return (
        <div className={styles.container}>
            <div
                className={styles.track}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide, index) => {
                    const content = (
                        <>
                            <picture className={styles.picture}>
                                <source
                                    media="(max-width: 768px)"
                                    srcSet={slide.mobileSrc || slide.desktopSrc}
                                />
                                <img
                                    src={slide.desktopSrc}
                                    alt={slide.alt}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    fetchPriority={index === 0 ? 'high' : undefined}
                                    decoding="async"
                                    width={index === 0 ? 1920 : undefined}
                                    height={index === 0 ? 600 : undefined}
                                    onError={(e) => {
                                        const fallback = '/images/product-placeholder.svg';
                                        // Evita bucle si el propio placeholder llegara a fallar
                                        if (e.currentTarget.src.includes(fallback)) return;
                                        // 1. Reemplaza el srcSet del <source> para móviles
                                        const sources = e.currentTarget.parentElement?.querySelectorAll('source');
                                        sources?.forEach((source) => {
                                            source.srcset = fallback;
                                        });
                                        // 2. Reemplaza el src del <img> para desktop/tablets
                                        e.currentTarget.src = fallback;
                                    }}
                                />
                            </picture>
                            <div className={styles.slideOverlay} />
                        </>
                    );

                    return (
                        <div key={index} className={styles.slide}>
                            {slide.link ? (
                                /^https?:\/\//i.test(slide.link) ? (
                                    <a
                                        href={slide.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.slideLink}
                                        aria-label={slide.alt}
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <Link
                                        to={slide.link}
                                        className={styles.slideLink}
                                        aria-label={slide.alt}
                                    >
                                        {content}
                                    </Link>
                                )
                            ) : (
                                <div className={styles.slideLink} aria-label={slide.alt}>
                                    {content}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        className={clsx(styles.navBtn, styles.navBtnPrev)}
                        onClick={prevSlide}
                        aria-label="Anterior"
                    >
                        &#10094;
                    </button>
                    <button
                        type="button"
                        className={clsx(styles.navBtn, styles.navBtnNext)}
                        onClick={nextSlide}
                        aria-label="Siguiente"
                    >
                        &#10095;
                    </button>
                    <div className={styles.indicators}>
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={clsx(
                                    styles.indicator,
                                    index === currentIndex && styles.indicatorActive
                                )}
                                onClick={() => goToSlide(index)}
                                aria-label={`Ir a la diapositiva ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Carousel;
