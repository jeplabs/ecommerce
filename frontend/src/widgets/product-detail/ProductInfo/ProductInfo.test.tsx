import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductInfo from './ProductInfo';
import { mockProduct, mockSoldOutProduct } from '@/test/msw/fixtures/products';
import { renderWithShopProviders } from '@/test/utils/renderWithShopProviders';

describe('ProductInfo', () => {
    it('muestra SKU y stock disponible', () => {
        renderWithShopProviders(
            <ProductInfo
                producto={mockProduct}
                precioFormateado="$99.99"
                onAddToCart={vi.fn().mockResolvedValue({ success: true })}
            />
        );

        expect(screen.getByText(`SKU: ${mockProduct.sku}`)).toBeInTheDocument();
        expect(screen.getByText(/Disponible · 10 en stock/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /añadir al carrito/i })).toBeEnabled();
    });

    it('muestra sin stock y deshabilita acciones', () => {
        renderWithShopProviders(
            <ProductInfo
                producto={mockSoldOutProduct}
                precioFormateado="$79.99"
                onAddToCart={vi.fn().mockResolvedValue({ success: true })}
            />
        );

        expect(screen.getByText('✕ Sin stock')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sin stock/i })).toBeDisabled();
    });
});
