import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav";
import Footer from "../components/layout/Footer/Footer";
import { ProductCatalog } from "../components/layout/ProductCatalog";
import { useProductosByCategory } from "../hooks/useProductosByCategory";
import { useCategorias } from "../context/CategoriasContext"; // Para mostrar el nombre de la categoría

const buscarCategoriaPorPath = (arbol, segmentos) => {
    if (!segmentos || segmentos.length === 0) return null;
    const [slugActual, ...rest] = segmentos;
    const categoria = arbol.find(c => c.slug === slugActual || c.id?.toString() === slugActual);
    if (!categoria) return null;
    if (rest.length === 0) return categoria;
    return buscarCategoriaPorPath(categoria.subcategorias || [], rest);
};

export default function CategoriaProductos() {
    const location = useLocation();
    const categoriaRuta = location.pathname.replace(/^\/categoria\/?/, '').replace(/\/$/, '');
    const segmentos = categoriaRuta.split('/').filter(Boolean);
    const slugPath = segmentos.join('/');
    const { productos, loading, error, paginaActual, setPaginaActual, totalPaginas } = useProductosByCategory(slugPath);
    const { arbolCategorias } = useCategorias(); 

    const categoriaActual = buscarCategoriaPorPath(arbolCategorias, segmentos);
    const nombreCategoria = categoriaActual ? categoriaActual.nombre : segmentos.length === 0 ? "Categorías" : "Categoría";

    if (error) {
        return (
            <>
                <Navbar />
                <div className="container">
                    <p>Error al cargar los productos: {error}</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <CategoriasNav />
            <div className="container" style={{ padding: "2rem 0" }}>
                <h1>{nombreCategoria || 'Categoría'}</h1>
                
                {/* Reutilizamos el mismo catálogo, pasándole los productos filtrados */}
                <ProductCatalog 
                    productosExternos={productos} 
                    loadingExterno={loading} 
                />

                {/* Controles de Paginación Simples */}
                {!loading && totalPaginas > 1 && (
                    <div className="pagination" style={{ marginTop: "2rem", display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button 
                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))} 
                            disabled={paginaActual === 1}
                            className="btn btn-secondary"
                        >
                            Anterior
                        </button>
                        <span style={{ alignSelf: "center" }}>
                            Página {paginaActual} de {totalPaginas}
                        </span>
                        <button 
                            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} 
                            disabled={paginaActual === totalPaginas}
                            className="btn btn-secondary"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}