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
}) {
    const hasFacets = facetSections?.length > 0;

    return (
        <div className="product-filters-panel">
            {showClear && (
                <header className="product-filters-panel__header">
                    <h2 className="product-filters-panel__title">Filtros</h2>
                    <button type="button" className="product-filters-panel__clear" onClick={onClear}>
                        Limpiar
                    </button>
                </header>
            )}

            <fieldset className="product-filters-panel__group">
                <legend className="product-filters-panel__legend">Precio</legend>
                <div className="product-filters-panel__price-row">
                    <label className="product-filters-panel__price-label" htmlFor={`${idPrefix}-precio-min`}>
                        Mín.
                    </label>
                    <input
                        id={`${idPrefix}-precio-min`}
                        type="number"
                        name="precioMin"
                        className="product-filters-panel__input"
                        min={precioMinBound}
                        max={precioMaxBound}
                        value={filtros.precioMin}
                        onChange={(e) => onPriceChange('precioMin', e.target.value)}
                    />
                    <span className="product-filters-panel__price-sep" aria-hidden="true">
                        —
                    </span>
                    <label className="product-filters-panel__price-label" htmlFor={`${idPrefix}-precio-max`}>
                        Máx.
                    </label>
                    <input
                        id={`${idPrefix}-precio-max`}
                        type="number"
                        name="precioMax"
                        className="product-filters-panel__input"
                        min={precioMinBound}
                        max={precioMaxBound}
                        value={filtros.precioMax}
                        onChange={(e) => onPriceChange('precioMax', e.target.value)}
                    />
                </div>
            </fieldset>

            {hasFacets ? (
                facetSections.map(({ key, options }) => (
                    <fieldset key={key} className="product-filters-panel__group">
                        <legend className="product-filters-panel__legend">{key}</legend>
                        <ul className="product-filters-panel__options">
                            {options.map(({ matchValue, displayLabel }) => {
                                const inputId = `${idPrefix}-${key}-${encodeURIComponent(matchValue)}`;
                                const checked = (filtros.specs[key] || []).includes(matchValue);
                                return (
                                    <li key={matchValue} className="product-filters-panel__chip-item">
                                        <label
                                            className={`product-filters-panel__chip${checked ? ' product-filters-panel__chip--selected' : ''}`}
                                            htmlFor={inputId}
                                        >
                                            <input
                                                id={inputId}
                                                type="checkbox"
                                                className="product-filters-panel__chip-input"
                                                checked={checked}
                                                onChange={() => onSpecToggle(key, matchValue)}
                                            />
                                            <span className="product-filters-panel__chip-text">{displayLabel}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </fieldset>
                ))
            ) : (
                <p className="product-filters-panel__empty-hint">
                    No hay especificaciones para filtrar en esta selección.
                </p>
            )}
        </div>
    );
}
