import { useProfile } from '@/app/providers';
import pageStyles from '@/widgets/profile/ProfileView.module.css';

import ProfileTabs from '../ProfileTabs/ProfileTabs';
import ProfileDataTab from '../ProfileDataTab/ProfileDataTab';
import AddressesTab from '../AddressesTab/AddressesTab';
import OrdersTab from '../OrdersTab/OrdersTab';

export default function ProfileContent() {
    const { activeTab, setActiveTab, profile } = useProfile();
    const { loading, error } = profile;

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
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className={pageStyles.panel} role="tabpanel">
                {activeTab === 'datos' && <ProfileDataTab />}
                {activeTab === 'direcciones' && <AddressesTab />}
                {activeTab === 'ordenes' && <OrdersTab />}
            </div>
        </>
    );
}
