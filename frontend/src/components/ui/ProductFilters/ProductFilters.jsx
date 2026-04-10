// import { useState, useEffect } from 'react';
// import { extractFilterOptions } from '../../../utils/filterHelpers';

// export const ProductFilters = ({ productos, onFilterChange }) => {
//     // Estado local para los filtros seleccionados
//     const [filtros, setFiltros] = useState({
//         marca: [],
//         ram: [],
//         almacenamiento: [],
//         precioMin: 0,
//         precioMax: 10000
//     });

//     // Calcular opciones disponibles basado en los productos actuales
//     const opciones = extractFilterOptions(productos);

//     // Inicializar rango de precios cuando cargan los datos
//     useEffect(() => {
//         if (opciones.precioMax > 0) {
//             setFiltros(prev => ({
//                 ...prev,
//                 precioMin: opciones.precioMin,
//                 precioMax: opciones.precioMax
//             }));
//         }
//     }, [opciones.precioMin, opciones.precioMax]);

//     // Notificar al padre cada vez que cambia un filtro
//     useEffect(() => {
//         onFilterChange(filtros);
//     }, [filtros, onFilterChange]);

//     const handleCheckboxChange = (categoria, valor) => {
//         setFiltros(prev => {
//             const actual = prev[categoria];
//             const nuevo = actual.includes(valor)
//                 ? actual.filter(v => v !== valor) // Quitar si ya existe
//                 : [...actual, valor]; // Agregar si no existe
            
//             return { ...prev, [categoria]: nuevo };
//         });
//     };

//     const handlePriceChange = (e) => {
//         const { name, value } = e.target;
//         setFiltros(prev => ({ ...prev, [name]: Number(value) }));
//     };

//     const limpiarFiltros = () => {
//         setFiltros({
//             marca: [],
//             ram: [],
//             almacenamiento: [],
//             precioMin: opciones.precioMin,
//             precioMax: opciones.precioMax
//         });
//     };

//     return (
//         <aside className="product-filters" style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//                 <h3>Filtrar por</h3>
//                 <button onClick={limpiarFiltros} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Limpiar</button>
//             </div>

//             {/* Filtro de Precio */}
//             <div style={{ marginBottom: '1.5rem' }}>
//                 <h4>Precio</h4>
//                 <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//                     <input 
//                         type="number" 
//                         name="precioMin" 
//                         value={filtros.precioMin} 
//                         onChange={handlePriceChange} 
//                         style={{ width: '80px' }}
//                     />
//                     <span>-</span>
//                     <input 
//                         type="number" 
//                         name="precioMax" 
//                         value={filtros.precioMax} 
//                         onChange={handlePriceChange} 
//                         style={{ width: '80px' }}
//                     />
//                 </div>
//             </div>

//             {/* Filtro de Marca */}
//             {opciones.marcas.length > 0 && (
//                 <div style={{ marginBottom: '1.5rem' }}>
//                     <h4>Marca</h4>
//                     {opciones.marcas.map(marca => (
//                         <label key={marca} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
//                             <input 
//                                 type="checkbox" 
//                                 checked={filtros.marca.includes(marca)}
//                                 onChange={() => handleCheckboxChange('marca', marca)}
//                             />
//                             {' '}{marca}
//                         </label>
//                     ))}
//                 </div>
//             )}

//             {/* Filtro de RAM */}
//             {opciones.rams.length > 0 && (
//                 <div style={{ marginBottom: '1.5rem' }}>
//                     <h4>Memoria RAM</h4>
//                     {opciones.rams.map(ram => (
//                         <label key={ram} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
//                             <input 
//                                 type="checkbox" 
//                                 checked={filtros.ram.includes(ram)}
//                                 onChange={() => handleCheckboxChange('ram', ram)}
//                             />
//                             {' '}{ram}
//                         </label>
//                     ))}
//                 </div>
//             )}

//             {/* Filtro de Almacenamiento */}
//             {opciones.almacenamientos.length > 0 && (
//                 <div style={{ marginBottom: '1.5rem' }}>
//                     <h4>Almacenamiento</h4>
//                     {opciones.almacenamientos.map(storage => (
//                         <label key={storage} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
//                             <input 
//                                 type="checkbox" 
//                                 checked={filtros.almacenamiento.includes(storage)}
//                                 onChange={() => handleCheckboxChange('almacenamiento', storage)}
//                             />
//                             {' '}{storage}
//                         </label>
//                     ))}
//                 </div>
//             )}
//         </aside>
//     );
// };

// src/components/ui/ProductFilters/ProductFilters.jsx
import { useState, useEffect } from 'react';
import { extractFilterOptions } from '../../../utils/filterHelpers';
import './ProductFilters.css';

export const ProductFilters = ({ productos, onFilterChange }) => {
    const [filtros, setFiltros] = useState({
        marca: [],
        ram: [],
        almacenamiento: [],
        precioMin: 0,
        precioMax: 10000
    });
    
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [filtrosTemporales, setFiltrosTemporales] = useState(filtros); // Para móvil (aplicar al cerrar)

    const opciones = extractFilterOptions(productos);

    // Inicializar precios
    useEffect(() => {
        if (opciones.precioMax > 0) {
            setFiltros(prev => ({
                ...prev,
                precioMin: opciones.precioMin,
                precioMax: opciones.precioMax
            }));
            setFiltrosTemporales(prev => ({
                ...prev,
                precioMin: opciones.precioMin,
                precioMax: opciones.precioMax
            }));
        }
    }, [opciones.precioMin, opciones.precioMax]);

    // Notificar cambios (Solo desktop aplica inmediato, móvil al cerrar)
    useEffect(() => {
        onFilterChange(filtros);
    }, [filtros, onFilterChange]);

    const handleCheckboxChange = (categoria, valor, esMobile = false) => {
        const setter = esMobile ? setFiltrosTemporales : setFiltros;
        
        setter(prev => {
            const actual = prev[categoria];
            const nuevo = actual.includes(valor)
                ? actual.filter(v => v !== valor)
                : [...actual, valor];
            return { ...prev, [categoria]: nuevo };
        });
    };

    const handlePriceChange = (e, esMobile = false) => {
        const { name, value } = e.target;
        const setter = esMobile ? setFiltrosTemporales : setFiltros;
        setter(prev => ({ ...prev, [name]: Number(value) }));
    };

    const limpiarFiltros = (esMobile = false) => {
        const limpios = {
            marca: [],
            ram: [],
            almacenamiento: [],
            precioMin: opciones.precioMin,
            precioMax: opciones.precioMax
        };
        if (esMobile) {
            setFiltrosTemporales(limpios);
        } else {
            setFiltros(limpios);
        }
    };

    // Aplicar filtros móviles al cerrar o dar click en "Ver resultados"
    const aplicarFiltrosMobile = () => {
        setFiltros(filtrosTemporales);
        setIsMobileOpen(false);
    };

    // Renderizado compartido de las secciones
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

    const currentPriceFilters = filtrosTemporales; // Usamos los temporales para el form visual

    return (
        <>
            {/* --- VERSIÓN DESKTOP (Sidebar) --- */}
            <aside className="product-filters">
                <div className="filters-header">
                    <h3>Filtros</h3>
                    <button onClick={() => limpiarFiltros(false)} className="btn-clear">
                        Limpiar
                    </button>
                </div>

                <div className="filter-section">
                    <h4>Precio</h4>
                    <div className="price-inputs">
                        <input
                            type="number"
                            name="precioMin"
                            value={currentPriceFilters.precioMin}
                            onChange={(e) => handlePriceChange(e, false)}
                            placeholder="Min"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            name="precioMax"
                            value={currentPriceFilters.precioMax}
                            onChange={(e) => handlePriceChange(e, false)}
                            placeholder="Max"
                        />
                    </div>
                </div>

                {renderFilterSection("Marca", opciones.marcas, "marca", false)}
                {renderFilterSection("Memoria RAM", opciones.rams, "ram", false)}
                {renderFilterSection("Almacenamiento", opciones.almacenamientos, "almacenamiento", false)}
            </aside>

            {/* --- VERSIÓN MÓVIL (Botón + Drawer) --- */}
            <button 
                className="mobile-filter-btn" 
                onClick={() => {
                    setFiltrosTemporales(filtros); // Sync inicial
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

            {/* Overlay Oscuro */}
            <div 
                className={`filter-overlay ${isMobileOpen ? 'active' : ''}`} 
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Panel Deslizante (Drawer) */}
            <div className={`filter-drawer ${isMobileOpen ? 'active' : ''}`}>
                <div className="drawer-header">
                    <h3>Filtrar Productos</h3>
                    <button onClick={() => setIsMobileOpen(false)} className="btn-close-drawer">
                        &times;
                    </button>
                </div>

                <div className="filter-section">
                    <h4>Precio</h4>
                    <div className="price-inputs">
                        <input
                            type="number"
                            name="precioMin"
                            value={currentPriceFilters.precioMin}
                            onChange={(e) => handlePriceChange(e, true)}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            name="precioMax"
                            value={currentPriceFilters.precioMax}
                            onChange={(e) => handlePriceChange(e, true)}
                        />
                    </div>
                </div>

                {renderFilterSection("Marca", opciones.marcas, "marca", true)}
                {renderFilterSection("Memoria RAM", opciones.rams, "ram", true)}
                {renderFilterSection("Almacenamiento", opciones.almacenamientos, "almacenamiento", true)}

                <button onClick={aplicarFiltrosMobile} className="btn-apply-mobile">
                    Ver {filtrosTemporales.marca.length + filtrosTemporales.ram.length > 0 ? 'Resultados' : 'Productos'}
                </button>
                <button onClick={() => limpiarFiltros(true)} className="btn-clear" style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}>
                    Limpiar filtros
                </button>
            </div>
        </>
    );
};