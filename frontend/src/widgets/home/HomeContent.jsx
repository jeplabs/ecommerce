import Carousel from '@/shared/ui/Carousel/Carousel';
import { ProductSlider } from '@/shared/ui/ProductSlider/ProductSlider';
import { useProducts } from '@/entities/product';
import { HOME_HERO_SLIDES } from './home-slides';

/**
 * Contenido de inicio (hero + sliders). Sin acoplamiento al router.
 */
export default function HomeContent({ onAddToCart }) {
    const { productos } = useProducts();

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
