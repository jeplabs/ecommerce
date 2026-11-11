import { useNavigate } from 'react-router-dom';
import { AdminProductNewView } from '@/features/admin';

export function AdminProductNewRoute() {
    const navigate = useNavigate();
    return <AdminProductNewView onNavigate={navigate} />;
}

export { AdminProductNewRoute as AdminProductNewPage };
export default AdminProductNewRoute;
