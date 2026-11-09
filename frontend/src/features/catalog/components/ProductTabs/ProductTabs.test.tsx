import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductTabs } from './ProductTabs';
import { mockProduct } from '@/test/msw/fixtures/products';

describe('ProductTabs', () => {
    it('muestra por defecto la pestaña de descripción detallada', () => {
        render(<ProductTabs producto={mockProduct} />);
        expect(screen.getByRole('tab', { name: /descripción detallada/i })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        expect(screen.getByText(mockProduct.descripcion)).toBeInTheDocument();
    });

    it('cambia a la pestaña de características técnicas al hacer clic', () => {
        const productWithSpecs = {
            ...mockProduct,
            specs: { Pantalla: 'OLED', Memoria: '16GB' },
        };
        render(<ProductTabs producto={productWithSpecs} />);

        const specsTab = screen.getByRole('tab', { name: /características técnicas/i });
        fireEvent.click(specsTab);

        expect(specsTab).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Pantalla')).toBeInTheDocument();
        expect(screen.getByText('OLED')).toBeInTheDocument();
        expect(screen.getByText('Memoria')).toBeInTheDocument();
        expect(screen.getByText('16GB')).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay especificaciones registradas', () => {
        const productNoSpecs = { ...mockProduct, specs: {} };
        render(<ProductTabs producto={productNoSpecs} />);

        const specsTab = screen.getByRole('tab', { name: /características técnicas/i });
        fireEvent.click(specsTab);

        expect(
            screen.getByText(/no hay especificaciones técnicas disponibles/i)
        ).toBeInTheDocument();
    });
});
