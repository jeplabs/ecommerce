import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SimulatedMercadoPagoForm from './SimulatedMercadoPagoForm';

describe('SimulatedMercadoPagoForm', () => {
    it('muestra el banner y las instrucciones de la demo', () => {
        render(<SimulatedMercadoPagoForm />);

        expect(screen.getByText('Mercado Pago')).toBeInTheDocument();
        expect(screen.getByText('Checkout Pro · Demo')).toBeInTheDocument();
        expect(
            screen.getByText(/Al confirmar el pago se simulará la redirección/)
        ).toBeInTheDocument();
        expect(screen.getByText('Tarjetas de crédito y débito')).toBeInTheDocument();
        expect(screen.getByText('Dinero en cuenta Mercado Pago')).toBeInTheDocument();
        expect(screen.getByText('Cuotas sin tarjeta (simulado)')).toBeInTheDocument();
        expect(
            screen.getByText(/Tarjeta de prueba aprobada:/)
        ).toBeInTheDocument();
    });
});
