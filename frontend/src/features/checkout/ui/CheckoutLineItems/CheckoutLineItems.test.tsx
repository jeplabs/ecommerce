import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CheckoutLineItems from './CheckoutLineItems';
import { mockCartItem } from '@/test/checkoutMock';
import { formatCurrency } from '@/shared/lib/format';

describe('CheckoutLineItems', () => {
    it('muestra los productos con imagen, precio y SKU', () => {
        const { container } = render(<CheckoutLineItems items={[mockCartItem]} />);

        expect(screen.getByText('Tu pedido')).toBeInTheDocument();
        expect(screen.getByText(mockCartItem.name)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`SKU ${mockCartItem.sku}`))).toBeInTheDocument();
        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            mockCartItem.imageUrl
        );
        expect(screen.getByText(formatCurrency(mockCartItem.subtotal))).toBeInTheDocument();
    });

    it('usa el precio*quantity cuando no hay subtotal', () => {
        const item = {
            ...mockCartItem,
            subtotal: undefined as unknown as number,
            imageUrl: '',
            sku: '',
            name: '',
        };
        render(<CheckoutLineItems items={[item]} />);

        expect(
            screen.getByText(formatCurrency(item.price * item.quantity))
        ).toBeInTheDocument();
        expect(screen.queryByText(/SKU/)).not.toBeInTheDocument();
        expect(screen.getByText('Producto')).toBeInTheDocument();
    });

    it('muestra el placeholder cuando no hay imagen', () => {
        render(<CheckoutLineItems items={[{ ...mockCartItem, imageUrl: '' }]} />);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Tu pedido')).toBeInTheDocument();
    });
});
