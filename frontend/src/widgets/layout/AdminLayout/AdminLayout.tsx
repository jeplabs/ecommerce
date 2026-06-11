import { Outlet } from 'react-router-dom';
import Navbar from '@/widgets/layout/Navbar/Navbar';
import styles from './AdminLayout.module.css';

/** Panel admin: solo navbar global; sin categorías ni footer de tienda. */
export default function AdminLayout() {
    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}
