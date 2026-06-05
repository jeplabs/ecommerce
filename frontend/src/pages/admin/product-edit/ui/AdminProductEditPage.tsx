import { useNavigate, useParams } from 'react-router-dom';
import AdminProductEditView from '@/widgets/admin/AdminProductEditView';

export function AdminProductEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <AdminProductEditView
            productId={id ?? ''}
            onNavigate={navigate}
        />
    );
}

export default AdminProductEditPage;
