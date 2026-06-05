import { useParams } from 'react-router-dom';
import AdminUserEditView from '@/widgets/admin/AdminUserEditView';

export function AdminUserEditPage() {
    const { id } = useParams();

    return <AdminUserEditView userId={id ?? ''} />;
}

export default AdminUserEditPage;
