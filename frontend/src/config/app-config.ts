import { getCurrencyConfig, setCurrencyConfig, type CurrencyConfig } from '@/shared/lib/format';

export type CountryCode = 'GT' | 'CL';

export interface AppConfig {
    paisCodigo: CountryCode;
    paisNombre: string;
    porcentajeIva: number;
    montoMinimoEnvioGratis: number;
    storageProvider: string;
    moneda: CurrencyConfig;
}

const defaultAppConfig: AppConfig = {
    paisCodigo: ((import.meta.env.VITE_PAIS_CODIGO || 'GT').toUpperCase() as CountryCode),
    paisNombre: import.meta.env.VITE_PAIS_NOMBRE || 'Guatemala',
    porcentajeIva: Number(import.meta.env.VITE_PORCENTAJE_IVA ?? 0.12),
    montoMinimoEnvioGratis: Number(import.meta.env.VITE_MONTO_MINIMO_ENVIO_GRATIS ?? 500),
    storageProvider: import.meta.env.VITE_STORAGE_PROVIDER || 'cloudinary',
    moneda: getCurrencyConfig(),
};

let activeAppConfig: AppConfig = { ...defaultAppConfig };

export function setAppConfig(config: Partial<AppConfig>): void {
    if (config.moneda) {
        setCurrencyConfig(config.moneda);
    }
    activeAppConfig = {
        ...activeAppConfig,
        ...config,
        moneda: config.moneda
            ? { ...activeAppConfig.moneda, ...config.moneda }
            : getCurrencyConfig(),
    };
}

export function getAppConfig(): AppConfig {
    return activeAppConfig;
}

