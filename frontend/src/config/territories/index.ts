import { guatemalaTerritoryConfig } from './guatemala';
import { chileTerritoryConfig } from './chile';
import type { CountryCode, CountryTerritoryConfig } from './types';

export * from './types';
export { guatemalaTerritoryConfig } from './guatemala';
export { chileTerritoryConfig } from './chile';

export function getTerritoryConfig(countryCodeOrName?: string | null): CountryTerritoryConfig {
    if (!countryCodeOrName) {
        return guatemalaTerritoryConfig;
    }

    const normalized = countryCodeOrName.trim().toUpperCase();
    if (normalized === 'CL' || normalized === 'CHILE') {
        return chileTerritoryConfig;
    }

    // Default a Guatemala para el resto o GT
    return guatemalaTerritoryConfig;
}

