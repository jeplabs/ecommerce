import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimulatedQPayProForm from './SimulatedQPayProForm';

describe('SimulatedQPayProForm', () => {
    it('muestra el flujo y las características del pago simulado', () => {
        render(<SimulatedQPayProForm />);

        expect(screen.getByText('QPayPro')).toBeInTheDocument();
        expect(screen.getByText(/Visa · Mastercard · Guatemala/)).toBeInTheDocument();
        expect(
            screen.getByText(/Al confirmar el pago se te redirigirá al sitio de QPayPro/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Pago con tarjeta de crédito o débito/i)
        ).toBeInTheDocument();
    });
});
