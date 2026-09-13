import { useState } from 'react';
import clsx from 'clsx';
import type { CatalogFiltros, SpecFacetOption } from '@/features/catalog/model/types';
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

    const toggleShowMore = (key: string) => {
        setExpandedOptions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className={styles.panel}>
            {showClear && (
                <header className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>Filtros</h2>
                    <button type="button" className={styles.panelClear} onClick={onClear}>
                        Limpiar
                    </button>
                </header>
            )}

            <fieldset className={styles.panelGroup}>
                <legend className={styles.panelLegend}>Precio</legend>
                <div className={styles.panelPriceRow}>
                    <label className={styles.panelPriceLabel} htmlFor={`${idPrefix}-precio-min`}>
                        Mín.
                    </label>
                    <input
                        id={`${idPrefix}-precio-min`}
                        type="number"
                        name="precioMin"
                        className={styles.panelInput}
                        min={precioMinBound}
                        max={precioMaxBound}
                        value={filtros.precioMin}
                        onChange={(e) => onPriceChange('precioMin', e.target.value)}
                    />
                    <span className={styles.panelPriceSep} aria-hidden="true">
                        —
                    </span>
                    <label className={styles.panelPriceLabel} htmlFor={`${idPrefix}-precio-max`}>
                        Máx.
                    </label>
                    <input
                        id={`${idPrefix}-precio-max`}
                        type="number"
                        name="precioMax"
                        className={styles.panelInput}
                        min={precioMinBound}
                        max={precioMaxBound}
                        value={filtros.precioMax}
                        onChange={(e) => onPriceChange('precioMax', e.target.value)}
                    />
                </div>
            </fieldset>

            {hasFacets ? (
                facetSections.map(({ key, options }, index) => {
                    const hasSelected = (filtros.specs[key] || []).length > 0;
                    const isSectionOpen =
                        expandedSections[key] ?? (index < 2 || hasSelected);
                    const isOptionsExpanded = expandedOptions[key] ?? false;
                    const visibleOptions = isOptionsExpanded
                        ? options
                        : options.slice(0, INITIAL_VISIBLE_COUNT);
                    const hasMoreOptions = options.length > INITIAL_VISIBLE_COUNT;

                    return (
                        <fieldset key={key} className={styles.panelGroup}>
                            <legend className={styles.panelLegendReset}>
                                <button
                                    type="button"
                                    className={styles.panelAccordionHeader}
                                    onClick={() => toggleSection(key, isSectionOpen)}
                                    aria-expanded={isSectionOpen}
                                >
                                    <span className={styles.panelAccordionTitle}>{key}</span>
                                    <svg
                                        className={clsx(
                                            styles.panelAccordionChevron,
                                            isSectionOpen && styles.panelAccordionChevronOpen
                                        )}
                                        viewBox="0 0 24 24"
                                        width="16"
                                        height="16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                            </legend>

                            {isSectionOpen && (
                                <div className={styles.panelAccordionContent}>
                                    <ul className={styles.panelOptions}>
                                        {visibleOptions.map(
                                            ({ matchValue, displayLabel, count }) => {
                                                const inputId = `${idPrefix}-${key}-${encodeURIComponent(matchValue)}`;
                                                const checked = (
                                                    filtros.specs[key] || []
                                                ).includes(matchValue);
                                                return (
                                                    <li
                                                        key={matchValue}
                                                        className={styles.panelChipItem}
                                                    >
                                                        <label
                                                            className={clsx(
                                                                styles.panelChip,
                                                                checked &&
                                                                    styles.panelChipSelected
                                                            )}
                                                            htmlFor={inputId}
                                                        >
                                                            <input
                                                                id={inputId}
                                                                type="checkbox"
                                                                className={styles.panelChipInput}
                                                                checked={checked}
                                                                onChange={() =>
                                                                    onSpecToggle(
                                                                        key,
                                                                        matchValue
                                                                    )
                                                                }
                                                            />
                                                            <span
                                                                className={styles.panelChipText}
                                                            >
                                                                {displayLabel}
                                                            </span>
                                                            {count != null && (
                                                                <span
                                                                    className={
                                                                        styles.panelChipCount
                                                                    }
                                                                >
                                                                    ({count})
                                                                </span>
                                                            )}
                                                        </label>
                                                    </li>
                                                );
                                            }
                                        )}
                                    </ul>
                                    {hasMoreOptions && (
                                        <button
                                            type="button"
                                            className={styles.panelShowMore}
                                            onClick={() => toggleShowMore(key)}
                                        >
                                            {isOptionsExpanded
                                                ? 'Ver menos'
                                                : `+ Ver ${options.length - INITIAL_VISIBLE_COUNT} más`}
                                        </button>
                                    )}
                                </div>
                            )}
                        </fieldset>
                    );
                })
            ) : (
                <p className={styles.panelEmptyHint}>
                    No hay especificaciones para filtrar en esta selección.
                </p>
            )}
        </div>
    );
}
