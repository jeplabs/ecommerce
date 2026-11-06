export type CountryCode = 'GT' | 'CL';

export interface CountryTerritoryConfig {
    code: CountryCode;
    name: string;
    labels: {
        divisionLevel1: string; // "Departamento" en GT, "Región" en CL
        divisionLevel2: string; // "Municipio" en GT, "Comuna" en CL
        address: string;
        postalCode: string;
        phone: string;
        references: string;
    };
    placeholders: {
        divisionLevel1: string;
        divisionLevel2: string;
        address: string;
        postalCode: string;
        phone: string;
        references: string;
    };
    phonePrefix: string;
    divisions: Record<string, string[]>;
}

