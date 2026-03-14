import Navbar from "../../components/Navbar"
import { useNavigate } from 'react-router-dom';

export default function ProductList() {
    const navigate = useNavigate();
    return (
        <>
            <Navbar />
            <main className="products-container">
                <h1>ProductList</h1>
                <button 
                    onClick={() => navigate('/admin/products/new')}
                    className='btn-submit'
                >
                    Agregar Producto
                </button>
            </main>
        </>
    );
}