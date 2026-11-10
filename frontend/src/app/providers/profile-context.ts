import { createContext } from 'react';
import type { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import type { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import type { useOrdenesLogic } from '@/features/checkout/hooks/useOrdenesLogic';
import type { ProfileTabId } from '@/features/profile/lib/profileRoutes';

export type { ProfileTabId };

export type ProfileContextValue = {
    activeTab: ProfileTabId;
    profile: ReturnType<typeof useProfileLogic>;
    direcciones: ReturnType<typeof useDireccionesLogic>;
    ordenes: ReturnType<typeof useOrdenesLogic>;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);
