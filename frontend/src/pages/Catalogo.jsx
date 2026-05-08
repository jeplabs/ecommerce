import Navbar from "../components/layout/Navbar/Navbar"
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav"
import Breadcrumbs from "../components/ui/Breadcrumbs/Breadcrumbs"
import { ProductCatalog } from "../components/layout/ProductCatalog"
import Footer from "../components/layout/Footer/Footer"
import { useProductosByCategory } from "../hooks/useProductosByCategory"
import { useCategorias } from "../context/CategoriasContext";
import { useLocation } from "react-router-dom";

export default function Catalogo() {
    // const location = useLocation();
    // const categoriaRuta = location.pathname.replace(/^\/categoria\/?/, '').replace(/\/$/, '');
    // const segmentos = categoriaRuta.split('/').filter(Boolean);
    // const slugPath = segmentos.join('/');
    // const { productos, loading, error, paginaActual, setPaginaActual, totalPaginas } = useProductosByCategory(slugPath);
    // const { arbolCategorias } = useCategorias(); 

    // const categoriaActual = buscarCategoriaPorPath(arbolCategorias, segmentos);
    // const nombreCategoria = categoriaActual ? categoriaActual.nombre : segmentos.length === 0 ? "Categorías" : "Categoría";

    const breadcrumbs = [
        { label: "Inicio", path: "/" },
        { label: "Catálogo", path: "/catalogo" }
    ];

    // Si tenemos una categoría actual y segmentos, reconstruimos la ruta padre
    // // if (categoriaActual && segmentos.length > 0) {
    //     let rutaAcumulada = "";
        
    //     // Recorremos los segmentos de la URL para crear los pasos intermedios
    //     segmentos.forEach((slug, index) => {
    //         rutaAcumulada += `/${slug}`;
            
    //         // Buscamos el nombre de esta categoría específica en el árbol para mostrar el nombre correcto
    //         // Nota: Esto es una búsqueda simple, si el árbol es muy profundo podría optimizarse, 
    //         // pero para breadcrumbs funciona bien.
    //         const catEnNivel = buscarCategoriaPorPath(arbolCategorias, segmentos.slice(0, index + 1));
            
    //         if (catEnNivel) {
    //             // Si es el último segmento, es la categoría actual (podemos omitirla del link si quieres, o dejarla)
    //             const esUltimo = index === segmentos.length - 1;
    //             breadcrumbs.push({
    //                 label: catEnNivel.nombre,
    //                 path: esUltimo ? null : `/categoria${rutaAcumulada}` // null o sin path para el elemento actual activo
    //             });
    //         }
    //     });
    // }

    return (
        <>
            <Navbar />
            <CategoriasNav />
            <div className="container">
                <div className="container-header">
                    <h1>Catalogo</h1>
                    <Breadcrumbs items={breadcrumbs} className="container-breadcrumbs" />
                </div>
            <ProductCatalog/>
            </div>
            <Footer />
        </>
    );
}