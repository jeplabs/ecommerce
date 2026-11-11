import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAdminUser, mockUserProfile } from '@/test/msw/fixtures/auth';
import AdminUsersTable from './AdminUsersTable';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('AdminUsersTable', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    it('muestra estados de carga, error y lista vacía', () => {
        const { rerender } = render(
            <MemoryRouter>
                <AdminUsersTable
                    users={[]}
                    loading
                    error={null}
                    desactivarUsuario={vi.fn()}
                    activarUsuario={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('Cargando usuarios…')).toBeInTheDocument();

        rerender(
            <MemoryRouter>
                <AdminUsersTable
                    users={[]}
                    loading={false}
                    error="Error de red"
                    desactivarUsuario={vi.fn()}
                    activarUsuario={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByRole('alert')).toHaveTextContent('Error de red');

        rerender(
            <MemoryRouter>
                <AdminUsersTable
                    users={[]}
                    loading={false}
                    error={null}
                    desactivarUsuario={vi.fn()}
                    activarUsuario={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('No hay usuarios registrados.')).toBeInTheDocument();
    });

    it('renderiza usuarios y ejecuta acciones de editar, desactivar y activar tras confirmar', () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const desactivarUsuario = vi.fn();
        const activarUsuario = vi.fn();

        const users = [
            { ...mockAdminUser, activo: true, bloqueado: false },
            { ...mockUserProfile, activo: false, bloqueado: true },
        ];

        render(
            <MemoryRouter>
                <AdminUsersTable
                    users={users}
                    loading={false}
                    error={null}
                    desactivarUsuario={desactivarUsuario}
                    activarUsuario={activarUsuario}
                />
            </MemoryRouter>
        );

        expect(screen.getByText('Administrador')).toBeInTheDocument();
        expect(screen.getByText('Cliente')).toBeInTheDocument();
        expect(screen.getByText('Activo')).toBeInTheDocument();
        expect(screen.getByText('Inactivo')).toBeInTheDocument();
        expect(screen.getByText('Bloqueado')).toBeInTheDocument();

        const editBtns = screen.getAllByRole('button', { name: 'Editar' });
        fireEvent.click(editBtns[0]!);
        expect(mockNavigate).toHaveBeenCalledWith(`/admin/users/${mockAdminUser.id}/edit`);

        fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }));
        expect(confirmSpy).toHaveBeenCalled();
        expect(desactivarUsuario).toHaveBeenCalledWith(mockAdminUser.id);

        fireEvent.click(screen.getByRole('button', { name: 'Activar' }));
        expect(activarUsuario).toHaveBeenCalledWith(mockUserProfile.id);

        confirmSpy.mockRestore();
    });
});
