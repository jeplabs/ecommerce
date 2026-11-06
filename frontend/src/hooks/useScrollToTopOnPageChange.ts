import { useEffect } from 'react';

/**
 * Realiza un scroll suave hacia el inicio considerando window, documentElement y body.
 */
export function scrollToTopSmooth() {
    const html = document.documentElement;
    const { body } = document;
    const scrollingElement = document.scrollingElement ?? html;

    scrollingElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    html.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}

/**
 * Hook reactivo para elevar la vista del navegador cuando cambian las dependencias (ej. `page`).
 */
export function useScrollToTopOnPageChange(...deps: unknown[]) {
    useEffect(() => {
        scrollToTopSmooth();
    }, deps);
}

