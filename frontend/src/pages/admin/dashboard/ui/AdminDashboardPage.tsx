import { useNavigate } from 'react-router-dom';
import AdminDashboardView from '@/widgets/admin/AdminDashboardView';

export function AdminDashboardPage() {
    const navigate = useNavigate();

    return <AdminDashboardView onNavigate={navigate} />;
}

export default AdminDashboardPage;
