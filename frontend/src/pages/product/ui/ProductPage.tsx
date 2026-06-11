import { useNavigate, useParams } from 'react-router-dom';
import ProductDetailView from '@/widgets/product-detail/ProductDetailView';
import styles from '@/widgets/product-detail/ProductDetailView.module.css';

export function ProductPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    return (
        <main className={styles.page}>
            <ProductDetailView slug={slug ?? ''} onBackHome={() => navigate('/')} />
        </main>
    );
}

export default ProductPage;
