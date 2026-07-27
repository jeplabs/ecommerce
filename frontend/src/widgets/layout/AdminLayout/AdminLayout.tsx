import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Navbar from '@/widgets/layout/Navbar/Navbar';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import type { CategoryBreadcrumbItem } from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import styles from './AdminLayout.module.css';

const ROUTE_LABELS: Record<string, string> = {
    admin: 'Admin',
    products: 'Productos',
    users: 'Usuarios',
    orders: 'Pedidos',
    new: 'Nuevo',
    edit: 'Editar',
};

function getBreadcrumbItems(pathname: string): CategoryBreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean);
    const items: CategoryBreadcrumbItem[] = [];

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const label = ROUTE_LABELS[segment] ?? segment;
        const isLast = i === segments.length - 1;
        const isId = /^\d+$/.test(segment);

        if (isId) continue;

        if (isLast) {
            items.push({ label });
        } else {
            const path = '/' + segments.slice(0, i + 1).join('/');
            items.push({ label, path });
        }
    }

    return items;
}

export default function AdminLayout() {
    const location = useLocation();
    const isSubRoute = /\/(new|edit|\d+\/edit)/.test(location.pathname);

    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>
                {isSubRoute ? (
                    <div className={styles.breadcrumbBar}>
                        <Breadcrumbs items={getBreadcrumbItems(location.pathname)} />
                    </div>
                ) : (
                    <nav className={styles.tabs} aria-label="Navegación de administración">
                        <NavLink to="/admin" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
                            Usuarios
                        </NavLink>
                        <NavLink to="/admin/products" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
                            Productos
                        </NavLink>
                        <NavLink to="/admin/orders" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
                            Pedidos
                        </NavLink>
                    </nav>
                )}
                <Outlet />
            </main>
        </div>
    );
}
