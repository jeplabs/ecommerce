import { createContext } from 'react';
import type { AppConfig } from '@/shared/lib/app-config';

export interface ConfigContextValue extends AppConfig {
    isChile: boolean;
    isGuatemala: boolean;
    refreshConfig: () => Promise<void>;
}

export const ConfigContext = createContext<ConfigContextValue | null>(null);

