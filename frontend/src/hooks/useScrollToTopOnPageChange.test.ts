import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { scrollToTopSmooth, useScrollToTopOnPageChange } from './useScrollToTopOnPageChange';

describe('useScrollToTopOnPageChange', () => {
    beforeEach(() => {
        vi.stubGlobal('scrollTo', vi.fn());
        window.scrollTo = vi.fn();
        document.documentElement.scrollTo = vi.fn();
        document.body.scrollTo = vi.fn();
    });

    it('ejecuta scrollToTopSmooth sin lanzar errores', () => {
        expect(() => scrollToTopSmooth()).not.toThrow();
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    });

    it('ejecuta el scroll al cambiar la dependencia de página', () => {
        const { rerender } = renderHook(({ page }) => useScrollToTopOnPageChange(page), {
            initialProps: { page: 0 },
        });

        expect(window.scrollTo).toHaveBeenCalledTimes(1);

        rerender({ page: 1 });
        expect(window.scrollTo).toHaveBeenCalledTimes(2);
    });
});

