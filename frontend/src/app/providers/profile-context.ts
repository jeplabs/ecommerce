import { createContext } from 'react';
import type { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import type { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import type { useOrdenesLogic } from '@/entities/order/model/useOrdenesLogic';
import type { Dispatch, SetStateAction } from 'react';

export type ProfileTabId = 'datos' | 'direcciones' | 'ordenes';

export type ProfileContextValue = {
    activeTab: ProfileTabId | string;
    setActiveTab: Dispatch<SetStateAction<ProfileTabId | string>>;
    profile: ReturnType<typeof useProfileLogic>;
    direcciones: ReturnType<typeof useDireccionesLogic>;
    ordenes: ReturnType<typeof useOrdenesLogic>;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);
