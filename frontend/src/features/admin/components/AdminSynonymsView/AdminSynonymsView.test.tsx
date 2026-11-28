import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicSynonyms } from '@/test/msw/fixtures/synonyms-registry';
import { extractNormalizedUniqueTerms } from '../SynonymModalForm';
import AdminSynonymsView from './AdminSynonymsView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/sinonimos']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminSynonymsView', () => {
    beforeEach(() => {
        resetDynamicSynonyms();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('renderiza título, estadísticas y los grupos de sinónimos de MSW', async () => {
        renderWithProviders(<AdminSynonymsView />);

        expect(
            screen.getByRole('heading', { name: /Sinónimos de Búsqueda/i })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('laptops')).toBeInTheDocument();
            expect(screen.getByText('audio')).toBeInTheDocument();
            expect(screen.getByText('monitores')).toBeInTheDocument();
        });

        expect(screen.getByText('ultrabook')).toBeInTheDocument();
        expect(screen.getByText('auriculares')).toBeInTheDocument();
    });

    it('filtra grupos en tiempo real por nombre de grupo o por término equivalente', async () => {
        renderWithProviders(<AdminSynonymsView />);

        await waitFor(() => {
            expect(screen.getByText('laptops')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText(/Buscar por grupo o término/i);
        fireEvent.change(searchInput, { target: { value: 'headset' } });

        expect(screen.getByText('audio')).toBeInTheDocument();
        expect(screen.queryByText('laptops')).not.toBeInTheDocument();
    });

    it('valida mínimo 2 términos y permite crear un nuevo grupo de sinónimos', async () => {
        renderWithProviders(<AdminSynonymsView />);

        await waitFor(() => {
            expect(screen.getByText('laptops')).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole('button', { name: /\+ Nuevo Grupo de Sinónimos/i })
        );

        const groupInput = screen.getByLabelText(/Nombre del grupo/i);
        const termsInput = screen.getByLabelText(/Términos equivalentes/i);

        fireEvent.change(groupInput, { target: { value: 'ratones' } });
        fireEvent.change(termsInput, { target: { value: 'Ratón' } });

        fireEvent.click(screen.getByRole('button', { name: /Crear grupo/i }));

        expect(
            screen.getByText(/al menos 2 términos alfanuméricos distintos/i)
        ).toBeInTheDocument();

        fireEvent.change(termsInput, { target: { value: 'Ratón, Mouse, Trackball' } });
        fireEvent.click(screen.getByRole('button', { name: /Crear grupo/i }));

        await waitFor(() => {
            expect(screen.getByText('ratones')).toBeInTheDocument();
            expect(screen.getByText('trackball')).toBeInTheDocument();
        });
    });

    it('permite pausar/activar y eliminar un grupo de sinónimos', async () => {
        renderWithProviders(<AdminSynonymsView />);

        await waitFor(() => {
            expect(screen.getByText('laptops')).toBeInTheDocument();
        });

        const pauseBtn = screen.getByRole('button', { name: /Pausar grupo laptops/i });
        fireEvent.click(pauseBtn);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /Activar grupo laptops/i })
            ).toBeInTheDocument();
        });

        const deleteBtn = screen.getByRole('button', { name: /Eliminar grupo laptops/i });
        fireEvent.click(deleteBtn);

        const confirmBtn = screen.getByRole('button', {
            name: /Eliminar definitivamente/i,
        });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.queryByText('laptops')).not.toBeInTheDocument();
        });
    });

    it('extractNormalizedUniqueTerms normaliza tildes y descarta duplicados o términos de 1 carácter', () => {
        expect(
            extractNormalizedUniqueTerms('Portátil, portatil, Notebook, a,  ULTRABOOK! ')
        ).toEqual(['portatil', 'notebook', 'ultrabook']);
    });
});
