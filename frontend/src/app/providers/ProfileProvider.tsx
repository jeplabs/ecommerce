import type { ReactNode } from 'react';
import { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import { useOrdenesLogic } from '@/entities/order/model/useOrdenesLogic';
import { ProfileContext, type ProfileContextValue, type ProfileTabId } from './profile-context';

type ProfileProviderProps = {
    children: ReactNode;
    activeTab: ProfileTabId;
};

export function ProfileProvider({ children, activeTab }: ProfileProviderProps) {
    const profile = useProfileLogic();
    const direcciones = useDireccionesLogic(activeTab === 'direcciones');
    const ordenes = useOrdenesLogic();

    const value: ProfileContextValue = {
        activeTab,
        profile,
        direcciones,
        ordenes,
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
