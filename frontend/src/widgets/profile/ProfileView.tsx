import { ProfileProvider } from '@/app/providers';
import ProfileContent from '@/features/profile/ui/ProfileContent/ProfileContent';
import styles from './ProfileView.module.css';

export default function ProfileView() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <header className={styles.header}>
                    <h1>Mi cuenta</h1>
                    <p>Gestiona tu perfil, direcciones y pedidos</p>
                </header>

                <ProfileProvider>
                    <ProfileContent />
                </ProfileProvider>
            </div>
        </main>
    );
}
