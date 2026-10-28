import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('NotFoundPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renderiza el código 404, encabezado principal y mensaje de ayuda', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: /página no encontrada/i })).toBeInTheDocument();
        expect(
            screen.getByText(/lo sentimos, la página que buscas no existe/i)
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ir al inicio/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /explorar catálogo/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /volver atrás/i })).toBeInTheDocument();
    });

    it('actualiza el document.title al montar y lo restaura al desmontar', () => {
        document.title = 'Título Original';
        const { unmount } = render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(document.title).toBe('404 - Página no encontrada | Tienda');

        unmount();
        expect(document.title).toBe('Título Original');
    });

    it('navega al inicio al presionar "Ir al inicio"', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: /ir al inicio/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navega al catálogo al presionar "Explorar catálogo"', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: /explorar catálogo/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/catalogo');
    });

    it('vuelve a la página anterior al presionar "Volver atrás"', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: /volver atrás/i }));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});

describe('NotFoundPage Router Integration', () => {
    it('se monta automáticamente cuando una ruta desconocida es accedida', () => {
        render(
            <MemoryRouter initialEntries={['/ruta-que-definitivamente-no-existe-999']}>
                <Routes>
                    <Route path="/" element={<div>Inicio</div>} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: /página no encontrada/i })).toBeInTheDocument();
        expect(screen.getByText('404')).toBeInTheDocument();
    });
});

