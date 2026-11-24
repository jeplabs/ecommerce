import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ProductInfo } from './ProductInfo';
import { mockProduct } from '@/test/msw/fixtures/products';

vi.mock('@/app/providers', () => ({
    useAuth: () => ({ isAuthenticated: true }),
    useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
    useFavorites: () => ({
        isFavorite: vi.fn().mockReturnValue(false),
        toggleFavorite: vi.fn().mockResolvedValue({ success: true, added: true }),
    }),
}));

describe('Accesibilidad — ProductInfo (Paso 3: Detalle de Producto)', () => {
    it('el componente ProductInfo con stock disponible cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <ProductInfo
                    producto={mockProduct}
                    precioFormateado="$49.99"
                    onAddToCart={vi.fn().mockResolvedValue({ success: true })}
                />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el componente ProductInfo sin stock cumple con las normas de accesibilidad', async () => {
        const productoSinStock = { ...mockProduct, stock: 0 };

        const { container } = render(
            <MemoryRouter>
                <ProductInfo
                    producto={productoSinStock}
                    precioFormateado="$49.99"
                    onAddToCart={vi.fn().mockResolvedValue({ success: true })}
                />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
