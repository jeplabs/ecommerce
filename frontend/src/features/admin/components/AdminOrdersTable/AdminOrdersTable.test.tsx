import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDynamicOrders, resetDynamicOrders } from '@/test/msw/fixtures/orders-registry';
import AdminOrdersTable from './AdminOrdersTable';

describe('AdminOrdersTable', () => {
    beforeEach(() => {
        resetDynamicOrders();
    });

    it('muestra estado de carga cuando loading es true sin órdenes', () => {
        render(
            <AdminOrdersTable
                ordenes={[]}
                loading
                error={null}
                updatingId={null}
                onSaveEstado={vi.fn()}
                onVerDetalle={vi.fn()}
            />
        );

        expect(screen.getByText('Cargando pedidos…')).toBeInTheDocument();
    });

    it('muestra alerta de error y estado vacío cuando corresponde', () => {
        const { rerender } = render(
            <AdminOrdersTable
                ordenes={[]}
                loading={false}
                error="No autorizado"
                updatingId={null}
                onSaveEstado={vi.fn()}
                onVerDetalle={vi.fn()}
            />
        );

        expect(screen.getByRole('alert')).toHaveTextContent('No autorizado');

        rerender(
            <AdminOrdersTable
                ordenes={[]}
                loading={false}
                error={null}
                updatingId={null}
                onSaveEstado={vi.fn()}
                onVerDetalle={vi.fn()}
            />
        );

        expect(screen.getByText('No hay pedidos con el criterio seleccionado.')).toBeInTheDocument();
    });

    it('permite cambiar estado solo cuando hay cambios y dispara onSaveEstado / onVerDetalle', () => {
        const sample = getDynamicOrders();
        const ordenes = [
            { ...sample[0]!, id: 501, estado: 'PENDIENTE' as const },
            { ...sample[1]!, id: 502, estado: 'CANCELADA' as const },
        ];
        const onSaveEstado = vi.fn();
        const onVerDetalle = vi.fn();

        render(
            <AdminOrdersTable
                ordenes={ordenes}
                loading={false}
                error={null}
                updatingId={null}
                onSaveEstado={onSaveEstado}
                onVerDetalle={onVerDetalle}
            />
        );

        const saveButtons = screen.getAllByRole('button', { name: 'Guardar' });
        expect(saveButtons[0]).toBeDisabled();
        expect(saveButtons[1]).toBeDisabled();

        const selectPending = screen.getByLabelText('Cambiar estado del pedido 501');
        const selectCancelled = screen.getByLabelText('Cambiar estado del pedido 502');
        expect(selectCancelled).toBeDisabled();

        fireEvent.change(selectPending, { target: { value: 'CONFIRMADA' } });
        expect(saveButtons[0]).not.toBeDisabled();

        fireEvent.click(saveButtons[0]!);
        expect(onSaveEstado).toHaveBeenCalledWith(501, 'CONFIRMADA');

        const detailButtons = screen.getAllByRole('button', { name: 'Ver detalle' });
        fireEvent.click(detailButtons[0]!);
        expect(onVerDetalle).toHaveBeenCalledWith(501);
    });
});
