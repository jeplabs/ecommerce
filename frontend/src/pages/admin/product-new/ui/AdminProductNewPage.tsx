import { useNavigate } from 'react-router-dom';
import AdminProductNewView from '@/widgets/admin/AdminProductNewView';

export function AdminProductNewPage() {
    const navigate = useNavigate();

    return <AdminProductNewView onNavigate={navigate} />;
}

export default AdminProductNewPage;
