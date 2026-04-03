import Navbar from "../components/layout/Navbar/Navbar"
import Footer from "../components/layout/Footer/Footer"
import { ProductCatalog } from "../components/layout/ProductCatalog"

function Home() {
    
    return (
        <>
            <Navbar />
            <h1>JEPLabs Ecommerce</h1>
            <ProductCatalog/>
            <Footer />
        </>
    )
}

export default Home