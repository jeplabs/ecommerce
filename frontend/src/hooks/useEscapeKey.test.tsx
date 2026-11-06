import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useEscapeKey from './useEscapeKey';

function Host({ onEscape }: { onEscape: () => void }) {
    useEscapeKey(onEscape);
    return <div>host</div>;
}

describe('useEscapeKey', () => {
    it('llama al callback al presionar Escape', () => {
        const onEscape = vi.fn();
        render(<Host onEscape={onEscape} />);

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('no llama al callback con otras teclas', () => {
        const onEscape = vi.fn();
        render(<Host onEscape={onEscape} />);

        fireEvent.keyDown(window, { key: 'Enter' });

        expect(onEscape).not.toHaveBeenCalled();
    });

    it('usa siempre el callback más reciente', () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(<Host onEscape={first} />);

        rerender(<Host onEscape={second} />);
        fireEvent.keyDown(window, { key: 'Escape' });

        expect(second).toHaveBeenCalledTimes(1);
        expect(first).not.toHaveBeenCalled();
    });

    it('remueve el listener al desmontar', () => {
        const onEscape = vi.fn();
        const { unmount } = render(<Host onEscape={onEscape} />);

        unmount();
        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onEscape).not.toHaveBeenCalled();
    });
});
