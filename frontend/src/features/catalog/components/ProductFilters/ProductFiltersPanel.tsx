import { useState } from 'react';
import clsx from 'clsx';
import type { CatalogFiltros, SpecFacetOption } from '../../types';
import styles from './ProductFilters.module.css';

type FacetSection = {
    key: string;
    options: SpecFacetOption[];
};

type ProductFiltersPanelProps = {
    facetSections: FacetSection[];
    filtros: CatalogFiltros;
    precioMinBound: number;
    precioMaxBound: number;
    onSpecToggle: (key: string, value: string) => void;
    onPriceChange: (name: 'precioMin' | 'precioMax', value: string) => void;
    onClear: () => void;
    showClear?: boolean;
    idPrefix?: string;
};

const INITIAL_VISIBLE_COUNT = 5;

/**
 * Panel presentacional de filtros (sin lógica de URL ni drawer).
 * Soporta acordeón por sección de especificaciones y truncado de opciones.
 */
export default function ProductFiltersPanel({
    facetSections,
    filtros,
    precioMinBound,
    precioMaxBound,
    onSpecToggle,
    onPriceChange,
    onClear,
    showClear = true,
    idPrefix = 'filter',
}: ProductFiltersPanelProps) {
    const hasFacets = facetSections?.length > 0;
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

    const toggleSection = (key: string, currentOpen: boolean) => {
        setExpandedSections((prev) => ({
            ...prev,
            [key]: !currentOpen,
        }));
    };

    const toggleShowAll = (key: string) => {
        setExpandedOptions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Filtros</h3>
                {showClear && (
                    <button type="button" className={styles.panelClear} onClick={onClear}>
                        Limpiar
                    </button>
                )}
            </div>

            <fieldset className={styles.panelGroup}>
                <legend className={styles.panelLegend}>Precio</legend>
                <div className={styles.panelPriceRow}>
                    <label className={styles.panelPriceLabel} htmlFor={`${idPrefix}-min`}>
                        Mín.
                    </label>
                    <input
                        id={`${idPrefix}-min`}
                        type="number"
                        className={styles.panelInput}
                        placeholder={String(precioMinBound)}
                        value={filtros.precioMin > 0 ? filtros.precioMin : ''}
                        onChange={(e) => onPriceChange('precioMin', e.target.value)}
                        min={0}
                    />
                    <span className={styles.panelPriceSep} aria-hidden>
                        —
                    </span>
                    <label className={styles.panelPriceLabel} htmlFor={`${idPrefix}-max`}>
                        Máx.
                    </label>
                    <input
                        id={`${idPrefix}-max`}
                        type="number"
                        className={styles.panelInput}
                        placeholder={precioMaxBound > 0 ? String(precioMaxBound) : ''}
                        value={filtros.precioMax > 0 ? filtros.precioMax : ''}
                        onChange={(e) => onPriceChange('precioMax', e.target.value)}
                        min={0}
                    />
                </div>
            </fieldset>

            {hasFacets &&
                facetSections.map(({ key, options }, index) => {
                    const selectedForThisKey = filtros.specs[key] || [];
                    const isExplicit = key in expandedSections;
                    const isOpen = isExplicit ? expandedSections[key] : index < 2;
                    const isAllVisible = !!expandedOptions[key];

                    const visibleOptions =
                        isOpen && !isAllVisible && options.length > INITIAL_VISIBLE_COUNT
                            ? options.slice(0, INITIAL_VISIBLE_COUNT)
                            : options;

                    const hiddenCount = options.length - INITIAL_VISIBLE_COUNT;

                    return (
                        <fieldset key={key} className={styles.panelGroup}>
                            <legend className={styles.panelLegendReset}>
                                <button
                                    type="button"
                                    className={styles.panelAccordionHeader}
                                    onClick={() => toggleSection(key, isOpen)}
                                    aria-expanded={isOpen}
                                >
                                    <span className={styles.panelAccordionTitle}>{key}</span>
                                    <svg
                                        className={clsx(
                                            styles.panelAccordionChevron,
                                            isOpen && styles.panelAccordionChevronOpen
                                        )}
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                            </legend>

                            {isOpen && (
                                <div className={styles.panelAccordionContent}>
                                    <ul
                                        className={styles.panelOptions}
                                        aria-label={`Opciones de ${key}`}
                                    >
                                        {visibleOptions.map((opt) => {
                                            const isSelected = selectedForThisKey.includes(
                                                opt.matchValue
                                            );
                                            const inputId = `${idPrefix}-${key}-${opt.matchValue}`;
                                            return (
                                                <li key={opt.matchValue} className={styles.panelChipItem}>
                                                    <label
                                                        htmlFor={inputId}
                                                        className={clsx(
                                                            styles.panelChip,
                                                            isSelected && styles.panelChipSelected
                                                        )}
                                                    >
                                                        <input
                                                            id={inputId}
                                                            type="checkbox"
                                                            className={styles.panelChipInput}
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                onSpecToggle(key, opt.matchValue)
                                                            }
                                                        />
                                                        <span className={styles.panelChipText}>
                                                            {opt.displayLabel}
                                                        </span>
                                                        {typeof opt.count === 'number' && (
                                                            <span className={styles.panelChipCount}>
                                                                ({opt.count})
                                                            </span>
                                                        )}
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {options.length > INITIAL_VISIBLE_COUNT && (
                                        <button
                                            type="button"
                                            className={styles.panelShowMore}
                                            onClick={() => toggleShowAll(key)}
                                        >
                                            {isAllVisible
                                                ? 'Ver menos'
                                                : `Ver más (${hiddenCount})`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </fieldset>
                    );
                })}

            {!hasFacets && (
                <p className={styles.panelEmptyHint}>
                    No hay filtros adicionales para los productos visibles.
                </p>
            )}
        </div>
    );
}
