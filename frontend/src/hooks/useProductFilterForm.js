import { useState, useEffect, useCallback } from 'react';
import { createDefaultFiltros, mergeFiltrosWithFacets } from '../utils/productFilterFacets';

/**
 * Estado del formulario de filtros (desktop inmediato, móvil con borrador + drawer).
 */
export function useProductFilterForm({ filtros, opciones, onFilterChange }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [draftFiltros, setDraftFiltros] = useState(() =>
        mergeFiltrosWithFacets(filtros, opciones)
    );

    useEffect(() => {
        if (!isDrawerOpen) {
            setDraftFiltros(mergeFiltrosWithFacets(filtros, opciones));
        }
    }, [filtros, opciones, isDrawerOpen]);

    const openDrawer = useCallback(() => {
        setDraftFiltros(mergeFiltrosWithFacets(filtros, opciones));
        setIsDrawerOpen(true);
    }, [filtros, opciones]);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const toggleSpec = useCallback((specKey, matchValue, { draft = false } = {}) => {
        const updater = (prev) => {
            const current = prev.specs[specKey] || [];
            const nextValues = current.includes(matchValue)
                ? current.filter((v) => v !== matchValue)
                : [...current, matchValue];
            return {
                ...prev,
                specs: { ...prev.specs, [specKey]: nextValues },
            };
        };

        if (draft) {
            setDraftFiltros(updater);
        } else {
            onFilterChange(updater(filtros));
        }
    }, [filtros, onFilterChange]);

    const setPrice = useCallback(
        (name, value, { draft = false } = {}) => {
            const numeric = Number(value);
            const nextValue = Number.isNaN(numeric) ? 0 : numeric;

            if (draft) {
                setDraftFiltros((prev) => ({ ...prev, [name]: nextValue }));
            } else {
                onFilterChange({ ...filtros, [name]: nextValue });
            }
        },
        [filtros, onFilterChange]
    );

    const clearFiltros = useCallback(
        ({ draft = false } = {}) => {
            const limpios = createDefaultFiltros(opciones);
            if (draft) {
                setDraftFiltros(limpios);
            } else {
                onFilterChange(limpios);
            }
        },
        [opciones, onFilterChange]
    );

    const applyDraft = useCallback(() => {
        onFilterChange(draftFiltros);
        setIsDrawerOpen(false);
    }, [draftFiltros, onFilterChange]);

    useEffect(() => {
        if (!isDrawerOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isDrawerOpen]);

    useEffect(() => {
        if (!isDrawerOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeDrawer();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isDrawerOpen, closeDrawer]);

    return {
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        draftFiltros,
        toggleSpec,
        setPrice,
        clearFiltros,
        applyDraft,
    };
}
