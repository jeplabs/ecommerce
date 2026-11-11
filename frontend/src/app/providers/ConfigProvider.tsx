import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ConfigContext, type ConfigContextValue } from './config-context';
import { getAppConfig, setAppConfig, type AppConfig } from '@/config';

interface ConfigProviderProps {
    children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
    const [config, setConfigState] = useState<AppConfig>(getAppConfig);

    const fetchConfig = useCallback(async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const res = await fetch(`${API_URL}/api/config`);
            if (res.ok) {
                const data = (await res.json()) as Partial<AppConfig>;
                setAppConfig(data);
                setConfigState(getAppConfig());
            }
        } catch {
            // Mantiene el fallback local si el servidor aún no responde
        }
    }, []);

    useEffect(() => {
        void fetchConfig();
    }, [fetchConfig]);

    const value: ConfigContextValue = {
        ...config,
        isChile: config.paisCodigo === 'CL',
        isGuatemala: config.paisCodigo === 'GT',
        refreshConfig: fetchConfig,
    };

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

