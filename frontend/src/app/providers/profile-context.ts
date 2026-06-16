import { createContext } from 'react';
import type { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import type { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import type { useOrdenesLogic } from '@/entities/order/model/useOrdenesLogic';
export type ProfileTabId = 'datos' | 'direcciones' | 'ordenes' | 'favoritos';

export type ProfileContextValue = {
    activeTab: ProfileTabId;
    profile: ReturnType<typeof useProfileLogic>;
    direcciones: ReturnType<typeof useDireccionesLogic>;
    ordenes: ReturnType<typeof useOrdenesLogic>;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);
