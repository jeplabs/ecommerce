import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
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

export default function Producto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { productos, loading } = useProduct();
    const { addToCart } = useCart();
    
    const [producto, setProducto] = useState(null);
    const [imagenActiva, setImagenActiva] = useState("");
    const [tabActiva, setTabActiva] = useState("descripcion"); // 'descripcion' | 'caracteristicas'

    // Cargar datos del producto
    useEffect(() => {
        if (productos && productos.length > 0) {
            const encontrado = productos.find(p => p.id === parseInt(id));
            if (encontrado) {
                setProducto(encontrado);
                setImagenActiva(getMainProductImageUrl(encontrado));
            }
        }
    }, [id, productos]);

    if (loading) return <div className="loading-container">Cargando producto...</div>;
    if (!producto) return (
        <div className="error-container">
            <h2>Producto no encontrado</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
    );

    // 1. Construir Breadcrumbs desde las categorías
    const breadcrumbs = [
        { label: "Inicio", path: "/" },
        { label: "Catálogo", path: "/catalogo" },
        ...producto.categorias.map(cat => ({
            label: cat.nombre,
            path: `/categoria/${cat.id}` // Ajusta la ruta según tu router
        }))
    ];

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