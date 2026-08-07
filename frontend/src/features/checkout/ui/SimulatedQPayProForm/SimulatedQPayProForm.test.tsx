import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimulatedQPayProForm from './SimulatedQPayProForm';

describe('SimulatedQPayProForm', () => {
    it('muestra el flujo y las características del pago simulado', () => {
        render(<SimulatedQPayProForm />);

        expect(screen.getByText('QPayPro')).toBeInTheDocument();
        expect(screen.getByText('1. Comercio')).toBeInTheDocument();
        expect(screen.getByText('2. Banco')).toBeInTheDocument();
        expect(screen.getByText('3. Confirmación')).toBeInTheDocument();
        expect(screen.getByText(/No se realizará ningún cargo real/)).toBeInTheDocument();
        expect(screen.getByText('Pago con tarjeta de crédito o débito')).toBeInTheDocument();
    });
});
