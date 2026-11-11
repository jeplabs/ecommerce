import { useParams } from 'react-router-dom';
import { AdminUserEditView } from '@/features/admin';

export function AdminUserEditRoute() {
    const { id } = useParams();
    return <AdminUserEditView userId={id ?? ''} />;
}

export { AdminUserEditRoute as AdminUserEditPage };
export default AdminUserEditRoute;
