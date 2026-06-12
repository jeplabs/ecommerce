import { useContext } from 'react';
import { ProfileContext, type ProfileContextValue } from './profile-context';

export type { ProfileContextValue, ProfileTabId } from './profile-context';

export function useProfile(): ProfileContextValue {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile debe usarse dentro de ProfileProvider');
    }
    return context;
}
