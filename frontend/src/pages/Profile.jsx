import { ProfileProvider } from '@/app/providers';
import { useLocation } from 'react-router-dom';
import ProfileContent from '@/features/profile/ui/ProfileContent/ProfileContent';
import './Profile.css';

export default function Profile() {
    const location = useLocation();
    const initialTab = location.state?.tab || 'datos';
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
