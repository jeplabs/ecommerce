import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { ProductGallery } from './ProductGallery';
import { mockProduct } from '@/test/msw/fixtures/products';

describe('Accesibilidad — ProductGallery (Paso 3: Detalle de Producto)', () => {
    it('la galería con imagen principal y miniaturas cumple con las normas de accesibilidad de axe-core', async () => {
        const productoConVariasImagenes = {
            ...mockProduct,
            imagenes: [
                { id: 1, url: '/img1.jpg', principal: true },
                { id: 2, url: '/img2.jpg', principal: false },
            ],
        };

        const { container } = render(<ProductGallery producto={productoConVariasImagenes} />);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('la galería con producto agotado cumple con las normas de accesibilidad', async () => {
        const productoAgotado = {
            ...mockProduct,
            stock: 0,
        };

        const { container } = render(<ProductGallery producto={productoAgotado} />);

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
