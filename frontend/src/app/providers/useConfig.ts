import { useContext } from 'react';
import { ConfigContext, type ConfigContextValue } from './config-context';
import { getAppConfig } from '@/shared/lib/app-config';

export function useConfig(): ConfigContextValue {
    const ctx = useContext(ConfigContext);
    if (!ctx) {
        const fallback = getAppConfig();
        return {
            ...fallback,
            isChile: fallback.paisCodigo === 'CL',
            isGuatemala: fallback.paisCodigo === 'GT',
            refreshConfig: async () => {},
        };
    }
    return ctx;
}

