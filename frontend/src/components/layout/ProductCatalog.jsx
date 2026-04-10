// import { useState, useEffect } from "react";
// import { ProductCard } from "../ui/Card/ProductCard";
// import { useProduct } from "../../context/ProductContext";
// import { useNavigate } from "react-router-dom";
// import { getMainProductImageUrl } from "../../utils/productImages";
// import { ProductFilters } from "../ui/ProducFilters/ProductFilters";

// // Aceptamos productosExternos y loadingExterno como props opcionales
// export const ProductCatalog = ({ productosExternos = null, loadingExterno = false }) => {
//     const { productos: productosContexto, loading: loadingContexto } = useProduct();
//     const navigate = useNavigate();
    
//     // Si recibimos productos externos (ej. por categoría), los usamos. Si no, los del contexto.
//     const productosAUsar = productosExternos !== null ? productosExternos : productosContexto;
//     const loadingAUsar = loadingExterno !== false ? loadingExterno : loadingContexto;

//     const [productosCatalogo, setProductosCatalogo] = useState([]);

//     // Estado para los filtros activos
//     const [filtrosActivos, setFiltrosActivos] = useState(null);
//     const [productosFiltrados, setProductosFiltrados] = useState([]);

//     // Lógica de Filtrado (Se ejecuta cuando cambian los productos o los filtros)
//     useEffect(() => {
//         if (!productosAUsar) return;

//         let resultado = [...productosAUsar];

//         if (filtrosActivos) {
//             const { marca, ram, almacenamiento, precioMin, precioMax } = filtrosActivos;

//             // Filtrar por Precio
//             resultado = resultado.filter(p => 
//                 p.precioVenta >= precioMin && p.precioVenta <= precioMax
//             );

//             // Filtrar por Marca (si hay selección)
//             if (marca.length > 0) {
//                 resultado = resultado.filter(p => {
//                     const pMarca = p.specs?.Marca || p.marca;
//                     return pMarca && marca.includes(pMarca);
//                 });
//             }

//             // Filtrar por RAM
//             if (ram.length > 0) {
//                 resultado = resultado.filter(p => {
//                     const pRam = p.specs?.RAM?.toString().replace(/\s/g, '');
//                     return pRam && ram.includes(pRam);
//                 });
//             }

//             // Filtrar por Almacenamiento
//             if (almacenamiento.length > 0) {
//                 resultado = resultado.filter(p => {
//                     const pStorage = p.specs?.Almacenamiento?.toString().replace(/\s/g, '');
//                     return pStorage && almacenamiento.includes(pStorage);
//                 });
//             }
//         }

//         setProductosFiltrados(resultado);
//     }, [productosAUsar, filtrosActivos]);

//     const handleFilterChange = (nuevosFiltros) => {
//         setFiltrosActivos(nuevosFiltros);
//     };


//     useEffect(() => {
//         if (productosAUsar && productosAUsar.length > 0) {
//             setProductosCatalogo(productosAUsar);
//         }
//     }, [productosAUsar]);

//     if (loadingAUsar) {
//         return <p className="center-message">Cargando productos...</p>;
//     }

//     if (!productosAUsar || productosAUsar.length === 0) {
//         return <p className="center-message">No hay productos disponibles en esta sección.</p>;
//     }

//     if (loadingAUsar) return <p>Cargando productos...</p>;

//     return (
//         <section className="product-catalog">
//             {/* <h2>Catálogo de productos</h2> */}
//             <br />
//             <div className="admin-product-grid">
//                 {productosCatalogo.map((producto) => (
//                     <ProductCard 
//                     className="product-card"
//                     key={producto.id} 
//                     imageSrc={getMainProductImageUrl(producto)}
//                     altText={producto.altText} 
//                     title={producto.nombre} 
//                     description={producto.descripcion} 
//                     price={producto.precioVenta} 
//                     actionLabel="Ver producto" 
//                     onAction={() => navigate(`/producto/${producto.id}`)}
//                     />
//                 ))}
//             </div>
//         </section>
//     );
// };

// src/components/layout/ProductCatalog.jsx
import { useState, useEffect } from "react";
import { ProductCard } from "../ui/Card/ProductCard";
import { useProduct } from "../../context/ProductContext";
import { useNavigate } from "react-router-dom";
import { getMainProductImageUrl } from "../../utils/productImages";
// Asegúrate que la ruta sea correcta (tenías un typo: ProducFilters -> ProductFilters)
import { ProductFilters } from "../ui/ProductFilters/ProductFilters"; 

export const ProductCatalog = ({ productosExternos = null, loadingExterno = false }) => {
    // 1. HOOKS (Todos al principio, sin condiciones)
    const { productos: productosContexto, loading: loadingContexto } = useProduct();
    const navigate = useNavigate();
    
    // Estados locales para filtros y resultados
    const [filtrosActivos, setFiltrosActivos] = useState(null);
    const [productosFiltrados, setProductosFiltrados] = useState([]);

    // Determinar fuente de datos
    const productosAUsar = productosExternos !== null ? productosExternos : productosContexto;
    const loadingAUsar = loadingExterno !== false ? loadingExterno : loadingContexto;

    // 2. EFECTO DE FILTRADO
    useEffect(() => {
        if (!productosAUsar) {
            setProductosFiltrados([]);
            return;
        }

        let resultado = [...productosAUsar];

        if (filtrosActivos) {
            const { marca, ram, almacenamiento, precioMin, precioMax } = filtrosActivos;

            // Filtrar por Precio
            resultado = resultado.filter(p => 
                p.precioVenta >= precioMin && p.precioVenta <= precioMax
            );

            // Filtrar por Marca
            if (marca && marca.length > 0) {
                resultado = resultado.filter(p => {
                    const pMarca = p.specs?.Marca || p.marca;
                    return pMarca && marca.includes(pMarca);
                });
            }

            // Filtrar por RAM
            if (ram && ram.length > 0) {
                resultado = resultado.filter(p => {
                    const pRam = p.specs?.RAM?.toString().replace(/\s/g, '');
                    return pRam && ram.includes(pRam);
                });
            }

            // Filtrar por Almacenamiento
            if (almacenamiento && almacenamiento.length > 0) {
                resultado = resultado.filter(p => {
                    const pStorage = p.specs?.Almacenamiento?.toString().replace(/\s/g, '');
                    return pStorage && almacenamiento.includes(pStorage);
                });
            }
        }

        setProductosFiltrados(resultado);
    }, [productosAUsar, filtrosActivos]);

    const handleFilterChange = (nuevosFiltros) => {
        setFiltrosActivos(nuevosFiltros);
    };

    // 3. RENDERIZADO CONDICIONAL (Después de todos los hooks)
    if (loadingAUsar) {
        return <p className="center-message">Cargando productos...</p>;
    }

    // Si no hay productos ni siquiera para mostrar filtros
    if (!productosAUsar || productosAUsar.length === 0) {
        return <p className="center-message">No hay productos disponibles en esta sección.</p>;
    }

    // 4. JSX FINAL
    // Usamos productosFiltrados para el mapa. Si no hay filtros, será igual a productosAUsar.
    const listaParaMostrar = productosFiltrados.length > 0 ? productosFiltrados : [];

    return (
        
        // <section className="product-catalog" style={{ display: 'flex', gap: '2rem' }}>
        //     {/* BARRA LATERAL DE FILTROS */}
        //     <div style={{ width: '250px', flexShrink: 0 }}>
        //         <ProductFilters 
        //             productos={productosAUsar} 
        //             onFilterChange={handleFilterChange} 
        //         />
        //     </div>

        //     {/* GRID DE PRODUCTOS */}
        //     <div style={{ flexGrow: 1 }}>
        //         <h2>Productos ({listaParaMostrar.length})</h2>
        //         <br />
                
        //         {listaParaMostrar.length === 0 ? (
        //             <p className="center-message">No hay productos que coincidan con los filtros seleccionados.</p>
        //         ) : (
        //             <div className="admin-product-grid">
        <section className="product-catalog" style={{ 
        display: 'flex', 
        gap: '2rem', 
        alignItems: 'flex-start' // Evita que el sidebar estire la altura innecesariamente
    }}>
        
        {/* Barra Lateral (250px fijos, pero no empuja fuera) */}
        <div style={{ 
            width: '250px', 
            flexShrink: 0, // No encoger
            minWidth: '250px'
        }}>
            <ProductFilters 
                productos={productosAUsar} 
                onFilterChange={handleFilterChange} 
            />
        </div>

        {/* Área de Productos (Ocupa el resto del espacio) */}
        <div style={{ 
            flexGrow: 1, 
            minWidth: 0, // Truco CSS para permitir que el grid haga scroll o se ajuste si es necesario
            width: '100%' 
        }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                Productos ({listaParaMostrar.length})
            </h2>
            
            {listaParaMostrar.length === 0 ? (
                <p className="center-message">No hay productos que coincidan con los filtros.</p>
            ) : (
                // Grid Responsivo Automático
                <div className="admin-product-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                        {listaParaMostrar.map((producto) => (
                            <ProductCard 
                                className="product-card"
                                key={producto.id} 
                                imageSrc={getMainProductImageUrl(producto)}
                                altText={producto.altText} 
                                title={producto.nombre} 
                                description={producto.descripcion} 
                                price={producto.precioVenta} 
                                actionLabel="Ver producto" 
                                onAction={() => navigate(`/producto/${producto.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};