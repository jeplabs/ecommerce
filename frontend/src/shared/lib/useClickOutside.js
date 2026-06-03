import { useEffect, useRef } from 'react';

/**
 * Custom Hook para detectar clics fuera de un elemento.
 * @param {function} handler - Función a ejecutar cuando se detecta un clic fuera.
 * @returns {React.RefObject} - Referencia a asignar al elemento contenedor.
 */
export default function useClickOutside(handler) {
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Si el ref existe y el clic NO está dentro del elemento, ejecutamos el handler
            if (ref.current && !ref.current.contains(event.target)) {
                handler(event);
            }
        };

        // Escuchar eventos de mousedown (funciona mejor para botones y inputs que 'click')
        document.addEventListener('mousedown', handleClickOutside);
        
        // Limpieza: remover el listener cuando el componente se desmonta o cambia el handler
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handler]);

    return ref;
}