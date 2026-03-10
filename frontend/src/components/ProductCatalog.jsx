import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";

export const ProductCatalog = ({  }) => {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        setProducts([
            {
                id: 1,
                imageSrc: "https://picsum.photos/id/10/400/300",
                altText: "Imagen de un producto",
                title: "Producto 1",
                description: "Descripción del producto 1",
                price: "$10.99",
                actionLabel: "Ver producto",
                onAction: () => alert("Producto 1 seleccionado"),
            },
            {
                id: 2,
                imageSrc: "https://picsum.photos/id/20/400/300",
                altText: "Imagen de un producto",
                title: "Producto 2",
                description: "Descripción del producto 2",
                price: "$19.99",
                actionLabel: "Ver producto",
                onAction: () => alert("Producto 2 seleccionado"),
            },
            {
                id: 3,
                imageSrc: "https://picsum.photos/id/30/400/300",
                altText: "Imagen de un producto",
                title: "Producto 3",
                description: "Descripción del producto 3",
                price: "$29.99",
                actionLabel: "Ver producto",
                onAction: () => alert("Producto 3 seleccionado"),
            },
            {
                id: 4,
                imageSrc: "https://picsum.photos/id/40/400/300",
                altText: "Imagen de un producto",
                title: "Producto 4",
                description: "Descripción del producto 4",
                price: "$39.99",
                actionLabel: "Ver producto",
                onAction: () => alert("Producto 4 seleccionado"),
            },
            {
                id: 5,
                imageSrc: "https://picsum.photos/id/50/400/300",
                altText: "Imagen de un producto",
                title: "Producto 5",
                description: "Descripción del producto 5",
                price: "$49.99",
                actionLabel: "Ver producto",
                onAction: () => alert("Producto 5 seleccionado"),
            },
            {
                id: 6,
                imageSrc: "https://picsum.photos/id/60/400/300",
                altText: "Imagen de un producto",
                title: "Producto 6",
                description: "Descripción del producto 6",
                price: "$59.99",
                actionLabel: "Ver producto",
                onAction: () => alert("Producto 6 seleccionado"),
            },
        ]);
    },[]);

    if (products.length === 0) {
        return <p>No hay productos disponibles</p>;
    }

    return (
        <section className="product-catalog">
            <h2>Catálogo de productos</h2>
            <br />
            <div className="product-list">
                {products.map((product) => (
                    <ProductCard 
                    key={product.id} 
                    imageSrc={product.imageSrc} 
                    altText={product.altText} 
                    title={product.title} 
                    description={product.description} 
                    price={product.price} 
                    actionLabel={product.actionLabel} 
                    onAction={() => product.onAction()}
                    />
                ))}
            </div>
        </section>
    );
};