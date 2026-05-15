import './ProfileTabs.css';

const TABS = [
    { id: 'datos', label: 'Mis datos', icon: '👤' },
    { id: 'direcciones', label: 'Direcciones', icon: '📍' },
    { id: 'ordenes', label: 'Mis pedidos', icon: '📦' },
];

export default function ProfileTabs({ activeTab, onTabChange }) {
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
