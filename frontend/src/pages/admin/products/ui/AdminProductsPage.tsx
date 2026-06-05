import { useNavigate } from 'react-router-dom';
import AdminProductListView from '@/widgets/admin/AdminProductListView';

export function AdminProductsPage() {
    const navigate = useNavigate();

    return <AdminProductListView onNavigate={navigate} />;
}

export default AdminProductsPage;
