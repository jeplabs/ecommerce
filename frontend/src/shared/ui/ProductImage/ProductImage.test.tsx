import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductImage } from './ProductImage';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/shared/assets/product-placeholder';

describe('ProductImage', () => {
    it('renderiza la imagen proporcionada si el src es válido', () => {
        render(<ProductImage src="https://example.com/product.jpg" alt="Producto Test" />);
        const img = screen.getByAltText('Producto Test') as HTMLImageElement;
        expect(img.src).toBe('https://example.com/product.jpg');
    });

    it('renderiza la imagen de placeholder por defecto cuando src es null o vacío', () => {
        render(<ProductImage src="" alt="Sin Imagen Test" />);
        const img = screen.getByAltText('Sin Imagen Test') as HTMLImageElement;
        expect(img.src).toContain(PRODUCT_PLACEHOLDER_IMAGE);
    });

    it('reemplaza el src con la imagen de placeholder cuando ocurre un evento onError (404/error de red)', () => {
        render(<ProductImage src="https://example.com/broken.jpg" alt="Imagen Rota" />);
        const img = screen.getByAltText('Imagen Rota') as HTMLImageElement;
        
        fireEvent.error(img);
        
        expect(img.src).toContain(PRODUCT_PLACEHOLDER_IMAGE);
    });
});

