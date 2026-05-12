import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
import { useCategorias } from "../context/CategoriasContext";
import { useCart } from "../context/CartContext";
import { getProductImageUrls, getMainProductImageUrl } from "../utils/productImages";
import Navbar from "../components/layout/Navbar/Navbar";
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav";
import Breadcrumbs from "../components/ui/Breadcrumbs/Breadcrumbs";
import ProductGallery from "../components/product/ProductGallery/ProductGallery";
import ProductInfo from "../components/product/ProductInfo/ProductInfo";
import ProductTabs from "../components/product/ProductTabs/ProductTabs";
import Footer from "../components/layout/Footer/Footer";
import "./Producto.css";

// Función auxiliar para encontrar la ruta completa de una categoría dado su ID o Slug
const encontrarRutaCategoria = (arbol, targetId, currentPath = []) => {
    for (const cat of arbol) {
        // Si encontramos la categoría objetivo
        if (cat.id === targetId || cat.slug === targetId) {
            return [...currentPath, cat];
        }
        // Si tiene subcategorías, buscamos recursivamente
        if (cat.subcategorias && cat.subcategorias.length > 0) {
            const resultado = encontrarRutaCategoria(cat.subcategorias, targetId, [...currentPath, cat]);
            if (resultado) return resultado;
        }
    }
    return null;
};

export default function Producto() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { productos, loading } = useProduct();
    const { arbolCategorias } = useCategorias();
    const { addToCart } = useCart();
    
    const [producto, setProducto] = useState(null);
    const [imagenActiva, setImagenActiva] = useState("");
    const [tabActiva, setTabActiva] = useState("descripcion"); 

    // Cargar datos del producto
    useEffect(() => {
        if (productos && productos.length > 0) {
            const encontrado = productos.find(p => p.slug === slug || p.id === parseInt(slug));
            if (encontrado) {
                setProducto(encontrado);
                setImagenActiva(getMainProductImageUrl(encontrado));
            }
        }
    }, [slug, productos]);

    if (loading) return <div className="loading-container">Cargando producto...</div>;
    if (!producto) return (
        <div className="error-container">
            <h2>Producto no encontrado</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
    );

    // 1. Construir Breadcrumbs desde las categorías
    // const breadcrumbs = [
    //     { label: "Inicio", path: "/" },
    //     // { label: "Catálogo", path: "/catalogo" },
    //     ...producto.categorias.map(cat => ({
    //         label: cat.nombre,
    //         path: `/categoria/${cat.slug || cat.id}` // Ajusta la ruta según tu router
    //     }))
    // ];
    const breadcrumbs = [
        { label: "Inicio", path: "/" },
        { label: "Catálogo", path: "/catalogo" },
    ];

    // Asumimos que la última categoría en producto.categorias es la más específica
    // Si tu backend envía todas las categorías padres e hijos, tomamos la última como la "actual"
    const categoriaProducto = producto.categorias && producto.categorias.length > 0 
        ? producto.categorias[producto.categorias.length - 1] 
        : null;

    if (categoriaProducto && arbolCategorias) {
        // Buscamos la jerarquía completa (Padre -> Hijo -> Nieto) para esta categoría
        const rutaCompleta = encontrarRutaCategoria(arbolCategorias, categoriaProducto.id || categoriaProducto.slug);
        
        if (rutaCompleta) {
            rutaCompleta.forEach((cat, index) => {
                // Construimos el path acumulativo: /cat-padre/cat-hijo
                const pathSegmentos = rutaCompleta.slice(0, index + 1).map(c => c.slug || c.id);
                const path = `/categoria/${pathSegmentos.join('/')}`;
                
                breadcrumbs.push({
                    label: cat.nombre,
                    path: path
                });
            });
        } else {
            // Fallback si no se encuentra en el árbol (por seguridad)
            producto.categorias.forEach(cat => {
                breadcrumbs.push({
                    label: cat.nombre,
                    path: `/categoria/${cat.slug || cat.id}`
                });
            });
        }
    }

    // Página actual: el producto (sin path). Así todas las categorías del árbol son enlaces;
    // si el último crumb fuera la categoría, Breadcrumbs la trataría como "actual" y no sería clickeable.
    breadcrumbs.push({ label: producto.nombre });

    // 2. Formatear precio
    const precioFormateado = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: producto.moneda || 'CLP'
    }).format(producto.precioVenta);

    // 3. Convertir objeto specs a array para mapear
    const specsArray = producto.specs ? Object.entries(producto.specs) : [];

    return (
        <>
            <Navbar />
            <CategoriasNav />
            <main className="product-detail-page">
                <div className="pd-container">
                    <Breadcrumbs items={breadcrumbs} />
                    <div className="pd-main-grid">
                        <ProductGallery producto={producto} />
                        <ProductInfo 
                            producto={producto} 
                            precioFormateado={precioFormateado} 
                            onAddToCart={addToCart}
                        />
                    </div>
                    <ProductTabs producto={producto} />
                </div>
            </main>
            <Footer />
        </>
    );
}