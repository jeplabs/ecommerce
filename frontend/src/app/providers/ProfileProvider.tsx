import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import { useOrdenesLogic } from '@/entities/order/model/useOrdenesLogic';
import { getProfileTabFromPath } from '@/features/profile/lib/profileRoutes';
import { ProfileContext, type ProfileContextValue } from './profile-context';

type ProfileProviderProps = {
    children: ReactNode;
};

export function ProfileProvider({ children }: ProfileProviderProps) {
    const { pathname } = useLocation();
    const activeTab = getProfileTabFromPath(pathname);

    const profile = useProfileLogic();
    const direcciones = useDireccionesLogic(true);
    const ordenes = useOrdenesLogic();

    const value: ProfileContextValue = {
        activeTab,
        profile,
        direcciones,
        ordenes,
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
