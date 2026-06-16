import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '@/app/providers';
import pageStyles from '@/widgets/profile/ProfileView.module.css';
import { isProfilePath, PROFILE_TAB_PATHS } from '@/features/profile/lib/profileRoutes';
import type { ProfileTabId } from '@/app/providers';

import ProfileTabs from '../ProfileTabs/ProfileTabs';
import ProfileDataTab from '../ProfileDataTab/ProfileDataTab';
import AddressesTab from '../AddressesTab/AddressesTab';
import OrdersTab from '../OrdersTab/OrdersTab';
import FavoritesTab from '../FavoritesTab/FavoritesTab';

export default function ProfileContent() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { activeTab, profile } = useProfile();
    const { loading, error, usuario } = profile;

    const handleTabChange = (tabId: ProfileTabId) => {
        if (tabId === activeTab) return;
        navigate(PROFILE_TAB_PATHS[tabId]);
    };

    if (!isProfilePath(pathname)) {
        return <Navigate to="/profile" replace />;
    }

    if (loading && !usuario) {
        return <p className={pageStyles.loading}>Cargando perfil…</p>;
    }

    if (error && !usuario) {
        return (
            <div className={pageStyles.error}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <>
            <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

            <div className={pageStyles.panel} role="tabpanel">
                <div className={pageStyles.tabPanel} hidden={activeTab !== 'datos'}>
                    <ProfileDataTab />
                </div>
                <div className={pageStyles.tabPanel} hidden={activeTab !== 'direcciones'}>
                    <AddressesTab />
                </div>
                <div className={pageStyles.tabPanel} hidden={activeTab !== 'ordenes'}>
                    <OrdersTab />
                </div>
                <div className={pageStyles.tabPanel} hidden={activeTab !== 'favoritos'}>
                    <FavoritesTab />
                </div>
            </div>
        </>
    );
}
