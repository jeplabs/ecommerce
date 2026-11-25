import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminBannersView from './AdminBannersView';
import { resetDynamicBanners } from '@/test/msw/fixtures/banners-registry';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/banners']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminBannersView', () => {
    beforeEach(() => {
        resetDynamicBanners();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('renderiza título, estadísticas y los banners de prueba de MSW', async () => {
        renderWithProviders(<AdminBannersView />);

        expect(
            screen.getByRole('heading', { name: /gestión de banners del home/i })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\+ nuevo banner/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Tecnología de Vanguardia')).toBeInTheDocument();
            expect(screen.getByText('Audio & Auriculares Pro')).toBeInTheDocument();
        });

        expect(screen.getByText(/total de banners:/i)).toBeInTheDocument();
        expect(screen.getByText(/activos en tienda:/i)).toBeInTheDocument();
    });

    it('abre el modal de creación al pulsar el botón + Nuevo Banner', async () => {
        renderWithProviders(<AdminBannersView />);

        await waitFor(() => {
            expect(screen.getByText('Tecnología de Vanguardia')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /\+ nuevo banner/i }));

        expect(screen.getByRole('heading', { name: /nuevo banner para home/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/título descriptivo/i)).toBeInTheDocument();
    });

    it('abre el modal de confirmación de eliminación al pulsar Eliminar', async () => {
        renderWithProviders(<AdminBannersView />);

        await waitFor(() => {
            expect(screen.getByText('Tecnología de Vanguardia')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
        fireEvent.click(deleteButtons[0]!);

        expect(screen.getByRole('heading', { name: 'Eliminar banner' })).toBeInTheDocument();
        expect(screen.getByText(/¿estás seguro de que deseas eliminar definitivamente/i)).toBeInTheDocument();
    });
});
