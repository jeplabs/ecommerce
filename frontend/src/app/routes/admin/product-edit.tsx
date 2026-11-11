import { useNavigate, useParams } from 'react-router-dom';
import { AdminProductEditView } from '@/features/admin';

export function AdminProductEditRoute() {
    const navigate = useNavigate();
    const { id } = useParams();
    return <AdminProductEditView productId={id ?? ''} onNavigate={navigate} />;
}

export { AdminProductEditRoute as AdminProductEditPage };
export default AdminProductEditRoute;
