import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import type { CategoryBreadcrumbItem } from '../../types';
import { ProductCatalog } from '../ProductCatalog/ProductCatalog';
import styles from './CatalogView.module.css';

const BREADCRUMBS: CategoryBreadcrumbItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Catálogo', path: '/catalogo' },
];

export function CatalogView() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Catálogo</h1>
                <Breadcrumbs items={BREADCRUMBS} className={styles.breadcrumbsSlot} />
            </div>
            <ProductCatalog />
        </div>
    );
}

export default CatalogView;
