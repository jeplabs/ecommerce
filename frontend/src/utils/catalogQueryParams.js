/** Query params compartidos entre /catalogo y /categoria/... para filtros y orden. */

const SORT_VALUES = new Set(["price-asc", "price-desc", "name-asc", "name-desc", "newest"]);

const PARAM_KEYS_TO_RESET = ["marca", "ram", "almacenamiento", "precioMin", "precioMax", "sort"];

function safeOpciones(opciones) {
    return {
        precioMin: opciones?.precioMin ?? 0,
        precioMax: opciones?.precioMax ?? 10000,
    };
}

/** Valor explícito en la URL (null si no hay `sort` o es inválido). */
export function getPersistedSortParam(searchParams) {
    if (!searchParams) return null;
    const s = searchParams.get("sort");
    return SORT_VALUES.has(s) ? s : null;
}

/** Orden aplicado a la lista: sin param en URL → mismo criterio que antes (precio ascendente). */
export function getEffectiveSortOrder(searchParams) {
    return getPersistedSortParam(searchParams) ?? "price-asc";
}

export function parseFiltrosFromParams(searchParams, opciones) {
    if (!searchParams) return null;
    const { precioMin: defMin, precioMax: defMax } = safeOpciones(opciones);

    const marcas = searchParams.getAll("marca");
    const rams = searchParams.getAll("ram");
    const almacenamientos = searchParams.getAll("almacenamiento");
    const pmRaw = searchParams.get("precioMin");
    const pmaxRaw = searchParams.get("precioMax");

    const hasFacets = marcas.length > 0 || rams.length > 0 || almacenamientos.length > 0;
    let precioMin = defMin;
    let precioMax = defMax;
    let precioFromUrl = false;
    if (pmRaw !== null && pmRaw !== "") {
        precioMin = Number(pmRaw);
        precioFromUrl = true;
    }
    if (pmaxRaw !== null && pmaxRaw !== "") {
        precioMax = Number(pmaxRaw);
        precioFromUrl = true;
    }

    if (!hasFacets && !precioFromUrl) return null;

    if (!hasFacets && precioFromUrl && precioMin === defMin && precioMax === defMax) {
        return null;
    }

    return {
        marca: marcas,
        ram: rams,
        almacenamiento: almacenamientos,
        precioMin,
        precioMax,
    };
}

export function isFiltrosDefault(filtros, opciones) {
    if (!filtros) return true;
    const { precioMin, precioMax } = safeOpciones(opciones);
    return (
        filtros.marca.length === 0 &&
        filtros.ram.length === 0 &&
        filtros.almacenamiento.length === 0 &&
        filtros.precioMin === precioMin &&
        filtros.precioMax === precioMax
    );
}

/**
 * @param {URLSearchParams} prevSearchParams - conserva otros params (ej. search)
 * @param {{ filtros: object | null, sort: string | null | undefined, opciones: object }} config
 */
export function buildCatalogSearchParams(prevSearchParams, { filtros, sort, opciones }) {
    const next = new URLSearchParams(prevSearchParams);
    PARAM_KEYS_TO_RESET.forEach((k) => next.delete(k));

    if (sort && SORT_VALUES.has(sort)) {
        next.set("sort", sort);
    }

    const op = safeOpciones(opciones);
    if (!filtros || isFiltrosDefault(filtros, opciones)) {
        return next;
    }

    filtros.marca.forEach((m) => next.append("marca", m));
    filtros.ram.forEach((r) => next.append("ram", r));
    filtros.almacenamiento.forEach((a) => next.append("almacenamiento", a));
    if (filtros.precioMin !== op.precioMin) {
        next.set("precioMin", String(filtros.precioMin));
    }
    if (filtros.precioMax !== op.precioMax) {
        next.set("precioMax", String(filtros.precioMax));
    }
    return next;
}
