import { useProfile } from '../../../context/ProfileContext';
import ProfileTabs from '../ProfileTabs/ProfileTabs';
import ProfileDataTab from '../ProfileDataTab/ProfileDataTab';
import AddressesTab from '../AddressesTab/AddressesTab';
import OrdersTab from '../OrdersTab/OrdersTab';

export default function ProfileContent() {
    const { activeTab, setActiveTab, profile } = useProfile();
    const { loading, error } = profile;

    if (loading) {
        return <p className="profile-page__loading">Cargando perfil…</p>;
    }

    if (error) {
        return (
            <div className="profile-page__error">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <>
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="profile-page__panel" role="tabpanel">
                {activeTab === 'datos' && <ProfileDataTab />}
                {activeTab === 'direcciones' && <AddressesTab />}
                {activeTab === 'ordenes' && <OrdersTab />}
            </div>
        </>
    );
}
