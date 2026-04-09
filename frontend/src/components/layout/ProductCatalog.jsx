import { useState, useEffect } from "react";
import { ProductCard } from "../ui/Card/ProductCard";
import { useProduct } from "../../context/ProductContext";
import { useNavigate } from "react-router-dom";
import { getMainProductImageUrl } from "../../utils/productImages";

export const ProductCatalog = ({  }) => {
    const { productos, loading } = useProduct();
    const navigate = useNavigate();
    const [productosCatalogo, setProductosCatalogo] = useState([]);

    useEffect(() => {
        if (productos && productos.length > 0) {
            setProductosCatalogo(productos);
            // console.log('ProductCatalog productos', productos);
        }
    }, [productos]);

    if (loading) {
        return <p>Cargando productos...</p>;
    }

    if (productos.length === 0) {
        return <p>No hay productos disponibles</p>;
    }

    return (
        <section className="product-catalog">
            <h2>Catálogo de productos</h2>
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