import Carousel from '@/components/ui/Carousel/Carousel';
import { ProductSlider } from '@/components/ui/ProductSlider/ProductSlider';
import { useProduct } from '@/app/providers';
import { HOME_HERO_SLIDES } from './home-slides';

export type HomeContentProps = {
    onAddToCart: (productoId: number, productoNombre: string) => void | Promise<void>;
};

/**
 * Contenido de inicio (hero + sliders). Sin acoplamiento al router.
 */
export default function HomeContent({ onAddToCart }: HomeContentProps) {
    const { productos } = useProduct();

    return (
        <>
            <Carousel slides={HOME_HERO_SLIDES} />
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
