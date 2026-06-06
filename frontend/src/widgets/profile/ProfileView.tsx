import { ProfileProvider } from '@/app/providers';
import { useLocation } from 'react-router-dom';
import ProfileContent from '@/features/profile/ui/ProfileContent/ProfileContent';
import './ProfileView.css';

type ProfileViewProps = {
    initialTab?: string;
};

export default function ProfileView({ initialTab: initialTabProp }: ProfileViewProps) {
    const location = useLocation();
    const initialTab =
        initialTabProp ?? (location.state as { tab?: string } | null)?.tab ?? 'datos';

    return (
        <main className="profile-page">
            <div className="profile-page__inner">
                <header className="profile-page__header">
                    <h1>Mi cuenta</h1>
                    <p>Gestiona tu perfil, direcciones y pedidos</p>
                </header>

                <ProfileProvider initialTab={initialTab}>
                    <ProfileContent />
                </ProfileProvider>
            </div>
        </main>
    );
}
