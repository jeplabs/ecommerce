import Navbar from "../components/Navbar"
import { ProductCatalog } from "../components/ProductCatalog"

function Home() {
    
    return (
        <>
            <Navbar />
            <h1>JEPLabs Ecommerce</h1>
            <ProductCatalog/>
        </>
    )
}

export default Home