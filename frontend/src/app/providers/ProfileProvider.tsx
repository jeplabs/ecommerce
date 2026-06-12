import { useState, type ReactNode } from 'react';
import { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import { useOrdenesLogic } from '@/entities/order/model/useOrdenesLogic';
import { ProfileContext, type ProfileContextValue, type ProfileTabId } from './profile-context';

type ProfileProviderProps = {
    children: ReactNode;
    initialTab?: ProfileTabId | string;
};

export function ProfileProvider({ children, initialTab = 'datos' }: ProfileProviderProps) {
    const [activeTab, setActiveTab] = useState<ProfileTabId | string>(initialTab);

    const profile = useProfileLogic();
    const direcciones = useDireccionesLogic(activeTab === 'direcciones');
    const ordenes = useOrdenesLogic();

    const value: ProfileContextValue = {
        activeTab,
        setActiveTab,
        profile,
        direcciones,
        ordenes,
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
