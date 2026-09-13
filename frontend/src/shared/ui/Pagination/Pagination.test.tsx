import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
    });

    it('no se renderiza si totalPages <= 1', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renderiza correctamente los botones de navegación y páginas cuando totalPages > 1', () => {
        render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);

        expect(screen.getByRole('navigation', { name: 'Paginación de resultados' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ir a la página anterior' })).not.toBeDisabled();
        expect(screen.getByRole('button', { name: 'Ir a la página siguiente' })).not.toBeDisabled();

        expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    });

    it('deshabilita el botón Anterior en la primera página', () => {
        render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Ir a la página anterior' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Ir a la página siguiente' })).not.toBeDisabled();
    });

    it('deshabilita el botón Siguiente en la última página', () => {
        render(<Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Ir a la página anterior' })).not.toBeDisabled();
        expect(screen.getByRole('button', { name: 'Ir a la página siguiente' })).toBeDisabled();
    });

    it('llama a onPageChange al hacer clic en un número de página o en Siguiente', async () => {
        const user = userEvent.setup();
        const handlePageChange = vi.fn();

        render(<Pagination currentPage={1} totalPages={4} onPageChange={handlePageChange} />);

        await user.click(screen.getByRole('button', { name: 'Página 3' }));
        expect(handlePageChange).toHaveBeenCalledWith(3);

        await user.click(screen.getByRole('button', { name: 'Ir a la página siguiente' }));
        expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('muestra elipsis cuando hay muchas páginas', () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Página 10' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Página 5' })).toHaveAttribute('aria-current', 'page');
    });
});

