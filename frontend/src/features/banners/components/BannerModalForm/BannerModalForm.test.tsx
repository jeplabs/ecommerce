import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BannerModalForm } from './BannerModalForm';
import type { BannerApi } from '../../types';

const mockBanner: BannerApi = {
    id: 1,
    seccion: 'HERO_CAROUSEL',
    titulo: 'Banner de Prueba',
    desktopUrl: 'https://res.cloudinary.com/demo/image/upload/desktop.webp',
    mobileUrl: 'https://res.cloudinary.com/demo/image/upload/mobile.webp',
    linkUrl: '/categoria/ofertas',
    orden: 1,
    activo: true,
    fechaInicio: '2026-11-01T00:00:00',
    fechaFin: '2026-11-30T23:59:59',
    createdAt: '2026-11-01T10:00:00',
    updatedAt: '2026-11-01T10:00:00',
};

describe('BannerModalForm', () => {
    it('no renderiza nada cuando isOpen es false', () => {
        const { container } = render(
            <BannerModalForm isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renderiza el formulario en modo creación', () => {
        render(<BannerModalForm isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);

        expect(
            screen.getByRole('heading', { name: /nuevo banner para home/i })
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/título descriptivo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/imagen para escritorio/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/imagen para móviles/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/enlace al hacer clic/i)).toBeInTheDocument();
    });

    it('muestra errores de validación si faltan campos obligatorios al enviar', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<BannerModalForm isOpen={true} onClose={vi.fn()} onSave={onSave} />);

        fireEvent.click(screen.getByRole('button', { name: /crear banner/i }));

        await waitFor(() => {
            expect(screen.getByText('El título es obligatorio')).toBeInTheDocument();
            expect(screen.getByText('La imagen de escritorio es obligatoria')).toBeInTheDocument();
        });

        expect(onSave).not.toHaveBeenCalled();
    });

    it('valida que fechaFin sea posterior a fechaInicio', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        render(<BannerModalForm isOpen={true} onClose={vi.fn()} onSave={onSave} />);

        fireEvent.change(screen.getByLabelText(/título descriptivo/i), {
            target: { value: 'Banner Fechas' },
        });
        fireEvent.change(screen.getByLabelText(/imagen para escritorio/i), {
            target: { value: 'https://test/img.png' },
        });
        fireEvent.change(screen.getByLabelText(/fecha y hora de inicio/i), {
            target: { value: '2026-12-10T10:00' },
        });
        fireEvent.change(screen.getByLabelText(/fecha y hora de fin/i), {
            target: { value: '2026-12-05T10:00' },
        });

        fireEvent.click(screen.getByRole('button', { name: /crear banner/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/la fecha de fin debe ser estrictamente posterior/i)
            ).toBeInTheDocument();
        });

        expect(onSave).not.toHaveBeenCalled();
    });

    it('carga datos en modo edición y llama a onSave con los valores actualizados', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        const onClose = vi.fn();

        render(
            <BannerModalForm
                isOpen={true}
                onClose={onClose}
                onSave={onSave}
                bannerToEdit={mockBanner}
            />
        );

        expect(screen.getByRole('heading', { name: /editar banner/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Banner de Prueba')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/título descriptivo/i), {
            target: { value: 'Banner Editado' },
        });

        fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    titulo: 'Banner Editado',
                    desktopUrl: mockBanner.desktopUrl,
                })
            );
            expect(onClose).toHaveBeenCalled();
        });
    });
});
