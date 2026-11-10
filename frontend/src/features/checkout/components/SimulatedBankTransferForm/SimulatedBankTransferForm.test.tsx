import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimulatedBankTransferForm from './SimulatedBankTransferForm';

describe('SimulatedBankTransferForm', () => {
    it('muestra la instrucción de transferencia y las cuentas', () => {
        render(<SimulatedBankTransferForm />);

        expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
        expect(screen.getByText('Pago pendiente')).toBeInTheDocument();
        expect(
            screen.getByText(/Transfiere o deposita el monto total/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/El pedido quedará registrado como/i)
        ).toBeInTheDocument();
    });
});
