// src/components/ui/ProductFilters/ProductFilters.jsx
import { useState, useEffect } from 'react';
import { extractFilterOptions } from '../../../utils/filterHelpers';
import './ProductFilters.css';

export const ProductFilters = ({ productos, filtros, onFilterChange }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [filtrosTemporales, setFiltrosTemporales] = useState(filtros);

    const opciones = extractFilterOptions(productos);

    useEffect(() => {
        setFiltrosTemporales(filtros);
    }, [filtros]);

    const handleCheckboxChange = (categoria, valor, esMobile = false) => {
        if (esMobile) {
            setFiltrosTemporales((prev) => {
                const actual = prev[categoria];
                const nuevo = actual.includes(valor)
                    ? actual.filter((v) => v !== valor)
                    : [...actual, valor];
                return { ...prev, [categoria]: nuevo };
            });
        } else {
            const actual = filtros[categoria];
            const nuevo = actual.includes(valor)
                ? actual.filter((v) => v !== valor)
                : [...actual, valor];
            onFilterChange({ ...filtros, [categoria]: nuevo });
        }
    };

    const handlePriceChange = (e, esMobile = false) => {
        const { name, value } = e.target;
        if (esMobile) {
            setFiltrosTemporales((prev) => ({ ...prev, [name]: Number(value) }));
        } else {
            onFilterChange({ ...filtros, [name]: Number(value) });
        }
    };

    const limpiarFiltros = (esMobile = false) => {
        const limpios = {
            marca: [],
            ram: [],
            almacenamiento: [],
            precioMin: opciones.precioMin ?? 0,
            precioMax: opciones.precioMax ?? 10000,
        };
        if (esMobile) {
            setFiltrosTemporales(limpios);
        } else {
            onFilterChange(limpios);
        }
    };

    const aplicarFiltrosMobile = () => {
        onFilterChange(filtrosTemporales);
        setIsMobileOpen(false);
    };

    const renderFilterSection = (titulo, datos, clave, esMobile = false) => {
        if (!datos || datos.length === 0) return null;
        const currentFilters = esMobile ? filtrosTemporales : filtros;

        return (
            <div className="filter-section">
                <h4>{titulo}</h4>
                {datos.map((item) => (
                    <label key={item} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={currentFilters[clave].includes(item)}
                            onChange={() => handleCheckboxChange(clave, item, esMobile)}
                        />
                        {item}
                    </label>
                ))}
            </div>
        );
    };

    return (
        <>
            <aside className="product-filters">
                <div className="filters-header">
                    <h3>Filtros</h3>
                    <button type="button" onClick={() => limpiarFiltros(false)} className="btn-clear">
                        Limpiar
                    </button>
                </div>

                <div className="filter-section">
                    <h4>Precio</h4>
                    <div className="price-inputs">
                        <input
                            type="number"
                            name="precioMin"
                            value={filtros.precioMin}
                            onChange={(e) => handlePriceChange(e, false)}
                            placeholder="Min"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            name="precioMax"
                            value={filtros.precioMax}
                            onChange={(e) => handlePriceChange(e, false)}
                            placeholder="Max"
                        />
                    </div>
                </div>

                {renderFilterSection('Marca', opciones.marcas, 'marca', false)}
                {renderFilterSection('Memoria RAM', opciones.rams, 'ram', false)}
                {renderFilterSection('Almacenamiento', opciones.almacenamientos, 'almacenamiento', false)}
            </aside>

            <button
                type="button"
                className="mobile-filter-btn"
                onClick={() => {
                    setFiltrosTemporales(filtros);
                    setIsMobileOpen(true);
                }}
            >
                <svg className="icon-filter" viewBox="0 0 24 24">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                Filtros
            </button>

            <div
                className={`filter-overlay ${isMobileOpen ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
                role="presentation"
            />

            <div className={`filter-drawer ${isMobileOpen ? 'active' : ''}`}>
                <div className="drawer-header">
                    <h3>Filtrar Productos</h3>
                    <button type="button" onClick={() => setIsMobileOpen(false)} className="btn-close-drawer">
                        &times;
                    </button>
                </div>

                <div className="filter-section">
                    <h4>Precio</h4>
                    <div className="price-inputs">
                        <input
                            type="number"
                            name="precioMin"
                            value={filtrosTemporales.precioMin}
                            onChange={(e) => handlePriceChange(e, true)}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            name="precioMax"
                            value={filtrosTemporales.precioMax}
                            onChange={(e) => handlePriceChange(e, true)}
                        />
                    </div>
                </div>

                {renderFilterSection('Marca', opciones.marcas, 'marca', true)}
                {renderFilterSection('Memoria RAM', opciones.rams, 'ram', true)}
                {renderFilterSection('Almacenamiento', opciones.almacenamientos, 'almacenamiento', true)}

                <button type="button" onClick={aplicarFiltrosMobile} className="btn-apply-mobile">
                    Ver {filtrosTemporales.marca.length + filtrosTemporales.ram.length > 0 ? 'Resultados' : 'Productos'}
                </button>
                <button
                    type="button"
                    onClick={() => limpiarFiltros(true)}
                    className="btn-clear"
                    style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}
                >
                    Limpiar filtros
                </button>
            </div>
        </>
    );
};
