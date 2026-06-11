import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import type { CategoryBreadcrumbItem } from '@/widgets/catalog/lib/category-tree';
import { ProductCatalog } from '@/widgets/layout/ProductCatalog';
import styles from './CatalogShell.module.css';

const BREADCRUMBS: CategoryBreadcrumbItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Catálogo', path: '/catalogo' },
];

export default function CatalogView() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Catalogo</h1>
                <Breadcrumbs items={BREADCRUMBS} className={styles.breadcrumbsSlot} />
            </div>
            <ProductCatalog />
        </div>
    );
}
