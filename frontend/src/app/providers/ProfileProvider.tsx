import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';
import { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import { useOrdenesLogic } from '@/entities/order/model/useOrdenesLogic';

export type ProfileTabId = 'datos' | 'direcciones' | 'ordenes';

export type ProfileContextValue = {
    activeTab: ProfileTabId | string;
    setActiveTab: Dispatch<SetStateAction<ProfileTabId | string>>;
    profile: ReturnType<typeof useProfileLogic>;
    direcciones: ReturnType<typeof useDireccionesLogic>;
    ordenes: ReturnType<typeof useOrdenesLogic>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const useProfile = (): ProfileContextValue => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile debe usarse dentro de ProfileProvider');
    }
    return context;
};

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
