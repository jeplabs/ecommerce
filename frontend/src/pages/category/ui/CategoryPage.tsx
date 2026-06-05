import { useLocation } from 'react-router-dom';
import CategoryProductsView from '@/widgets/catalog/CategoryProductsView';

export function CategoryPage() {
    const location = useLocation();
    const categoriaRuta = location.pathname
        .replace(/^\/categoria\/?/, '')
        .replace(/\/$/, '');
    const segmentos = categoriaRuta.split('/').filter(Boolean);
    const slugPath = segmentos.join('/');

    return <CategoryProductsView slugPath={slugPath} segmentos={segmentos} />;
}

export default CategoryPage;
