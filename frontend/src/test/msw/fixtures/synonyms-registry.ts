import { normalizeSynonymTerm } from '@/features/catalog/types/synonyms';
import type {
    ProductApi,
    SaveSearchSynonymRequest,
    SearchSynonymApi,
} from '@/features/catalog';

const INITIAL_SYNONYMS: SearchSynonymApi[] = [
    {
        id: 1,
        nombreGrupo: 'laptops',
        terminos: ['laptop', 'notebook', 'portatil', 'ultrabook'],
        activo: true,
        createdAt: '2026-11-27T10:00:00',
        updatedAt: '2026-11-27T10:00:00',
    },
    {
        id: 2,
        nombreGrupo: 'audio',
        terminos: ['audifonos', 'auriculares', 'headset', 'headphones'],
        activo: true,
        createdAt: '2026-11-27T10:05:00',
        updatedAt: '2026-11-27T10:05:00',
    },
    {
        id: 3,
        nombreGrupo: 'monitores',
        terminos: ['monitor', 'pantalla', 'display'],
        activo: false,
        createdAt: '2026-11-27T10:10:00',
        updatedAt: '2026-11-27T10:10:00',
    },
];

let dynamicSynonyms: SearchSynonymApi[] = INITIAL_SYNONYMS.map((s) => ({
    ...s,
    terminos: [...s.terminos],
}));
let nextSynonymId = 10;

export function resetDynamicSynonyms(): void {
    dynamicSynonyms = INITIAL_SYNONYMS.map((s) => ({
        ...s,
        terminos: [...s.terminos],
    }));
    nextSynonymId = 10;
}

export function getDynamicSynonyms(): SearchSynonymApi[] {
    return [...dynamicSynonyms]
        .sort((a, b) => a.nombreGrupo.localeCompare(b.nombreGrupo))
        .map((s) => ({ ...s, terminos: [...s.terminos] }));
}

export function findDynamicSynonym(id: number): SearchSynonymApi | undefined {
    const found = dynamicSynonyms.find((s) => s.id === id);
    return found ? { ...found, terminos: [...found.terminos] } : undefined;
}

function normalizeAndValidateTerms(rawTerms: string[]): string[] {
    const unique = new Set<string>();
    for (const raw of rawTerms) {
        const cleaned = normalizeSynonymTerm(raw);
        if (cleaned.length >= 2) {
            unique.add(cleaned);
        }
    }
    if (unique.size < 2) {
        throw new Error(
            'Un grupo de sinónimos debe contener al menos 2 términos alfanuméricos distintos de mínimo 2 caracteres'
        );
    }
    return Array.from(unique);
}

export function createDynamicSynonym(payload: SaveSearchSynonymRequest): SearchSynonymApi {
    const nombreGrupo = payload.nombreGrupo.trim();
    if (
        dynamicSynonyms.some(
            (s) => s.nombreGrupo.toLowerCase() === nombreGrupo.toLowerCase()
        )
    ) {
        throw new Error(`Ya existe un grupo de sinónimos con el nombre: ${nombreGrupo}`);
    }

    const terminos = normalizeAndValidateTerms(payload.terminos);
    const now = '2026-11-28T03:00:00';
    const created: SearchSynonymApi = {
        id: nextSynonymId++,
        nombreGrupo,
        terminos,
        activo: payload.activo ?? true,
        createdAt: now,
        updatedAt: now,
    };
    dynamicSynonyms.push(created);
    return { ...created, terminos: [...created.terminos] };
}

export function updateDynamicSynonym(
    id: number,
    payload: SaveSearchSynonymRequest
): SearchSynonymApi | undefined {
    const idx = dynamicSynonyms.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;

    const nombreGrupo = payload.nombreGrupo.trim();
    if (
        dynamicSynonyms.some(
            (s) => s.id !== id && s.nombreGrupo.toLowerCase() === nombreGrupo.toLowerCase()
        )
    ) {
        throw new Error(`Ya existe otro grupo de sinónimos con el nombre: ${nombreGrupo}`);
    }

    const terminos = normalizeAndValidateTerms(payload.terminos);
    const current = dynamicSynonyms[idx]!;
    const updated: SearchSynonymApi = {
        ...current,
        nombreGrupo,
        terminos,
        activo: payload.activo ?? current.activo,
        updatedAt: '2026-11-28T03:05:00',
    };
    dynamicSynonyms[idx] = updated;
    return { ...updated, terminos: [...updated.terminos] };
}

export function toggleDynamicSynonymStatus(id: number): SearchSynonymApi | undefined {
    const idx = dynamicSynonyms.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    const current = dynamicSynonyms[idx]!;
    const updated: SearchSynonymApi = {
        ...current,
        activo: !current.activo,
        updatedAt: '2026-11-28T03:10:00',
    };
    dynamicSynonyms[idx] = updated;
    return { ...updated, terminos: [...updated.terminos] };
}

export function deleteDynamicSynonym(id: number): boolean {
    const initialLen = dynamicSynonyms.length;
    dynamicSynonyms = dynamicSynonyms.filter((s) => s.id !== id);
    return dynamicSynonyms.length < initialLen;
}

function normalizeSearchText(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Evalúa búsqueda multicampo (SKU, nombre, descripción, categorías y valores de specs)
 * insensible a tildes, con tokenización AND y expansión de sinónimos activos en MSW.
 */
export function matchesProductSearch(
    product: Pick<ProductApi, 'sku' | 'nombre' | 'descripcion' | 'specs' | 'categorias'>,
    rawQuery: string | null | undefined
): boolean {
    const normalizedQuery = normalizeSearchText(rawQuery);
    if (!normalizedQuery) return true;

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;

    const specsValues =
        product.specs && typeof product.specs === 'object'
            ? Object.values(product.specs)
                  .map((v) => String(v ?? ''))
                  .join(' ')
            : '';
    const categoriesText = (product.categorias ?? []).map((c) => c.nombre).join(' ');

    const fullIndex = normalizeSearchText(
        `${product.sku} ${product.nombre} ${product.descripcion ?? ''} ${categoriesText} ${specsValues}`
    );

    const activeGroups = dynamicSynonyms.filter((g) => g.activo);

    return tokens.every((token) => {
        const cleanToken = normalizeSynonymTerm(token);
        if (!cleanToken) return true;
        if (fullIndex.includes(cleanToken)) return true;

        for (const group of activeGroups) {
            if (group.terminos.includes(cleanToken)) {
                if (group.terminos.some((syn) => fullIndex.includes(syn))) {
                    return true;
                }
            }
        }
        return false;
    });
}
