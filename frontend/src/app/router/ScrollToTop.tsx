import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Rutas que solo cambian un parámetro interno (p. ej. id de pedido) no deben
 * resetear scroll ni provocar un “salto” visual en la página de fondo.
 */
function scrollResetKey(pathname: string): string {
    return pathname.replace(/\/profile\/ordenes\/\d+$/, '/profile/ordenes');
}

/**
 * Restaura scroll al inicio en cada cambio de ruta.
 * Debe vivir dentro de <Router>.
 *
 * No basta con window.scrollTo: en app/styles/reset.css body tiene position:fixed,
 * así que el scroll real puede estar en documentElement o en body.
 */
function resetPageScroll() {
    const html = document.documentElement;
    const { body } = document;
    const scrollingElement = document.scrollingElement ?? html;

    scrollingElement.scrollTop = 0;
    scrollingElement.scrollLeft = 0;
    html.scrollTop = 0;
    body.scrollTop = 0;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
}

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();
    const prevPathRef = useRef(pathname);

    useLayoutEffect(() => {
        if (hash) return;

        const prevPath = prevPathRef.current;
        prevPathRef.current = pathname;

        if (scrollResetKey(prevPath) === scrollResetKey(pathname)) {
            return;
        }

        resetPageScroll();
    }, [pathname, hash]);

    return null;
}
