import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useClickOutside from './useClickOutside';

function Host({ handler }: { handler: (event: MouseEvent) => void }) {
    const ref = useClickOutside<HTMLDivElement>(handler);
    return (
        <div>
            <div ref={ref} data-testid="inside">
                inside
            </div>
            <button data-testid="outside">outside</button>
        </div>
    );
}

describe('useClickOutside', () => {
    it('llama al handler cuando el clic ocurre fuera', () => {
        const handler = vi.fn();
        render(<Host handler={handler} />);

        fireEvent.mouseDown(screen.getByTestId('outside'));

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('no llama al handler cuando el clic ocurre dentro', () => {
        const handler = vi.fn();
        render(<Host handler={handler} />);

        fireEvent.mouseDown(screen.getByTestId('inside'));

        expect(handler).not.toHaveBeenCalled();
    });

    it('remueve el listener al desmontar', () => {
        const handler = vi.fn();
        const { unmount } = render(<Host handler={handler} />);

        unmount();
        fireEvent.mouseDown(document.body);

        expect(handler).not.toHaveBeenCalled();
    });
});
