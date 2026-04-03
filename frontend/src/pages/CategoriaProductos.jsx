import Navbar from "../components/layout/Navbar/Navbar"
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav"
import Footer from "../components/layout/Footer/Footer"

export default function CategoriaProductos({ id }) {
    return (
        <>
            <Navbar />
            <CategoriasNav />
            <h1>CategoriaProductos</h1>
            <Footer />
        </>
    );
}