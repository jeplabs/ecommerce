import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CheckoutSuccessHeader from './CheckoutSuccessHeader';

describe('CheckoutSuccessHeader', () => {
    it('muestra éxito normal con el número de pedido', () => {
        render(<CheckoutSuccessHeader orderId={501} />);

        expect(screen.getByText('¡Compra realizada con éxito!')).toBeInTheDocument();
        expect(screen.getByText('#501')).toBeInTheDocument();
        expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('muestra el estado pendiente para transferencia bancaria', () => {
        render(<CheckoutSuccessHeader orderId="502" isBankTransfer />);

        expect(screen.getByText('Pedido registrado — pago pendiente')).toBeInTheDocument();
        expect(screen.getByText('⏳')).toBeInTheDocument();
        expect(screen.getByText('#502')).toBeInTheDocument();
    });
});
