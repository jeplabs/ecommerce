import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/entities/order/api/orderApi', () => ({
    listarCuentasBancarias: vi.fn(),
}));

import { listarCuentasBancarias } from '@/entities/order/api/orderApi';
import BankTransferModal from './BankTransferModal';

const listarCuentasMock = vi.mocked(listarCuentasBancarias);

describe('BankTransferModal', () => {
    it('no renderiza nada cuando isOpen es false', () => {
        const { container } = render(
            <BankTransferModal isOpen={false} onClose={vi.fn()} orderId={123} total={45000} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renderiza título, monto y cuentas cuando isOpen es true', async () => {
        listarCuentasMock.mockResolvedValue([
            {
                id: 1,
                banco: 'Banco Industrial',
                titular: 'Empresa SA',
                tipoCuenta: 'Monetaria',
                numeroCuenta: '12345678',
                moneda: 'GTQ',
                activo: true,
            },
        ]);

        const handleClose = vi.fn();
        render(
            <BankTransferModal isOpen={true} onClose={handleClose} orderId={789} total={25000} />
        );

        expect(screen.getByText('Datos para transferir')).toBeInTheDocument();
        expect(screen.getByText(/Pedido #789/)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByText('Banco Industrial').length).toBeGreaterThan(0);
            expect(screen.getByText('12345678')).toBeInTheDocument();
        });

        // Click en botón Entendido llama a onClose
        const entendidoBtn = screen.getByRole('button', { name: 'Entendido' });
        fireEvent.click(entendidoBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('permite cerrar con el botón ✕', async () => {
        listarCuentasMock.mockResolvedValue([]);
        const handleClose = vi.fn();
        render(
            <BankTransferModal isOpen={true} onClose={handleClose} orderId={100} total={1000} />
        );

        await waitFor(() => {
            expect(listarCuentasMock).toHaveBeenCalled();
        });

        const closeBtn = screen.getByRole('button', { name: 'Cerrar modal' });
        fireEvent.click(closeBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('permite cerrar con la tecla Escape', async () => {
        listarCuentasMock.mockResolvedValue([]);
        const handleClose = vi.fn();
        render(
            <BankTransferModal isOpen={true} onClose={handleClose} orderId={100} total={1000} />
        );

        await waitFor(() => {
            expect(listarCuentasMock).toHaveBeenCalled();
        });

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
