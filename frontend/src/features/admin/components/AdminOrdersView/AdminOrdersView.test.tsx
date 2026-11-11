import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { clearAuthTokens, setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import {
    MOCK_ORDER_PENDING_ID,
    MOCK_ORDER_SHIPPED_ID,
    resetDynamicOrders,
} from '@/test/msw/fixtures/orders-registry';
import AdminOrdersView from './AdminOrdersView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/orders']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminOrdersView', () => {
    beforeEach(() => {
        resetDynamicOrders();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    afterEach(() => {
        clearAuthTokens();
    });

    it('carga la lista de pedidos, filtra por estado y permite ver detalle', async () => {
        renderWithProviders(<AdminOrdersView />);

        expect(
            screen.getByRole('heading', { name: 'Historial de pedidos' })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getByLabelText(`Cambiar estado del pedido ${MOCK_ORDER_PENDING_ID}`)
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText(`Cambiar estado del pedido ${MOCK_ORDER_SHIPPED_ID}`)
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                (_, el) => el?.tagName === 'P' && /pedidos? en total/i.test(el.textContent ?? '')
            )
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Filtrar por estado'), {
            target: { value: 'ENVIADA' },
        });

        await waitFor(() => {
            expect(
                screen.queryByLabelText(`Cambiar estado del pedido ${MOCK_ORDER_PENDING_ID}`)
            ).not.toBeInTheDocument();
            expect(
                screen.getByLabelText(`Cambiar estado del pedido ${MOCK_ORDER_SHIPPED_ID}`)
            ).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Ver detalle' }));

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    it('permite cambiar el estado de una orden pendiente y guardarlo', async () => {
        renderWithProviders(<AdminOrdersView />);

        const selectEstado = (await screen.findByLabelText(
            `Cambiar estado del pedido ${MOCK_ORDER_PENDING_ID}`
        )) as HTMLSelectElement;

        fireEvent.change(selectEstado, { target: { value: 'CONFIRMADA' } });
        expect(selectEstado.value).toBe('CONFIRMADA');

        await waitFor(() => {
            const currentRow = screen
                .getByLabelText(`Cambiar estado del pedido ${MOCK_ORDER_PENDING_ID}`)
                .closest('tr');
            expect(within(currentRow!).getByRole('button', { name: 'Guardar' })).not.toBeDisabled();
        });

        const currentRow = screen
            .getByLabelText(`Cambiar estado del pedido ${MOCK_ORDER_PENDING_ID}`)
            .closest('tr');
        fireEvent.click(within(currentRow!).getByRole('button', { name: 'Guardar' }));

        await waitFor(() => {
            expect(
                (
                    screen.getByLabelText(
                        `Cambiar estado del pedido ${MOCK_ORDER_PENDING_ID}`
                    ) as HTMLSelectElement
                ).value
            ).toBe('CONFIRMADA');
        });
    });
});
