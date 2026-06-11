import clsx from 'clsx';
import type { CatalogFiltros } from '@/features/catalog/model/types';
import type { SpecFacetOption } from '@/features/catalog/model/types';
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

/**
 * Panel presentacional de filtros (sin lógica de URL ni drawer).
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
                facetSections.map(({ key, options }) => (
                    <fieldset key={key} className={styles.panelGroup}>
                        <legend className={styles.panelLegend}>{key}</legend>
                        <ul className={styles.panelOptions}>
                            {options.map(({ matchValue, displayLabel }) => {
                                const inputId = `${idPrefix}-${key}-${encodeURIComponent(matchValue)}`;
                                const checked = (filtros.specs[key] || []).includes(matchValue);
                                return (
                                    <li key={matchValue} className={styles.panelChipItem}>
                                        <label
                                            className={clsx(
                                                styles.panelChip,
                                                checked && styles.panelChipSelected
                                            )}
                                            htmlFor={inputId}
                                        >
                                            <input
                                                id={inputId}
                                                type="checkbox"
                                                className={styles.panelChipInput}
                                                checked={checked}
                                                onChange={() => onSpecToggle(key, matchValue)}
                                            />
                                            <span className={styles.panelChipText}>{displayLabel}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </fieldset>
                ))
            ) : (
                <p className={styles.panelEmptyHint}>
                    No hay especificaciones para filtrar en esta selección.
                </p>
            )}
        </div>
    );
}
