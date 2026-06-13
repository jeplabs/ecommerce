import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/app/providers';
import pageStyles from '@/widgets/profile/ProfileView.module.css';
import { PROFILE_TAB_PATHS } from '@/features/profile/lib/profileRoutes';
import type { ProfileTabId } from '@/app/providers';

import ProfileTabs from '../ProfileTabs/ProfileTabs';
import ProfileDataTab from '../ProfileDataTab/ProfileDataTab';
import AddressesTab from '../AddressesTab/AddressesTab';
import OrdersTab from '../OrdersTab/OrdersTab';

export default function ProfileContent() {
    const navigate = useNavigate();
    const { activeTab, profile } = useProfile();
    const { loading, error } = profile;

    const handleTabChange = (tabId: ProfileTabId) => {
        navigate(PROFILE_TAB_PATHS[tabId]);
    };

    if (loading) {
        return <p className={pageStyles.loading}>Cargando perfil…</p>;
    }

    if (error) {
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
                {activeTab === 'datos' && <ProfileDataTab />}
                {activeTab === 'direcciones' && <AddressesTab />}
                {activeTab === 'ordenes' && <OrdersTab />}
            </div>
        </>
    );
}
