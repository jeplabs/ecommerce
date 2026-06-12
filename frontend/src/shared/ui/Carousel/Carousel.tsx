import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type { HomeHeroSlide } from '@/widgets/home/home-slides';
import styles from './Carousel.module.css';

type CarouselProps = {
    slides: HomeHeroSlide[];
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
                {slides.map((slide, index) => (
                    <div key={index} className={styles.slide}>
                        <Link to={slide.link} className={styles.slideLink} aria-label={slide.alt}>
                            <img
                                src={slide.src}
                                srcSet={slide.srcSet}
                                sizes={slide.sizes}
                                alt={slide.alt}
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                            <div className={styles.slideOverlay} />
                        </Link>
                    </div>
                ))}
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
