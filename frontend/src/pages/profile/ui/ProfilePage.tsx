import ProfileContent from '@/features/profile/ui/ProfileContent/ProfileContent';
import styles from '@/widgets/profile/ProfileView.module.css';

export function ProfilePage() {
    return (
        <main className={styles.page}>
            <div className={styles.inner}>
                <header className={styles.header}>
                    <h1>Mi cuenta</h1>
                    <p>Gestiona tu perfil, direcciones y pedidos</p>
                </header>

                <ProfileContent />
            </div>
        </main>
    );
}

export default ProfilePage;
