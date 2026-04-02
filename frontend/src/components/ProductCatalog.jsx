import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { useProduct } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";

export const ProductCatalog = ({  }) => {
    const { productos, loading } = useProduct();
    const navigate = useNavigate();
    const [productosCatalogo, setProductosCatalogo] = useState([]);

    useEffect(() => {
        if (productos && productos.length > 0) {
            setProductosCatalogo(productos);
            console.log('ProductCatalog productos', productos);
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
                    imageSrc={producto.imagenesUrl[0]}
                    altText={producto.altText} 
                    title={producto.nombre} 
                    description={producto.descripcion} 
                    price={producto.precioVenta} 
                    actionLabel={producto.actionLabel} 
                    onAction={() => navigate(`/producto/${producto.id}`) || alert(`Ver detalle del producto ${producto.nombre}`)}
                    />
                ))}
            </div>
        </section>
    );
};