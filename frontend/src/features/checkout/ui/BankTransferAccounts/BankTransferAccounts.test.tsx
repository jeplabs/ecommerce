import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/entities/order/api/orderApi', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/entities/order/api/orderApi')>();
    return {
        ...mod,
        listarCuentasBancarias: vi.fn(),
    };
});

import { listarCuentasBancarias } from '@/entities/order/api/orderApi';
import BankTransferAccounts from './BankTransferAccounts';
import { formatCurrency } from '@/shared/lib/format';

const listarCuentasMock = vi.mocked(listarCuentasBancarias);

const cuentasMock = [
    {
        id: 1,
        banco: 'Banco Demo',
        titular: 'JEPLabs',
        tipoCuenta: 'Corriente',
        numeroCuenta: '001-002-003',
        moneda: 'GTQ',
        activo: true,
        ordenViualizacion: 1,
    },
];

describe('BankTransferAccounts', () => {
    it('muestra el estado de carga mientras consulta', () => {
        listarCuentasMock.mockReturnValue(new Promise(() => {}));
        render(<BankTransferAccounts />);

        expect(screen.getByText('Cargando cuentas bancarias…')).toBeInTheDocument();
    });

    it('muestra las cuentas y el hint por defecto', async () => {
        listarCuentasMock.mockResolvedValue(cuentasMock as never);
        render(<BankTransferAccounts />);

        await waitFor(() =>
            expect(screen.getAllByText('Banco Demo').length).toBeGreaterThan(0)
        );

        expect(screen.getByText('JEPLabs')).toBeInTheDocument();
        expect(screen.getByText('Corriente')).toBeInTheDocument();
        expect(screen.getByText('001-002-003')).toBeInTheDocument();
        expect(screen.getByText(/Realiza la transferencia o depósito/)).toBeInTheDocument();
    });

    it('muestra el pedido y monto cuando recibe orderId y total', async () => {
        listarCuentasMock.mockResolvedValue(cuentasMock as never);
        render(<BankTransferAccounts orderId={505} total={250} />);

        await waitFor(() =>
            expect(screen.getAllByText('Banco Demo').length).toBeGreaterThan(0)
        );

        expect(screen.getByText(/Pedido #505/)).toBeInTheDocument();
        expect(screen.getByText(formatCurrency(250))).toBeInTheDocument();
    });

    it('oculta el hint en modo compact', async () => {
        listarCuentasMock.mockResolvedValue(cuentasMock as never);
        render(<BankTransferAccounts orderId={505} total={250} compact />);

        await waitFor(() =>
            expect(screen.getAllByText('Banco Demo').length).toBeGreaterThan(0)
        );

        expect(screen.queryByText(/Pedido #505/)).not.toBeInTheDocument();
    });

    it('vuelve a la lista vacía y registra el error si falla', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        listarCuentasMock.mockRejectedValue(new Error('Fallo'));
        render(<BankTransferAccounts />);

        await waitFor(() =>
            expect(consoleError).toHaveBeenCalledWith(
                'Error al listar cuentas bancarias',
                expect.any(Error)
            )
        );

        expect(screen.queryByText('Banco Demo')).not.toBeInTheDocument();
        consoleError.mockRestore();
    });
});
