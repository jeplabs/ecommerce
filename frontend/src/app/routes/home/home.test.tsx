import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockProduct } from '@/test/msw/fixtures/products';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...mod,
        useNavigate: () => navigateMock,
    };
});

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useAuth: vi.fn(),
        useCart: vi.fn(),
        useToast: vi.fn(),
        useProduct: vi.fn(),
    };
});

vi.mock('@/components/ui/Carousel/Carousel', () => ({
    default: ({ slides }: { slides: { alt: string }[] }) => (
        <div data-testid="home-carousel">Slides: {slides.length}</div>
    ),
}));

vi.mock('@/components/ui/ProductSlider/ProductSlider', () => ({
    ProductSlider: ({
        title,
        products,
        onAddToCart,
    }: {
        title: string;
        products: { id: number; nombre: string }[];
        onAddToCart?: (id: number, nombre: string) => void;
    }) => (
        <section>
            <h2>{title}</h2>
            {products.map((p) => (
                <button
                    key={`${title}-${p.id}`}
                    type="button"
                    onClick={() => onAddToCart?.(p.id, p.nombre)}
                >
                    Agregar {p.nombre} ({title})
                </button>
            ))}
        </section>
    ),
}));

import { useAuth, useCart, useProduct, useToast } from '@/app/providers';
import type { ProductApi } from '@/features/catalog';
import HomeRoute from './index';
import { HOME_HERO_SLIDES } from './home-slides';

const useAuthMock = vi.mocked(useAuth);
const useCartMock = vi.mocked(useCart);
const useToastMock = vi.mocked(useToast);
const useProductMock = vi.mocked(useProduct);

const mockDestacadoProduct: ProductApi = {
    ...mockProduct,
    id: 11,
    nombre: 'iPhone 16 Pro Max',
    slug: 'iphone-16-pro-max',
    categorias: [
        {
            id: 83,
            nombre: 'Productos Destacados',
            slug: 'productos-destacados',
            parentId: 81,
            subcategorias: [],
        },
    ],
};

const mockOfertaProduct: ProductApi = {
    ...mockProduct,
    id: 14,
    nombre: 'Teclado Logitech G PRO',
    slug: 'teclado-logitech-g-pro',
    categorias: [
        {
            id: 85,
            nombre: 'Packs y Kits',
            slug: 'packs-y-kits',
            parentId: 82,
            subcategorias: [],
        },
    ],
};

const mockRegularCatalogProduct: ProductApi = {
    ...mockProduct,
    id: 99,
    nombre: 'Cable UTP Normal',
    slug: 'cable-utp-normal',
    categorias: [
        {
            id: 77,
            nombre: 'Cableado estructurado',
            slug: 'cableado-estructurado',
            parentId: 23,
            subcategorias: [],
        },
    ],
};

describe('HomeRoute', () => {
    const showSuccess = vi.fn();
    const showError = vi.fn();
    const addToCart = vi.fn();

    beforeEach(() => {
        navigateMock.mockReset();
        showSuccess.mockReset();
        showError.mockReset();
        addToCart.mockReset();

        useAuthMock.mockReturnValue({ isAuthenticated: true } as never);
        useCartMock.mockReturnValue({ addToCart } as never);
        useToastMock.mockReturnValue({ showSuccess, showError } as never);
        useProductMock.mockReturnValue({
            productos: [mockDestacadoProduct, mockOfertaProduct, mockRegularCatalogProduct],
        } as never);
    });

    it('renderiza el carrusel hero y filtra exclusivamente los productos de destacados y de ofertas en cada sección', () => {
        render(
            <MemoryRouter>
                <HomeRoute />
            </MemoryRouter>
        );

        expect(screen.getByTestId('home-carousel')).toHaveTextContent(
            `Slides: ${HOME_HERO_SLIDES.length}`
        );
        expect(screen.getByRole('heading', { name: 'Productos destacados' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Ofertas' })).toBeInTheDocument();

        // En "Productos destacados" solo aparece el producto destacado
        expect(
            screen.getByRole('button', {
                name: `Agregar ${mockDestacadoProduct.nombre} (Productos destacados)`,
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: `Agregar ${mockOfertaProduct.nombre} (Productos destacados)`,
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: `Agregar ${mockRegularCatalogProduct.nombre} (Productos destacados)`,
            })
        ).not.toBeInTheDocument();

        // En "Ofertas" solo aparece el producto en oferta
        expect(
            screen.getByRole('button', {
                name: `Agregar ${mockOfertaProduct.nombre} (Ofertas)`,
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: `Agregar ${mockDestacadoProduct.nombre} (Ofertas)`,
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: `Agregar ${mockRegularCatalogProduct.nombre} (Ofertas)`,
            })
        ).not.toBeInTheDocument();
    });

    it('redirige a /login cuando un visitante no autenticado intenta agregar al carrito', async () => {
        const user = userEvent.setup();
        useAuthMock.mockReturnValue({ isAuthenticated: false } as never);

        render(
            <MemoryRouter>
                <HomeRoute />
            </MemoryRouter>
        );

        await user.click(
            screen.getByRole('button', {
                name: `Agregar ${mockDestacadoProduct.nombre} (Productos destacados)`,
            })
        );

        expect(navigateMock).toHaveBeenCalledWith('/login');
        expect(addToCart).not.toHaveBeenCalled();
    });

    it('agrega al carrito y muestra toast de éxito cuando el usuario está autenticado', async () => {
        const user = userEvent.setup();
        addToCart.mockResolvedValue({ success: true });

        render(
            <MemoryRouter>
                <HomeRoute />
            </MemoryRouter>
        );

        await user.click(
            screen.getByRole('button', {
                name: `Agregar ${mockOfertaProduct.nombre} (Ofertas)`,
            })
        );

        await waitFor(() => expect(addToCart).toHaveBeenCalledWith(mockOfertaProduct.id, 1));
        expect(showSuccess).toHaveBeenCalledWith(
            `${mockOfertaProduct.nombre} agregado al carrito`
        );
    });

    it('muestra toast de error cuando addToCart falla', async () => {
        const user = userEvent.setup();
        addToCart.mockResolvedValue({ success: false, error: 'Stock agotado' });

        render(
            <MemoryRouter>
                <HomeRoute />
            </MemoryRouter>
        );

        await user.click(
            screen.getByRole('button', {
                name: `Agregar ${mockDestacadoProduct.nombre} (Productos destacados)`,
            })
        );

        await waitFor(() => expect(showError).toHaveBeenCalledWith('Stock agotado'));
    });
});
