import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminBranchesTable from './AdminBranchesTable';
import type { BranchApi } from '../../types';

describe('AdminBranchesTable', () => {
    const mockBranches: BranchApi[] = [
        {
            id: 1,
            nombre: 'Tienda Centro',
            direccion: 'Av. Principal 123',
            ciudad: 'Ciudad de Guatemala',
            estado: 'Guatemala',
            codigoPostal: '01001',
            pais: 'GT',
            telefono: '+502 2345-6789',
            horario: 'Lun-Vie: 9:00-18:00',
            referencias: 'Frente al parque',
            mapaUrl: null,
            activo: true,
            ordenVisualizacion: 1,
        },
        {
            id: 2,
            nombre: 'Tienda Zona 10',
            direccion: 'Boulevard Los Proceres 5-50',
            ciudad: 'Ciudad de Guatemala',
            estado: 'Guatemala',
            codigoPostal: '01010',
            pais: 'GT',
            telefono: '+502 2456-7890',
            horario: 'Lun-Vie: 10:00-19:00',
            referencias: null,
            mapaUrl: null,
            activo: false,
            ordenVisualizacion: 2,
        },
    ];

    it('renderiza la lista de sucursales con orden, ubicación y estado', () => {
        render(
            <AdminBranchesTable
                branches={mockBranches}
                onEdit={vi.fn()}
                onToggleStatus={vi.fn()}
            />
        );

        expect(screen.getByText('Tienda Centro')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText(/Av\. Principal 123/)).toBeInTheDocument();
        expect(screen.getByText(/● Activa/)).toBeInTheDocument();

        expect(screen.getByText('Tienda Zona 10')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText(/○ Inactiva/)).toBeInTheDocument();
    });

    it('ejecuta onEdit al hacer clic en el botón Editar', () => {
        const onEdit = vi.fn();
        render(
            <AdminBranchesTable
                branches={mockBranches}
                onEdit={onEdit}
                onToggleStatus={vi.fn()}
            />
        );

        const editBtns = screen.getAllByRole('button', { name: /editar/i });
        fireEvent.click(editBtns[0]);

        expect(onEdit).toHaveBeenCalledWith(mockBranches[0]);
    });

    it('ejecuta onToggleStatus con la acción correcta de activar/desactivar', () => {
        const onToggleStatus = vi.fn();
        render(
            <AdminBranchesTable
                branches={mockBranches}
                onEdit={vi.fn()}
                onToggleStatus={onToggleStatus}
            />
        );

        const deactivateBtn = screen.getByRole('button', {
            name: /desactivar tienda centro/i,
        });
        fireEvent.click(deactivateBtn);
        expect(onToggleStatus).toHaveBeenCalledWith(mockBranches[0]);

        const activateBtn = screen.getByRole('button', {
            name: /activar tienda zona 10/i,
        });
        fireEvent.click(activateBtn);
        expect(onToggleStatus).toHaveBeenCalledWith(mockBranches[1]);
    });

    it('muestra estado de carga mientras carga', () => {
        render(
            <AdminBranchesTable
                branches={[]}
                loading
                onEdit={vi.fn()}
                onToggleStatus={vi.fn()}
            />
        );

        expect(screen.getByText(/Cargando listado de sucursales/i)).toBeInTheDocument();
    });

    it('muestra estado vacío si no hay sucursales registradas', () => {
        render(
            <AdminBranchesTable
                branches={[]}
                onEdit={vi.fn()}
                onToggleStatus={vi.fn()}
            />
        );

        expect(screen.getByText(/No hay sucursales registradas/i)).toBeInTheDocument();
    });
});
