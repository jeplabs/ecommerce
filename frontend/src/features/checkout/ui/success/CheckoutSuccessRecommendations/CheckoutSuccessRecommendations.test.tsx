import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useAuth: vi.fn(),
        useCart: vi.fn(),
        useToast: vi.fn(),
    };
});

vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...mod,
        useNavigate: () => navigateMock,
    };
});

vi.mock('@/features/checkout/model/useCheckoutSuccessRecommendations', () => ({
    useCheckoutSuccessRecommendations: vi.fn(),
}));

vi.mock('@/shared/ui/ProductSlider/ProductSlider', () => ({
    ProductSlider: ({ title, products, onAddToCart }: {
        title: string;
        products: { id: number; nombre: string }[];
        onAddToCart?: (id: number, name: string) => void;
    }) => (
        <div>
            <h3>{title}</h3>
            {products.map((p) => (
                <button
                    key={p.id}
                    type="button"
                    onClick={() => onAddToCart?.(p.id, p.nombre)}
                >
                    Agregar {p.nombre}
                </button>
            ))}
        </div>
    ),
}));

import { useAuth, useCart, useToast } from '@/app/providers';
import { useCheckoutSuccessRecommendations } from '@/features/checkout';
import CheckoutSuccessRecommendations from './CheckoutSuccessRecommendations';
import { mockProduct, mockProductAlpha } from '@/test/msw/fixtures/products';
import { findDynamicOrder, MOCK_ORDER_PENDING_ID } from '@/test/msw/fixtures/orders-registry';

const useAuthMock = vi.mocked(useAuth);
const useCartMock = vi.mocked(useCart);
const useToastMock = vi.mocked(useToast);
const useRecommendationsMock = vi.mocked(useCheckoutSuccessRecommendations);

const navigateMock = vi.fn();
const orden = findDynamicOrder(MOCK_ORDER_PENDING_ID)!;

function mockDefaults() {
    useAuthMock.mockReturnValue({ isAuthenticated: true } as never);
    useCartMock.mockReturnValue({
        addToCart: vi.fn().mockResolvedValue({ success: true }),
    } as never);
    useToastMock.mockReturnValue({
        showSuccess: vi.fn(),
        showError: vi.fn(),
        showInfo: vi.fn(),
        showWarning: vi.fn(),
    } as never);
    navigateMock.mockReset();
}

describe('CheckoutSuccessRecommendations', () => {
    it('muestra el estado de carga', () => {
        mockDefaults();
        useRecommendationsMock.mockReturnValue({
            recommended: [],
            offers: [],
            loading: true,
        });
        render(<CheckoutSuccessRecommendations orden={orden} />);

        expect(screen.getByText('Cargando sugerencias…')).toBeInTheDocument();
    });

    it('no renderiza nada sin recomendaciones ni ofertas', () => {
        mockDefaults();
        useRecommendationsMock.mockReturnValue({
            recommended: [],
            offers: [],
            loading: false,
        });
        const { container } = render(<CheckoutSuccessRecommendations orden={orden} />);

        expect(container.firstChild).toBeNull();
    });

    it('muestra los sliders de recomendados y ofertas', () => {
        mockDefaults();
        useRecommendationsMock.mockReturnValue({
            recommended: [mockProduct],
            offers: [mockProductAlpha],
            loading: false,
        });
        render(<CheckoutSuccessRecommendations orden={orden} />);

        expect(
            screen.getByText('También te puede interesar')
        ).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Recomendados para ti' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Más del catálogo' })).toBeInTheDocument();
    });

    it('solo muestra ofertas cuando no hay recomendados', () => {
        mockDefaults();
        useRecommendationsMock.mockReturnValue({
            recommended: [],
            offers: [mockProductAlpha],
            loading: false,
        });
        render(<CheckoutSuccessRecommendations orden={orden} />);

        expect(screen.queryByRole('heading', { name: 'Recomendados para ti' })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Más del catálogo' })).toBeInTheDocument();
    });

    it('agrega al carrito y muestra éxito', async () => {
        const user = userEvent.setup();
        mockDefaults();
        const addToCart = vi.fn().mockResolvedValue({ success: true });
        useCartMock.mockReturnValue({ addToCart } as never);
        const showSuccess = vi.fn();
        useToastMock.mockReturnValue({
            showSuccess,
            showError: vi.fn(),
            showInfo: vi.fn(),
            showWarning: vi.fn(),
        } as never);
        useRecommendationsMock.mockReturnValue({
            recommended: [mockProduct],
            offers: [],
            loading: false,
        });
        render(<CheckoutSuccessRecommendations orden={orden} />);

        await user.click(screen.getByRole('button', { name: `Agregar ${mockProduct.nombre}` }));

        await waitFor(() => expect(addToCart).toHaveBeenCalledWith(mockProduct.id, 1));
        expect(showSuccess).toHaveBeenCalledWith(`${mockProduct.nombre} agregado al carrito`);
    });

    it('muestra error si no se puede agregar', async () => {
        const user = userEvent.setup();
        mockDefaults();
        useCartMock.mockReturnValue({
            addToCart: vi.fn().mockResolvedValue({ success: false, error: 'Sin stock' }),
        } as never);
        const showError = vi.fn();
        useToastMock.mockReturnValue({
            showSuccess: vi.fn(),
            showError,
            showInfo: vi.fn(),
            showWarning: vi.fn(),
        } as never);
        useRecommendationsMock.mockReturnValue({
            recommended: [mockProduct],
            offers: [],
            loading: false,
        });
        render(<CheckoutSuccessRecommendations orden={orden} />);

        await user.click(screen.getByRole('button', { name: `Agregar ${mockProduct.nombre}` }));

        await waitFor(() => expect(showError).toHaveBeenCalledWith('Sin stock'));
    });

    it('redirige a login cuando no está autenticado', async () => {
        const user = userEvent.setup();
        mockDefaults();
        useAuthMock.mockReturnValue({ isAuthenticated: false } as never);
        useRecommendationsMock.mockReturnValue({
            recommended: [mockProduct],
            offers: [],
            loading: false,
        });
        render(<CheckoutSuccessRecommendations orden={orden} />);

        await user.click(screen.getByRole('button', { name: `Agregar ${mockProduct.nombre}` }));

        expect(navigateMock).toHaveBeenCalledWith('/login');
    });
});
