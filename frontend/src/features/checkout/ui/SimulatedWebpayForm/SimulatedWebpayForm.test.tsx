import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimulatedWebpayForm from './SimulatedWebpayForm';

describe('SimulatedWebpayForm', () => {
    it('muestra la redirección simulada a Transbank', () => {
        render(<SimulatedWebpayForm />);

        expect(screen.getByText('Webpay Plus')).toBeInTheDocument();
        expect(screen.getByText(/simulará la redirección a Transbank/)).toBeInTheDocument();
        expect(screen.getByText('Pago con tarjeta de crédito o débito')).toBeInTheDocument();
    });
});
