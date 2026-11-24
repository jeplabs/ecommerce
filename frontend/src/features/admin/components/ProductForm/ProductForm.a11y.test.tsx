import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { mockCategories } from '@/test/msw/fixtures/categories';
import { ProductForm } from './ProductForm';

describe('Accesibilidad — ProductForm', () => {
    it('cumple con WCAG 2.1 AA en el formulario de creación de productos con todas las secciones', async () => {
        const onSubmit = vi.fn();
        const onCancel = vi.fn();

        const { container } = render(
            <MemoryRouter>
                <AppProviders>
                    <ProductForm
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        arbolCategorias={mockCategories}
                    />
                </AppProviders>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sku/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
