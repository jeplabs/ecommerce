import type { ProfileTabId } from '@/app/providers/ProfileProvider';
import './ProfileTabs.css';

const TABS: Array<{ id: ProfileTabId; label: string; icon: string }> = [
    { id: 'datos', label: 'Mis datos', icon: '👤' },
    { id: 'direcciones', label: 'Direcciones', icon: '📍' },
    { id: 'ordenes', label: 'Mis pedidos', icon: '📦' },
];

type ProfileTabsProps = {
    activeTab: ProfileTabId | string;
    onTabChange: (tabId: ProfileTabId | string) => void;
};

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    return (
        <nav className="profile-tabs" role="tablist" aria-label="Secciones del perfil">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`profile-tabs__btn ${activeTab === tab.id ? 'profile-tabs__btn--active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className="profile-tabs__icon" aria-hidden="true">{tab.icon}</span>
                    <span className="profile-tabs__label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}
