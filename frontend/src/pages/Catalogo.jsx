import Navbar from "../components/layout/Navbar/Navbar"
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav"
import Breadcrumbs from "../components/ui/Breadcrumbs/Breadcrumbs"
import { ProductCatalog } from "../components/layout/ProductCatalog"
import Footer from "../components/layout/Footer/Footer"
import { useProductosByCategory } from "../hooks/useProductosByCategory"
import { useCategorias } from "../context/CategoriasContext";
import { useLocation } from "react-router-dom";
import "./Catalogo.css"

export default function Catalogo() {

    const breadcrumbs = [
        { label: "Inicio", path: "/" },
        { label: "Catálogo", path: "/catalogo" }
    ];

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