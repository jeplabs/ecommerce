import { useMemo } from 'react';
import Carousel, { type CarouselSlide } from '@/components/ui/Carousel/Carousel';
import { ProductSlider } from '@/components/ui/ProductSlider/ProductSlider';
import { useProduct } from '@/app/providers';
import { usePublicBanners } from '@/features/banners';
import { HOME_HERO_SLIDES } from './home-slides';

export type HomeContentProps = {
    onAddToCart: (productoId: number, productoNombre: string) => void | Promise<void>;
};

/**
 * Contenido de inicio (hero + sliders). Sin acoplamiento al router.
 */
export default function HomeContent({ onAddToCart }: HomeContentProps) {
    const { productos } = useProduct();
    const { banners } = usePublicBanners('HERO_CAROUSEL');

    const heroSlides = useMemo<CarouselSlide[]>(() => {
        if (!banners || banners.length === 0) {
            return HOME_HERO_SLIDES;
        }

        return banners.map((b) => ({
            desktopSrc: b.desktopUrl,
            mobileSrc: b.mobileUrl,
            alt: b.titulo,
            link: b.linkUrl,
        }));
    }, [banners]);

    return (
        <>
            <Carousel slides={heroSlides} />
            <ProductSlider
                title="Productos destacados"
                products={productos}
                onAddToCart={onAddToCart}
            />
            <ProductSlider
                title="Ofertas"
                products={productos}
                onAddToCart={onAddToCart}
            />
        </>
    );
}
