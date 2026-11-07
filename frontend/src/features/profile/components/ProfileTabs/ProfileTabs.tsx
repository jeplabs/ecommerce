import clsx from 'clsx';
import type { ProfileTabId } from '@/app/providers';
import styles from './ProfileTabs.module.css';

const TABS: Array<{ id: ProfileTabId; label: string; icon: string }> = [
    { id: 'datos', label: 'Mis datos', icon: '👤' },
    { id: 'direcciones', label: 'Direcciones', icon: '📍' },
    { id: 'ordenes', label: 'Mis pedidos', icon: '📦' },
    { id: 'favoritos', label: 'Favoritos', icon: '❤️' },
];

type ProfileTabsProps = {
    activeTab: ProfileTabId;
    onTabChange: (tabId: ProfileTabId) => void;
};

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    return (
        <nav className={styles.tabs} role="tablist" aria-label="Secciones del perfil">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={clsx(styles.btn, activeTab === tab.id && styles.btnActive)}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className={styles.icon} aria-hidden="true">{tab.icon}</span>
                    <span className={styles.label}>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}
