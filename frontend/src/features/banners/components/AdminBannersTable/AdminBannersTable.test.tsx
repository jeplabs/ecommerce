import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminBannersTable } from './AdminBannersTable';
import type { BannerApi } from '../../types';

const mockBanners: BannerApi[] = [
    {
        id: 1,
        seccion: 'HERO_CAROUSEL',
        titulo: 'Banner 1',
        desktopUrl: 'https://test/1.png',
        mobileUrl: 'https://test/1-m.png',
        linkUrl: '/categoria/pc',
        orden: 1,
        activo: true,
        fechaInicio: null,
        fechaFin: null,
        createdAt: '2026-11-01T10:00:00',
        updatedAt: '2026-11-01T10:00:00',
    },
    {
        id: 2,
        seccion: 'HERO_CAROUSEL',
        titulo: 'Banner 2',
        desktopUrl: 'https://test/2.png',
        mobileUrl: null,
        linkUrl: null,
        orden: 2,
        activo: false,
        fechaInicio: null,
        fechaFin: null,
        createdAt: '2026-11-02T10:00:00',
        updatedAt: '2026-11-02T10:00:00',
    },
];

describe('AdminBannersTable', () => {
    it('muestra estado vacío cuando la lista no tiene elementos', () => {
        render(
            <AdminBannersTable
                banners={[]}
                onMoveUp={vi.fn()}
                onMoveDown={vi.fn()}
                onToggleEstado={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.getByText('No hay banners registrados para esta sección.')
        ).toBeInTheDocument();
    });

    it('renderiza las filas de banners con sus títulos, órdenes y badges', () => {
        render(
            <AdminBannersTable
                banners={mockBanners}
                onMoveUp={vi.fn()}
                onMoveDown={vi.fn()}
                onToggleEstado={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText('Banner 1')).toBeInTheDocument();
        expect(screen.getByText('Banner 2')).toBeInTheDocument();
        expect(screen.getByText('● Activo')).toBeInTheDocument();
        expect(screen.getByText('○ Pausado')).toBeInTheDocument();
        expect(screen.getByText('📱 M')).toBeInTheDocument();
    });

    it('deshabilita flecha arriba en el primer elemento y flecha abajo en el último', () => {
        render(
            <AdminBannersTable
                banners={mockBanners}
                onMoveUp={vi.fn()}
                onMoveDown={vi.fn()}
                onToggleEstado={vi.fn()}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        const upButtons = screen.getAllByTitle('Subir posición');
        const downButtons = screen.getAllByTitle('Bajar posición');

        expect(upButtons[0]).toBeDisabled();
        expect(upButtons[1]).not.toBeDisabled();

        expect(downButtons[0]).not.toBeDisabled();
        expect(downButtons[1]).toBeDisabled();
    });

    it('dispara onToggleEstado, onEdit y onDelete al pulsar los botones', () => {
        const onToggle = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <AdminBannersTable
                banners={mockBanners}
                onMoveUp={vi.fn()}
                onMoveDown={vi.fn()}
                onToggleEstado={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /pausar/i }));
        expect(onToggle).toHaveBeenCalledWith(1);

        const editButtons = screen.getAllByRole('button', { name: /editar/i });
        fireEvent.click(editButtons[0]!);
        expect(onEdit).toHaveBeenCalledWith(mockBanners[0]);

        const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
        fireEvent.click(deleteButtons[0]!);
        expect(onDelete).toHaveBeenCalledWith(mockBanners[0]);
    });
});
