import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/entities/order', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/entities/order')>();
    return {
        ...mod,
        listarCuentasBancarias: vi.fn(),
    };
});

import { listarCuentasBancarias } from '@/entities/order';
import OrderConfirmationSummary from './OrderConfirmationSummary';
import { formatCurrency, formatDateTime, formatEstadoOrden } from '@/shared/lib/format';
import { findDynamicOrder, MOCK_ORDER_PENDING_ID } from '@/test/msw/fixtures/orders-registry';

const listarCuentasMock = vi.mocked(listarCuentasBancarias);

function buildOrder(overrides: Partial<ReturnType<typeof findDynamicOrder>> = {}) {
    return {
        ...findDynamicOrder(MOCK_ORDER_PENDING_ID)!,
        ...overrides,
    };
}

describe('OrderConfirmationSummary', () => {
    it('no renderiza nada sin orden', () => {
        const { container } = render(<OrderConfirmationSummary orden={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('muestra el resumen completo de la compra', () => {
        const orden = buildOrder();
        render(<OrderConfirmationSummary orden={orden} />);

        expect(screen.getByText('Resumen del pedido')).toBeInTheDocument();
        expect(screen.getByText(formatDateTime(orden.creadoAt))).toBeInTheDocument();
        expect(screen.getByText(formatEstadoOrden(orden.estado))).toBeInTheDocument();
        expect(screen.getByText(orden.items[0]!.nombreProducto)).toBeInTheDocument();
        expect(screen.getByText(`SKU: ${orden.items[0]!.sku}`)).toBeInTheDocument();
        expect(screen.getAllByText(formatCurrency(orden.subtotal)).length).toBeGreaterThan(0);
        expect(screen.getByText(formatCurrency(orden.iva))).toBeInTheDocument();
        expect(screen.getByText(formatCurrency(orden.total))).toBeInTheDocument();
        expect(screen.getByText('Total pagado')).toBeInTheDocument();
    });

    it('muestra el costo de envío', () => {
        const orden = buildOrder();
        render(<OrderConfirmationSummary orden={orden} />);

        expect(screen.getByText(`Envío (${orden.servicioEnvio})`)).toBeInTheDocument();
        expect(screen.getAllByText(formatCurrency(orden.costoEnvio!)).length).toBeGreaterThan(0);
    });

    it('muestra "Gratis" para envío sin costo', () => {
        const orden = buildOrder({ costoEnvio: 0 });
        render(<OrderConfirmationSummary orden={orden} />);

        expect(screen.getAllByText('Gratis').length).toBeGreaterThan(0);
    });

    it('muestra "Contra entrega" cuando la forma de pago es contra entrega', () => {
        const orden = buildOrder({ formaPagoEnvio: 'CONTRA_ENTREGA' });
        render(<OrderConfirmationSummary orden={orden} />);

        expect(screen.getByText('Contra entrega')).toBeInTheDocument();
    });

    it('muestra los datos de la tarjeta cuando hay payment', () => {
        const orden = buildOrder();
        render(
            <OrderConfirmationSummary
                orden={orden}
                payment={{
                    transactionId: 'TX_001',
                    authorizationCode: 'AUTH1',
                    amount: orden.total,
                    provider: 'STRIPE',
                    last4: '4242',
                }}
            />
        );

        expect(screen.getByText('Pago')).toBeInTheDocument();
        expect(screen.getByText('STRIPE')).toBeInTheDocument();
        expect(screen.getByText('TX_001')).toBeInTheDocument();
        expect(screen.getByText('•••• 4242')).toBeInTheDocument();
    });

    it('oculta la fila de tarjeta cuando no hay last4', () => {
        const orden = buildOrder();
        render(
            <OrderConfirmationSummary
                orden={orden}
                payment={{
                    transactionId: 'TX_001',
                    authorizationCode: 'AUTH1',
                    amount: orden.total,
                    provider: 'WEBPAY',
                }}
            />
        );

        expect(screen.queryByText(/••••/)).not.toBeInTheDocument();
    });

    it('muestra los datos de transferencia cuando isBankTransfer es true', async () => {
        listarCuentasMock.mockResolvedValue([
            { id: 1, banco: 'Banco Demo', titular: 'X', tipoCuenta: 'A', numeroCuenta: '1', moneda: 'GTQ', activo: true },
        ] as never);
        const orden = buildOrder();
        render(<OrderConfirmationSummary orden={orden} isBankTransfer />);

        expect(screen.getByText('Datos para transferir')).toBeInTheDocument();
        expect(screen.getByText('Total a transferir')).toBeInTheDocument();

        await waitFor(() =>
            expect(screen.getAllByText('Banco Demo').length).toBeGreaterThan(0)
        );
    });

    it('detecta transferencia por metodoPago', () => {
        const orden = buildOrder({ metodoPago: 'TRANSFERENCIA' });
        render(<OrderConfirmationSummary orden={orden} />);

        expect(screen.getByText('Total a transferir')).toBeInTheDocument();
    });

    it('muestra las notas del pedido cuando existen', () => {
        const orden = buildOrder({ notas: '  Dejar en recepción  ' });
        render(<OrderConfirmationSummary orden={orden} />);

        expect(screen.getByText('Notas del pedido')).toBeInTheDocument();
        expect(screen.getByText('Dejar en recepción')).toBeInTheDocument();
    });
});
