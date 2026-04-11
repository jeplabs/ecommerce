import { useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar";
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav";
import Footer from "../components/layout/Footer/Footer";
import { ProductCatalog } from "../components/layout/ProductCatalog";
import { useProductosByCategory } from "../hooks/useProductosByCategory";
import { useCategorias } from "../context/CategoriasContext"; // Para mostrar el nombre de la categoría

// Función auxiliar recursiva para buscar en todo el árbol
const buscarNombreCategoria = (arbol, idBuscado) => {
    for (const categoria of arbol) {
        // 1. Verificar si es la categoría actual
        if (categoria.id === parseInt(idBuscado)) {
            return categoria.nombre;
        }0
        
        // 2. Si tiene subcategorías, buscar recursivamente en ellas
        if (categoria.subcategorias && categoria.subcategorias.length > 0) {
            const encontrado = buscarNombreCategoria(categoria.subcategorias, idBuscado);
            if (encontrado) return encontrado;
        }
    }
    return null; // No encontrada
};

// // Función auxiliar recursiva para buscar el objeto completo por slug
// const buscarCategoriaPorSlug = (arbol, slugBuscado) => {
//     for (const categoria of arbol) {
//         if (categoria.slug === slugBuscado) {
//             return categoria;
//         }
//         if (categoria.subcategorias && categoria.subcategorias.length > 0) {
//             const encontrado = buscarCategoriaPorSlug(categoria.subcategorias, slugBuscado);
//             if (encontrado) return encontrado;
//         }
//     }
//     return null;
// };

export default function CategoriaProductos() {
    // const { slug } = useParams(); 
    const { id } = useParams(); 
    const { productos, loading, error, paginaActual, setPaginaActual, totalPaginas } = useProductosByCategory(id);
    const { arbolCategorias } = useCategorias(); 

    // Usamos la función recursiva en lugar de .find() simple
    const nombreCategoria = buscarNombreCategoria(arbolCategorias, id) || "Categoría";

    // // Buscar el objeto de la categoría basado en el slug
    // const categoriaActual = buscarCategoriaPorSlug(arbolCategorias, slug);
    // const nombreCategoria = categoriaActual ? categoriaActual.nombre : "Categoría";

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