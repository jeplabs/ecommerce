import { useState, useEffect, useMemo } from "react";
import { ProductCard } from "../ui/Card/ProductCard";
import { useProduct } from "../../context/ProductContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMainProductImageUrl } from "../../utils/productImages";
import { ProductFilters } from "../ui/ProductFilters/ProductFilters";
import { SortSelector } from "../ui/SortSelector/SortSelector";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

export const ProductCatalog = ({ productosExternos = null, loadingExterno = false }) => {
    // 1. HOOKS (Todos al principio, sin condiciones)
    const { productos: productosContexto, loading: loadingContexto } = useProduct();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [sortOption, setSortOption] = useState("price-asc");

    const searchTerm = searchParams.get('search') || '';

    const handleAddProductToCart = async (productoId, nombre) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const result = await addToCart(productoId, 1);
        if (result.success) {
            showSuccess(`${nombre} agregado al carrito`);
        } else {
            showError(result.error || 'No se pudo agregar el producto');
        }
    };
    
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

        // Filtrar por búsqueda de nombre
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            resultado = resultado.filter(p => 
                p.nombre && p.nombre.toLowerCase().includes(term)
            );
        }

        setProductosFiltrados(resultado);
    }, [productosAUsar, filtrosActivos, searchTerm]);

    const handleFilterChange = (nuevosFiltros) => {
        setFiltrosActivos(nuevosFiltros);
    };

    const sortProducts = (productos) => {
        if (!productos) return [];
        const ordenados = [...productos];
        switch (sortOption) {
            case "price-desc":
                return ordenados.sort((a, b) => (b.precioVenta || 0) - (a.precioVenta || 0));
            case "name-asc":
                return ordenados.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            case "name-desc":
                return ordenados.sort((a, b) => (b.nombre || "").localeCompare(a.nombre || ""));
            case "newest":
                return ordenados.sort((a, b) => {
                    const fechaA = new Date(a.createdAt || a.updatedAt || 0).getTime();
                    const fechaB = new Date(b.createdAt || b.updatedAt || 0).getTime();
                    return fechaB - fechaA;
                });
            case "price-asc":
            default:
                return ordenados.sort((a, b) => (a.precioVenta || 0) - (b.precioVenta || 0));
        }
    };

    // 4. Ordenamiento y renderizado final
    const listaParaMostrar = filtrosActivos ? productosFiltrados : productosAUsar || [];
    const listaOrdenada = useMemo(() => sortProducts(listaParaMostrar), [listaParaMostrar, sortOption]);

    // 5. RENDERIZADO CONDICIONAL (Después de todos los hooks)
    if (loadingAUsar) {
        return <p className="center-message">Cargando productos...</p>;
    }

    // Si no hay productos ni siquiera para mostrar filtros
    if (!productosAUsar || productosAUsar.length === 0) {
        return <p className="center-message">No hay productos disponibles en esta sección.</p>;
    }

    return (
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
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                    Productos ({listaOrdenada.length})
                </h2>
                <SortSelector sortOption={sortOption} onChange={setSortOption} />
            </div>
            
            {searchTerm.trim() && (
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Resultados para: "{searchTerm.trim()}"
                </p>
            )}
            
            {listaOrdenada.length === 0 ? (
                <p className="center-message">No hay productos que coincidan con los filtros.</p>
            ) : (
                // Grid Responsivo Automático
                <div className="admin-product-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                        {listaOrdenada.map((producto) => (
                            <ProductCard 
                                className="product-card"
                                key={producto.id} 
                                imageSrc={getMainProductImageUrl(producto)}
                                altText={producto.altText} 
                                title={producto.nombre} 
                                description={producto.descripcion} 
                                price={producto.precioVenta} 
                                actionLabel="Ver producto" 
                                onAction={() => navigate(`/producto/${producto.slug || producto.id}`)}
                                onAddToCart={() => handleAddProductToCart(producto.id, producto.nombre)}
                                addLabel="Agregar"
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};