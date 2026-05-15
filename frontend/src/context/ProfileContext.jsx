import { createContext, useContext, useState } from 'react';
import { useProfileLogic } from '../hooks/useProfileLogic';
import { useDireccionesLogic } from '../hooks/useDireccionesLogic';
import { useOrdenesLogic } from '../hooks/useOrdenesLogic';

const ProfileContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile debe usarse dentro de ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children, initialTab = 'datos' }) => {
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

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};
