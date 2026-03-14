import Navbar from "../../components/Navbar"
import { ProductForm } from "../../components/ProductForm";

export default function ProductNew() {
    return (
        <>
            <Navbar />
            <h1>Nuevo Producto</h1>
            <ProductForm />
        </>
    );
}