import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    extractFilterFacets,
    countActiveFilters,
    mergeFiltrosWithFacets,
} from '../../../utils/productFilterFacets';
import { useProductFilterForm } from '../../../hooks/useProductFilterForm';
import ProductFiltersPanel from './ProductFiltersPanel';
import './ProductFilters.css';

function buildFacetSections(opciones) {
    return (opciones.facetKeys || []).map((key) => ({
        key,
        options: opciones.specFacets[key] || [],
    }));
}

/**
 * Filtros de catálogo / categoría: facetas dinámicas desde specs de los productos visibles.
 */
export function ProductFilters({ productos, filtros, onFilterChange }) {
    const opciones = useMemo(() => extractFilterFacets(productos), [productos]);
    const facetSections = useMemo(() => buildFacetSections(opciones), [opciones]);

    const filtrosMerged = useMemo(
        () => mergeFiltrosWithFacets(filtros, opciones),
        [filtros, opciones]
    );

    const {
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        draftFiltros,
        toggleSpec,
        setPrice,
        clearFiltros,
        applyDraft,
    } = useProductFilterForm({ filtros: filtrosMerged, opciones, onFilterChange });

    const activeCount = countActiveFilters(filtrosMerged, opciones);

    const desktopHandlers = {
        onSpecToggle: (key, value) => toggleSpec(key, value, { draft: false }),
        onPriceChange: (name, value) => setPrice(name, value, { draft: false }),
        onClear: () => clearFiltros({ draft: false }),
    };

    const mobileHandlers = {
        onSpecToggle: (key, value) => toggleSpec(key, value, { draft: true }),
        onPriceChange: (name, value) => setPrice(name, value, { draft: true }),
        onClear: () => clearFiltros({ draft: true }),
    };

    const panelProps = {
        facetSections,
        precioMinBound: opciones.precioMin,
        precioMaxBound: opciones.precioMax,
    };

    return (
        <>
            <aside className="product-filters" aria-label="Filtros de productos">
                <ProductFiltersPanel
                    {...panelProps}
                    filtros={filtrosMerged}
                    {...desktopHandlers}
                    idPrefix="filter-desktop"
                />
            </aside>

            {createPortal(
                <>
                    <button
                        type="button"
                        className="product-filters__fab"
                        onClick={openDrawer}
                        aria-expanded={isDrawerOpen}
                        aria-controls="product-filters-drawer"
                    >
                        <svg className="product-filters__fab-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <line x1="4" y1="21" x2="4" y2="14" />
                            <line x1="4" y1="10" x2="4" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="3" />
                            <line x1="20" y1="21" x2="20" y2="16" />
                            <line x1="20" y1="12" x2="20" y2="3" />
                            <line x1="1" y1="14" x2="7" y2="14" />
                            <line x1="9" y1="8" x2="15" y2="8" />
                            <line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                        Filtros
                        {activeCount > 0 && (
                            <span className="product-filters__fab-badge" aria-label={`${activeCount} filtros activos`}>
                                {activeCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`product-filters__overlay ${isDrawerOpen ? 'product-filters__overlay--open' : ''}`}
                        aria-label="Cerrar filtros"
                        onClick={closeDrawer}
                        tabIndex={isDrawerOpen ? 0 : -1}
                    />

                    <aside
                        id="product-filters-drawer"
                        className={`product-filters__drawer ${isDrawerOpen ? 'product-filters__drawer--open' : ''}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-filters-drawer-title"
                        aria-hidden={!isDrawerOpen}
                    >
                        <header className="product-filters__drawer-header">
                            <h2 id="product-filters-drawer-title">Filtrar productos</h2>
                            <button
                                type="button"
                                className="product-filters__drawer-close"
                                onClick={closeDrawer}
                                aria-label="Cerrar panel de filtros"
                            >
                                ×
                            </button>
                        </header>

                        <div className="product-filters__drawer-body">
                            <ProductFiltersPanel
                                {...panelProps}
                                filtros={draftFiltros}
                                {...mobileHandlers}
                                showClear={false}
                                idPrefix="filter-mobile"
                            />
                        </div>

                        <footer className="product-filters__drawer-footer">
                            <button
                                type="button"
                                className="product-filters__apply"
                                onClick={applyDraft}
                            >
                                Ver resultados
                            </button>
                            <button
                                type="button"
                                className="product-filters__clear-full"
                                onClick={() => clearFiltros({ draft: true })}
                            >
                                Limpiar filtros
                            </button>
                        </footer>
                    </aside>
                </>,
                document.body
            )}
        </>
    );
}
