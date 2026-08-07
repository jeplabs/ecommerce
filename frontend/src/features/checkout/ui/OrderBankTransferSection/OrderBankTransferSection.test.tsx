import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/entities/order', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/entities/order')>();
    return {
        ...mod,
        subirComprobanteOrder: vi.fn(),
    };
});

vi.mock('../BankTransferAccounts/BankTransferAccounts', () => ({
    default: () => <div>Cuentas bancarias</div>,
}));

import { subirComprobanteOrder } from '@/entities/order';
import OrderBankTransferSection from './OrderBankTransferSection';
import {
    findDynamicOrder,
    MOCK_ORDER_TRANSFER_ID,
    resetDynamicOrders,
} from '@/test/msw/fixtures/orders-registry';

const subirComprobanteMock = vi.mocked(subirComprobanteOrder);

resetDynamicOrders();
const orden = findDynamicOrder(MOCK_ORDER_TRANSFER_ID)!;

function makeFile(name: string, bytes: number, type = 'application/pdf') {
    return new File([new ArrayBuffer(bytes)], name, { type });
}

function setup(overrides: Partial<typeof orden> = {}) {
    return {
        ...orden,
        ...overrides,
    };
}

describe('OrderBankTransferSection', () => {
    it('muestra el título, las cuentas y el formulario deshabilitado', () => {
        render(<OrderBankTransferSection orden={orden} />);

        expect(screen.getByText('Pago por transferencia bancaria')).toBeInTheDocument();
        expect(screen.getByText('Cuentas bancarias')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Enviar comprobante' })
        ).toBeDisabled();
        expect(
            screen.getByText(/PNG, JPG o PDF · peso máximo/)
        ).toBeInTheDocument();
    });

    it('rechaza archivos que superan los 5 MB', async () => {
        const user = userEvent.setup();
        render(<OrderBankTransferSection orden={orden} />);

        const input = screen.getByLabelText(/Comprobante de transferencia/);
        await user.upload(input, makeFile('grande.pdf', 6 * 1024 * 1024));

        expect(screen.getByRole('alert')).toHaveTextContent(
            'El archivo supera los 5 MB'
        );
        expect(screen.queryByText('grande.pdf')).not.toBeInTheDocument();
    });

    it('muestra el archivo seleccionado y su tamaño', async () => {
        const user = userEvent.setup();
        render(<OrderBankTransferSection orden={orden} />);

        const input = screen.getByLabelText(/Comprobante de transferencia/);
        await user.upload(input, makeFile('comprobante.pdf', 2048));

        expect(screen.getByText('comprobante.pdf')).toBeInTheDocument();
        expect(screen.getByText('2.0 KB')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Enviar comprobante' })
        ).toBeEnabled();
    });

    it('muestra el tamaño en MB para archivos grandes', async () => {
        const user = userEvent.setup();
        render(<OrderBankTransferSection orden={orden} />);

        const input = screen.getByLabelText(/Comprobante de transferencia/);
        await user.upload(input, makeFile('pesado.pdf', 2 * 1024 * 1024));

        expect(screen.getByText('2.0 MB')).toBeInTheDocument();
    });

    it('abre el selector de archivo al hacer clic en Elegir archivo', () => {
        render(<OrderBankTransferSection orden={orden} />);

        fireEvent.click(screen.getByRole('button', { name: 'Elegir archivo' }));
    });

    it('pide seleccionar archivo si se envía vacío', () => {
        render(<OrderBankTransferSection orden={orden} />);

        const form = screen.getByLabelText(/Comprobante de transferencia/).closest('form')!;
        fireEvent.submit(form);

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Selecciona un archivo de comprobante'
        );
    });

    it('sube el comprobante y muestra la confirmación', async () => {
        const user = userEvent.setup();
        const onComprobanteSaved = vi.fn();
        const updated = setup({
            comprobanteUrl: 'https://cdn.example/comprobante.pdf',
            comprobanteNombre: 'comprobante.pdf',
            comprobanteFecha: '2026-05-28T15:00:00',
        });
        subirComprobanteMock.mockResolvedValue(updated);

        render(
            <OrderBankTransferSection orden={orden} onComprobanteSaved={onComprobanteSaved} />
        );

        const input = screen.getByLabelText(/Comprobante de transferencia/);
        await user.upload(input, makeFile('recibo.pdf', 512));
        await user.click(screen.getByRole('button', { name: 'Enviar comprobante' }));

        await waitFor(() =>
            expect(subirComprobanteMock).toHaveBeenCalledWith(
                orden.id,
                expect.any(File)
            )
        );

        expect(
            screen.getByRole('status')
        ).toHaveTextContent('Comprobante guardado. Validaremos tu pago pronto.');
        expect(screen.getByRole('link', { name: 'comprobante.pdf' })).toHaveAttribute(
            'href',
            updated.comprobanteUrl
        );
        expect(screen.getByRole('button', { name: 'Actualizar comprobante' })).toBeDisabled();
        expect(onComprobanteSaved).toHaveBeenCalled();
    });

    it('muestra el mensaje de error si falla la subida', async () => {
        const user = userEvent.setup();
        subirComprobanteMock.mockRejectedValue(new Error('Error al subir el comprobante'));

        render(<OrderBankTransferSection orden={orden} />);

        const input = screen.getByLabelText(/Comprobante de transferencia/);
        await user.upload(input, makeFile('recibo.pdf', 512));
        await user.click(screen.getByRole('button', { name: 'Enviar comprobante' }));

        await waitFor(() =>
            expect(screen.getByRole('alert')).toHaveTextContent(
                'Error al subir el comprobante'
            )
        );
    });

    it('muestra el comprobante previo si la orden ya lo tiene', () => {
        render(
            <OrderBankTransferSection
                orden={setup({
                    comprobanteUrl: 'https://cdn.example/previo.pdf',
                    comprobanteNombre: 'previo.pdf',
                    comprobanteFecha: '2026-05-28T15:00:00',
                })}
            />
        );

        expect(screen.getByText('Comprobante enviado')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'previo.pdf' })).toHaveAttribute(
            'href',
            'https://cdn.example/previo.pdf'
        );
        expect(screen.getByRole('status')).toHaveTextContent('Comprobante guardado');
        expect(
            screen.getByRole('button', { name: 'Actualizar comprobante' })
        ).toBeDisabled();
    });
});
