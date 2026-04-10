import { useState, useEffect } from "react";
import { ProductCard } from "../ui/Card/ProductCard";
import { useProduct } from "../../context/ProductContext";
import { useNavigate } from "react-router-dom";
import { getMainProductImageUrl } from "../../utils/productImages";

// Aceptamos productosExternos y loadingExterno como props opcionales
export const ProductCatalog = ({ productosExternos = null, loadingExterno = false }) => {
    const { productos: productosContexto, loading: loadingContexto } = useProduct();
    const navigate = useNavigate();
    
    // Si recibimos productos externos (ej. por categoría), los usamos. Si no, los del contexto.
    const productosAUsar = productosExternos !== null ? productosExternos : productosContexto;
    const loadingAUsar = loadingExterno !== false ? loadingExterno : loadingContexto;

    const [productosCatalogo, setProductosCatalogo] = useState([]);

    useEffect(() => {
        if (productosAUsar && productosAUsar.length > 0) {
            setProductosCatalogo(productosAUsar);
        }
    }, [productosAUsar]);

    if (loadingAUsar) {
        return <p className="center-message">Cargando productos...</p>;
    }

    if (!productosAUsar || productosAUsar.length === 0) {
        return <p className="center-message">No hay productos disponibles en esta sección.</p>;
    }

    return (
        <section className="product-catalog">
            {/* <h2>Catálogo de productos</h2> */}
            <br />
            <div className="admin-product-grid">
                {productosCatalogo.map((producto) => (
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
        </section>
    );
};