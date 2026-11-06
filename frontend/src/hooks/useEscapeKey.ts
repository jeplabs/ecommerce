import { useEffect } from 'react';

/**
 * Ejecuta un callback al presionar la tecla Escape.
 */
export default function useEscapeKey(onEscape: () => void): void {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onEscape();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onEscape]);
}
