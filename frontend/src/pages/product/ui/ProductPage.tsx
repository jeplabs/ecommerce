import { useNavigate, useParams } from 'react-router-dom';
import ProductDetailView from '@/widgets/product-detail/ProductDetailView';
import '@/widgets/product-detail/ProductDetailView.css';

export function ProductPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    return (
        <main className="product-detail-page">
            <ProductDetailView
                slug={slug ?? ''}
                onBackHome={() => navigate('/')}
            />
        </main>
    );
}

export default ProductPage;
