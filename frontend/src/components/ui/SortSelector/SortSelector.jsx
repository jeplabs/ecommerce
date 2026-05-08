import "./SortSelector.css";

export const SortSelector = ({ sortOption, onChange }) => {
    const SORT_OPTIONS = [
        { value: "price-asc", label: "Precio: menor a mayor" },
        { value: "price-desc", label: "Precio: mayor a menor" },
        { value: "name-asc", label: "Nombre: A-Z" },
        { value: "name-desc", label: "Nombre: Z-A" },
        { value: "newest", label: "Más reciente" },
    ];

    return (
        <div className="sort-selector-container">
            <label htmlFor="sort-products" className="sort-selector-label">
                Ordenar por:
            </label>
            <select
                id="sort-products"
                value={sortOption}
                onChange={(e) => onChange(e.target.value)}
                className="sort-selector-select"
            >
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
