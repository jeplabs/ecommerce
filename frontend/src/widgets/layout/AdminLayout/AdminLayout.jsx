import { Outlet } from 'react-router-dom';
import Navbar from '@/widgets/layout/Navbar/Navbar';
import './AdminLayout.css';

/** Panel admin: solo navbar global; sin categorías ni footer de tienda. */
export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <Navbar />
            <main className="admin-layout__main">
                <Outlet />
            </main>
        </div>
    );
}
