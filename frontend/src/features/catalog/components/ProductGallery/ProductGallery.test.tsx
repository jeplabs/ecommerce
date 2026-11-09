import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductGallery } from './ProductGallery';
import { mockProduct } from '@/test/msw/fixtures/products';
import type { ProductApi } from '../../types';

describe('ProductGallery', () => {
    it('renderiza la imagen principal del producto', () => {
        render(<ProductGallery producto={mockProduct} />);
        const mainImg = screen.getByAltText(mockProduct.nombre);
        expect(mainImg).toBeInTheDocument();
    });

    it('muestra el badge de agotado cuando el stock es 0', () => {
        const outOfStock: ProductApi = { ...mockProduct, stock: 0 };
        render(<ProductGallery producto={outOfStock} />);
        expect(screen.getByText(/agotado/i)).toBeInTheDocument();
    });

    it('permite cambiar la imagen activa al hacer clic en las miniaturas', () => {
        const multiImgProduct: ProductApi = {
            ...mockProduct,
            imagenes: [
                { id: 1, url: 'https://example.com/img1.jpg', principal: true },
                { id: 2, url: 'https://example.com/img2.jpg', principal: false },
            ],
        };

        render(<ProductGallery producto={multiImgProduct} />);
        const thumbBtn = screen.getByRole('button', {
            name: new RegExp(`Ver imagen 2 de ${mockProduct.nombre}`, 'i'),
        });
        fireEvent.click(thumbBtn);

        const mainImg = screen.getByAltText(mockProduct.nombre);
        expect(mainImg).toHaveAttribute('src', 'https://example.com/img2.jpg');
    });
});
