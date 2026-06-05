import { useAuth, useCart, useToast } from '@/app/providers';
import HomeContent from '@/widgets/home/HomeContent';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const handleAddToCart = async (productoId: number, productoNombre: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const result = await addToCart(productoId, 1);
        if (result.success) {
            showSuccess(`${productoNombre} agregado al carrito`);
        } else {
            showError(result.error || 'No se pudo agregar el producto');
        }
    };

    return <HomeContent onAddToCart={handleAddToCart} />;
}

export default HomePage;
