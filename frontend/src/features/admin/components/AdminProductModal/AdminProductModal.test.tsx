import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminProductModal from './AdminProductModal';

describe('AdminProductModal', () => {
    it('no renderiza nada cuando isOpen es false', () => {
        render(
            <AdminProductModal
                isOpen={false}
                title="Crear Producto"
                onClose={vi.fn()}
            >
                <div>Contenido del formulario</div>
            </AdminProductModal>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText('Contenido del formulario')).not.toBeInTheDocument();
    });

    it('renderiza título accesible, contenido y botones de cierre', () => {
        const onClose = vi.fn();
        render(
            <AdminProductModal
                isOpen={true}
                title="Crear Producto"
                onClose={onClose}
            >
                <div>Contenido del formulario</div>
            </AdminProductModal>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Crear Producto' })).toBeInTheDocument();
        expect(screen.getByText('Contenido del formulario')).toBeInTheDocument();

        // Botón "← Volver a Productos"
        fireEvent.click(screen.getByRole('button', { name: /Volver a Productos/i }));
        expect(onClose).toHaveBeenCalledTimes(1);

        // Botón "✕"
        fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal' }));
        expect(onClose).toHaveBeenCalledTimes(2);

        // Clic en backdrop
        fireEvent.click(screen.getByRole('button', { name: /Cerrar formulario de crear producto/i }));
        expect(onClose).toHaveBeenCalledTimes(3);
    });

    it('se cierra al presionar la tecla Escape', () => {
        const onClose = vi.fn();
        render(
            <AdminProductModal
                isOpen={true}
                title="Editar Producto"
                onClose={onClose}
            >
                <div>Contenido</div>
            </AdminProductModal>
        );

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('bloquea el scroll del body al abrir y lo restaura al desmontar', () => {
        document.body.style.overflow = 'auto';

        const { unmount } = render(
            <AdminProductModal
                isOpen={true}
                title="Crear Producto"
                onClose={vi.fn()}
            >
                <div>Contenido</div>
            </AdminProductModal>
        );

        expect(document.body.style.overflow).toBe('hidden');

        unmount();
        expect(document.body.style.overflow).toBe('auto');
    });

    it('muestra skeleton accesible cuando loading es true', () => {
        render(
            <AdminProductModal
                isOpen={true}
                title="Editar Producto"
                onClose={vi.fn()}
                loading={true}
            >
                <div>Contenido Oculto</div>
            </AdminProductModal>
        );

        expect(screen.getByText('Cargando producto...')).toBeInTheDocument();
        expect(screen.queryByText('Contenido Oculto')).not.toBeInTheDocument();
    });
});
