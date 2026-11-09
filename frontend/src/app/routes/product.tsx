import { useNavigate, useParams } from 'react-router-dom';
import { ProductDetailView } from '@/features/catalog';
import styles from '@/features/catalog/components/ProductDetailView/ProductDetailView.module.css';

export default function ProductRoute() {
    const { slug } = useParams();
    const navigate = useNavigate();

    return (
        <main className={styles.page}>
            <ProductDetailView slug={slug ?? ''} onBackHome={() => navigate('/')} />
        </main>
    );
}
