import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import OrderSummary from './OrderSummary';
import { mockCartItem } from '@/test/checkoutMock';

describe('Accesibilidad — OrderSummary (Paso 4: Carrito y Checkout)', () => {
    it('el resumen de compra con desglose y productos cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <OrderSummary
                items={[mockCartItem]}
                subtotal={199.98}
                shippingCostInTotal={5.99}
                total={205.97}
            />
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el resumen con envío gratis cumple con las normas de accesibilidad', async () => {
        const { container } = render(
            <OrderSummary
                items={[mockCartItem]}
                subtotal={200}
                shippingCostInTotal={0}
                servicioCostos={{ tarifa: 5.99, enLinea: 5.99, contraEntrega: 5.99 }}
            />
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
