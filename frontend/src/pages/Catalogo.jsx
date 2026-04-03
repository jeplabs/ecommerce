import Navbar from "../components/layout/Navbar/Navbar"
import Footer from "../components/layout/Footer/Footer"
import { ProductCatalog } from "../components/layout/ProductCatalog"
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav"

export default function Catalogo() {
    return (
        <>
            <Navbar />
            <CategoriasNav />
            <h1>Catalogo</h1>
            <ProductCatalog/>
            <Footer />
        </>
    );
}