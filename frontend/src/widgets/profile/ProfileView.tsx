import { ProfileProvider } from '@/app/providers';
import { useLocation } from 'react-router-dom';
import ProfileContent from '@/features/profile/ui/ProfileContent/ProfileContent';
import { getProfileTabFromPath } from '@/features/profile/lib/profileRoutes';
import styles from './ProfileView.module.css';

type ProfileViewProps = {
    initialTab?: never;
};

export default function ProfileView(_props: ProfileViewProps) {
    const { pathname } = useLocation();
    const activeTab = getProfileTabFromPath(pathname);

    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <header className={styles.header}>
                    <h1>Mi cuenta</h1>
                    <p>Gestiona tu perfil, direcciones y pedidos</p>
                </header>

                <ProfileProvider activeTab={activeTab}>
                    <ProfileContent />
                </ProfileProvider>
            </div>
        </main>
    );
}
