import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../BankTransferAccounts/BankTransferAccounts', () => ({
    default: () => <div>Cuentas bancarias mock</div>,
}));

import SimulatedBankTransferForm from './SimulatedBankTransferForm';

describe('SimulatedBankTransferForm', () => {
    it('muestra la instrucción de transferencia y las cuentas', () => {
        render(<SimulatedBankTransferForm />);

        expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
        expect(screen.getByText('Pago pendiente')).toBeInTheDocument();
        expect(screen.getByText(/Tu pedido se registrará/)).toBeInTheDocument();
        expect(screen.getByText('Cuentas bancarias mock')).toBeInTheDocument();
    });
});
