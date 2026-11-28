import { useState, useMemo, useCallback, useEffect } from 'react';
import type { CategoryApi } from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import styles from './AdminCategoriesTable.module.css';

/** Profundidad máxima permitida por el backend: 5 niveles (depth 0 = Nivel 1 .. depth 4 = Nivel 5). */
const MAX_TREE_DEPTH = 4;

export interface AdminCategoriesTableProps {
    categories: CategoryApi[];
    searchFilter?: string;
    autoExpandParentId?: number | null;
    onAddSubcategory: (parent: CategoryApi) => void;
    onEdit: (category: CategoryApi) => void;
    onDelete: (category: CategoryApi) => void;
}

type FlattenedCategory = {
    category: CategoryApi;
    depth: number;
    hasChildren: boolean;
    isExpanded: boolean;
};

export function AdminCategoriesTable({
    categories,
    searchFilter = '',
    autoExpandParentId = null,
    onAddSubcategory,
    onEdit,
    onDelete,
}: AdminCategoriesTableProps) {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
        // Expandir raíces por defecto
        const initial = new Set<number>();
        categories.forEach((cat) => initial.add(cat.id));
        return initial;
    });

    useEffect(() => {
        if (autoExpandParentId != null) {
            setExpandedIds((prev) => {
                if (prev.has(autoExpandParentId)) return prev;
                const next = new Set(prev);
                next.add(autoExpandParentId);
                return next;
            });
        }
    }, [autoExpandParentId]);

    const toggleExpand = useCallback((id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Aplanar el árbol considerando nodos expandidos y filtro de búsqueda
    const flattenedList = useMemo(() => {
        const filterLower = searchFilter.trim().toLowerCase();
        const result: FlattenedCategory[] = [];

        function traverse(nodes: CategoryApi[], depth: number) {
            for (const node of nodes) {
                const hasChildren = Boolean(node.subcategorias && node.subcategorias.length > 0);
                const isExpanded = expandedIds.has(node.id) || Boolean(filterLower);

                // Si hay filtro de búsqueda, verificar si este nodo o algún descendiente coincide
                if (filterLower) {
                    const matchesCurrent =
                        node.nombre.toLowerCase().includes(filterLower) ||
                        node.slug.toLowerCase().includes(filterLower);
                    const matchesChild = hasDescendantMatch(node, filterLower);

                    if (matchesCurrent || matchesChild) {
                        result.push({
                            category: node,
                            depth,
                            hasChildren,
                            isExpanded: true,
                        });
                        if (hasChildren) {
                            traverse(node.subcategorias, depth + 1);
                        }
                    }
                } else {
                    result.push({
                        category: node,
                        depth,
                        hasChildren,
                        isExpanded: expandedIds.has(node.id),
                    });
                    if (hasChildren && isExpanded) {
                        traverse(node.subcategorias, depth + 1);
                    }
                }
            }
        }

        traverse(categories, 0);
        return result;
    }, [categories, expandedIds, searchFilter]);

    if (categories.length === 0) {
        return (
            <div className={styles.root}>
                <div className={styles.emptyState}>
                    <p>No hay categorías registradas en el catálogo.</p>
                </div>
            </div>
        );
    }

    if (flattenedList.length === 0) {
        return (
            <div className={styles.root}>
                <div className={styles.emptyState}>
                    <p>No se encontraron categorías que coincidan con &ldquo;{searchFilter}&rdquo;.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.scroll}>
                <table className={styles.grid}>
                    <thead>
                        <tr>
                            <th scope="col">Categoría / Jerarquía</th>
                            <th scope="col">Slug</th>
                            <th scope="col">Nivel</th>
                            <th scope="col">Subcategorías</th>
                            <th scope="col" className={styles.thActions}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flattenedList.map(({ category, depth, hasChildren, isExpanded }) => {
                            const subCount = category.subcategorias?.length ?? 0;
                            const isMaxDepth = depth >= MAX_TREE_DEPTH;
                            return (
                                <tr key={category.id} className={styles.row}>
                                    <td>
                                        <div
                                            className={styles.categoryCell}
                                            style={{ paddingLeft: `${depth * 1.75}rem` }}
                                        >
                                            {hasChildren ? (
                                                <button
                                                    type="button"
                                                    className={styles.toggleBtn}
                                                    onClick={() => toggleExpand(category.id)}
                                                    aria-label={isExpanded ? `Contraer ${category.nombre}` : `Expandir ${category.nombre}`}
                                                    aria-expanded={isExpanded}
                                                >
                                                    {isExpanded ? '▼' : '▶'}
                                                </button>
                                            ) : (
                                                <span className={styles.spacer} />
                                            )}
                                            <span className={styles.icon}>
                                                {depth === 0 ? '📁' : depth === 1 ? '📂' : '📄'}
                                            </span>
                                            <span className={styles.categoryName}>{category.nombre}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.slugCell}>{category.slug}</span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.badge} ${
                                                depth === 0
                                                    ? styles.badgeRoot
                                                    : depth === 1
                                                      ? styles.badgeSub
                                                      : styles.badgeSubSub
                                            }`}
                                        >
                                            {depth === 0 ? 'Raíz' : depth === 1 ? 'Nivel 1' : `Nivel ${depth}`}
                                        </span>
                                    </td>
                                    <td>
                                        {subCount > 0 ? (
                                            <span>{subCount} {subCount === 1 ? 'hija' : 'hijas'}</span>
                                        ) : (
                                            <span style={{ color: 'var(--muted)' }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actionsCell}>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className={styles.actionBtn}
                                                disabled={isMaxDepth}
                                                onClick={() => {
                                                    setExpandedIds((prev) => new Set(prev).add(category.id));
                                                    onAddSubcategory(category);
                                                }}
                                                title={
                                                    isMaxDepth
                                                        ? 'Límite máximo de 5 niveles de profundidad alcanzado'
                                                        : `Añadir subcategoría a ${category.nombre}`
                                                }
                                            >
                                                + Hija
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className={styles.actionBtn}
                                                onClick={() => onEdit(category)}
                                                title="Editar categoría"
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className={styles.actionBtn}
                                                onClick={() => onDelete(category)}
                                                title="Eliminar categoría"
                                                style={{ color: '#ef4444' }}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function hasDescendantMatch(category: CategoryApi, query: string): boolean {
    if (!category.subcategorias || category.subcategorias.length === 0) return false;
    for (const sub of category.subcategorias) {
        if (
            sub.nombre.toLowerCase().includes(query) ||
            sub.slug.toLowerCase().includes(query) ||
            hasDescendantMatch(sub, query)
        ) {
            return true;
        }
    }
    return false;
}
