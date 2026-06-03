import { createContext, useContext, useState } from 'react';
import { useProfileLogic } from '@/entities/user/model/useProfileLogic';
import { useDireccionesLogic } from '@/entities/address/model/useDireccionesLogic';
import { useOrdenesLogic } from '@/entities/order/model/useOrdenesLogic';

const ProfileContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile debe usarse dentro de ProfileProvider');
    }
    return context;
};

export function ProfileProvider({ children, initialTab = 'datos' }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    const profile = useProfileLogic();
    const direcciones = useDireccionesLogic(activeTab === 'direcciones');
    const ordenes = useOrdenesLogic();

    const value = {
        activeTab,
        setActiveTab,
        profile,
        direcciones,
        ordenes,
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
