import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrderSummary from './OrderSummary';
import { mockCartItem } from '@/test/checkoutMock';
import { formatCurrency } from '@/shared/lib/format';

describe('OrderSummary', () => {
    it('muestra ítems, subtotal, envío y total', () => {
        render(
            <OrderSummary
                items={[mockCartItem]}
                subtotal={199.98}
                shippingCostInTotal={5.99}
                total={205.97}
            />
        );

        expect(screen.getByText('Resumen del pedido')).toBeInTheDocument();
        expect(screen.getByText(mockCartItem.name)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`×${mockCartItem.quantity}`))).toBeInTheDocument();
        expect(screen.getAllByText(formatCurrency(199.98)).length).toBeGreaterThan(0);
        expect(screen.getByText(formatCurrency(5.99))).toBeInTheDocument();
        expect(screen.getByText(formatCurrency(205.97))).toBeInTheDocument();
        expect(screen.getByText('Precios con IVA incluido')).toBeInTheDocument();
    });

    it('calcula el total con subtotal + envío cuando no llega total', () => {
        render(<OrderSummary items={[]} subtotal={100} shippingCostInTotal={10} />);
        expect(screen.getByText(formatCurrency(110))).toBeInTheDocument();
    });

    it('muestra envío gratis con precio tachado si aplica', () => {
        render(
            <OrderSummary
                items={[]}
                subtotal={200}
                shippingCostInTotal={0}
                servicioCostos={{ tarifa: 5.99, enLinea: 5.99, contraEntrega: 5.99 }}
            />
        );

        expect(screen.getByText('Gratis')).toBeInTheDocument();
        expect(screen.getByText(formatCurrency(5.99))).toBeInTheDocument();
    });

    it('no tacha el precio cuando el envío gratis no tenía tarifa en línea', () => {
        render(
            <OrderSummary
                items={[]}
                subtotal={200}
                shippingCostInTotal={0}
                servicioCostos={{ tarifa: 0, enLinea: 0, contraEntrega: 0 }}
            />
        );

        expect(screen.getByText('Gratis')).toBeInTheDocument();
        expect(screen.getAllByText(formatCurrency(200)).length).toBeGreaterThan(0);
    });

    it('muestra la nota de contra entrega en vez del precio de envío', () => {
        render(
            <OrderSummary
                items={[]}
                subtotal={100}
                shippingCostInTotal={0}
                isContraEntrega
            />
        );

        expect(screen.getByText('Se paga al recibir')).toBeInTheDocument();
    });

    it('con totalsOnly oculta la lista de ítems', () => {
        render(<OrderSummary items={[mockCartItem]} subtotal={10} totalsOnly />);

        expect(screen.queryByText(mockCartItem.name)).not.toBeInTheDocument();
        expect(screen.getAllByText(formatCurrency(10)).length).toBeGreaterThan(0);
    });

    it('muestra placeholder cuando el ítem no tiene imagen', () => {
        render(
            <OrderSummary
                items={[{ ...mockCartItem, imageUrl: '' }]}
                subtotal={10}
                totalsOnly={false}
            />
        );

        expect(screen.getByRole('img')).toHaveAttribute('src', '/images/product-placeholder.svg');
    });
});
