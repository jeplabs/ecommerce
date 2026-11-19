import { useNavigate, Outlet } from 'react-router-dom';
import { AdminProductListView } from '@/features/admin';

export function AdminProductsRoute() {
    const navigate = useNavigate();
    return (
        <>
            <AdminProductListView onNavigate={navigate} />
            <Outlet />
        </>
    );
}

export { AdminProductsRoute as AdminProductsPage };
export default AdminProductsRoute;
