import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav";
import Breadcrumbs from "../components/ui/Breadcrumbs/Breadcrumbs";
import { ProductCatalog } from "../components/layout/ProductCatalog";
import Footer from "../components/layout/Footer/Footer";
import { useProductosByCategory } from "../hooks/useProductosByCategory";
import { useCategorias } from "../context/CategoriasContext"; 
import "./CategoriaProductos.css"

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

    const breadcrumbs = [
        { label: "Inicio", path: "/" },
        { label: "Catálogo", path: "/catalogo" }
    ];

    // Si tenemos una categoría actual y segmentos, reconstruimos la ruta padre
    if (categoriaActual && segmentos.length > 0) {
        let rutaAcumulada = "";
        
        // Recorremos los segmentos de la URL para crear los pasos intermedios
        segmentos.forEach((slug, index) => {
            rutaAcumulada += `/${slug}`;
            
            // Buscamos el nombre de esta categoría específica en el árbol para mostrar el nombre correcto
            // Nota: Esto es una búsqueda simple, si el árbol es muy profundo podría optimizarse, 
            // pero para breadcrumbs funciona bien.
            const catEnNivel = buscarCategoriaPorPath(arbolCategorias, segmentos.slice(0, index + 1));
            
            if (catEnNivel) {
                // Si es el último segmento, es la categoría actual (podemos omitirla del link si quieres, o dejarla)
                const esUltimo = index === segmentos.length - 1;
                breadcrumbs.push({
                    label: catEnNivel.nombre,
                    path: esUltimo ? null : `/categoria${rutaAcumulada}` // null o sin path para el elemento actual activo
                });
            }
        });
    }

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
            <div className="container">
                <div className="container-header">
                    <h1>{nombreCategoria || 'Categoría'}</h1>
                    <Breadcrumbs items={breadcrumbs} className="container-breadcrumbs" />
                </div>
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