import { useMemo } from 'react';
import type { CategoryTreeNode } from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { AdminProductStatusFilter } from '../../types';
import styles from './AdminProductFilters.module.css';

type CategoryOption = {
    id: number;
    label: string;
};

const STATUS_OPTIONS: Array<{ value: AdminProductStatusFilter; label: string }> = [
    { value: '', label: 'Todos los estados' },
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'SIN_STOCK', label: 'Sin stock' },
    { value: 'OCULTO', label: 'Oculto' },
    { value: 'DESCONTINUADO', label: 'Descontinuado' },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

function flattenCategoryOptions(
    nodes: CategoryTreeNode[],
    depth = 0,
    acc: CategoryOption[] = []
): CategoryOption[] {
    for (const node of nodes) {
        const prefix = depth > 0 ? `${'— '.repeat(depth)}` : '';
        acc.push({ id: node.id, label: `${prefix}${node.nombre}` });
        if (node.subcategorias && node.subcategorias.length > 0) {
            flattenCategoryOptions(node.subcategorias, depth + 1, acc);
        }
    }
    return acc;
}

export type AdminProductFiltersProps = {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    categoriaId: number | '';
    onCategoryChange: (value: number | '') => void;
    estadoFiltro: AdminProductStatusFilter;
    onStatusChange: (value: AdminProductStatusFilter) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    categorias: CategoryTreeNode[];
    totalElements: number;
    currentCount: number;
    page: number;
    loading?: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
};

/**
 * Barra de búsqueda y filtros por categoría, estado y tamaño de página para productos en admin.
 */
export default function AdminProductFilters({
    searchQuery,
    onSearchChange,
    categoriaId,
    onCategoryChange,
    estadoFiltro,
    onStatusChange,
    pageSize,
    onPageSizeChange,
    categorias,
    totalElements,
    currentCount,
    page,
    loading = false,
    hasActiveFilters,
    onClearFilters,
}: AdminProductFiltersProps) {
    const categoryOptions = useMemo(() => flattenCategoryOptions(categorias), [categorias]);

    const rangeStart = totalElements === 0 || currentCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = totalElements === 0 || currentCount === 0 ? 0 : rangeStart + currentCount - 1;

    return (
        <section className={styles.panel} aria-label="Filtros de productos">
            <div className={styles.controlsGrid}>
                <div className={styles.fieldSearch}>
                    <label className={styles.label} htmlFor="admin-products-search">
                        Buscar producto
                    </label>
                    <div className={styles.searchWrap}>
                        <Input
                            id="admin-products-search"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar por nombre o SKU…"
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className={styles.clearSearchBtn}
                                onClick={() => onSearchChange('')}
                                aria-label="Limpiar búsqueda"
                                title="Limpiar búsqueda"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="admin-products-category">
                        Categoría
                    </label>
                    <Select
                        id="admin-products-category"
                        value={categoriaId === '' ? '' : String(categoriaId)}
                        onChange={(e) =>
                            onCategoryChange(e.target.value === '' ? '' : Number(e.target.value))
                        }
                    >
                        <option value="">Todas las categorías</option>
                        {categoryOptions.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="admin-products-status">
                        Estado
                    </label>
                    <Select
                        id="admin-products-status"
                        value={estadoFiltro}
                        onChange={(e) =>
                            onStatusChange(e.target.value as AdminProductStatusFilter)
                        }
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value || 'all'} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className={styles.fieldCompact}>
                    <label className={styles.label} htmlFor="admin-products-page-size">
                        Mostrar
                    </label>
                    <Select
                        id="admin-products-page-size"
                        value={String(pageSize)}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size} por página
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className={styles.summaryRow}>
                <p className={styles.summaryText} aria-live="polite">
                    {loading ? (
                        'Actualizando listado…'
                    ) : totalElements > 0 ? (
                        <>
                            Mostrando <strong> {rangeStart} </strong>–<strong> {rangeEnd} </strong> de {' '} 
                            <strong>{totalElements}</strong> producto{totalElements === 1 ? '' : 's'}
                        </>
                    ) : (
                        '0 productos encontrados'
                    )}
                </p>

                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClearFilters}
                    >
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </section>
    );
}
