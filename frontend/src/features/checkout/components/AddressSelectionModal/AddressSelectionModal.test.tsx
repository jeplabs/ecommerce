import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AddressSelectionModal from './AddressSelectionModal';

describe('AddressSelectionModal', () => {
    it('no renderiza nada cuando isOpen es false', () => {
        const { container } = render(
            <AddressSelectionModal isOpen={false} onClose={vi.fn()} title="Elegir dirección">
                <div>Contenido interno</div>
            </AddressSelectionModal>
        );

        expect(container.firstChild).toBeNull();
        expect(document.body.style.overflow).toBe('');
    });

    it('renderiza título y contenido, bloquea scroll y cierra con botones/Escape/backdrop', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        const { unmount } = render(
            <AddressSelectionModal isOpen onClose={onClose} title="Elegir dirección">
                <div>Contenido interno</div>
            </AddressSelectionModal>
        );

        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByText('Elegir dirección')).toBeInTheDocument();
        expect(screen.getByText('Contenido interno')).toBeInTheDocument();
        expect(document.body.style.overflow).toBe('hidden');

        // Clic dentro del contenido no propaga al overlay
        await user.click(screen.getByText('Contenido interno'));
        expect(onClose).not.toHaveBeenCalled();

        // Clic en el botón cerrar
        await user.click(screen.getByRole('button', { name: 'Cerrar modal' }));
        expect(onClose).toHaveBeenCalledTimes(1);

        // Clic en Confirmar
        await user.click(screen.getByRole('button', { name: 'Confirmar' }));
        expect(onClose).toHaveBeenCalledTimes(2);

        // Clic en el overlay (backdrop)
        await user.click(screen.getByRole('dialog'));
        expect(onClose).toHaveBeenCalledTimes(3);

        // Tecla Escape
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(4);

        unmount();
        expect(document.body.style.overflow).toBe('');
    });
});
