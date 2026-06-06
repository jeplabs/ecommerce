import { useEffect, useRef, type RefObject } from 'react';

/**
 * Detecta clics fuera de un elemento contenedor.
 */
export default function useClickOutside<T extends HTMLElement = HTMLElement>(
    handler: (event: MouseEvent) => void
): RefObject<T | null> {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler(event);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handler]);

    return ref;
}
