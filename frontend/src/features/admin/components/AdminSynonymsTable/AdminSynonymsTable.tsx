import type { SearchSynonymApi } from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import styles from './AdminSynonymsTable.module.css';

export interface AdminSynonymsTableProps {
    groups: SearchSynonymApi[];
    searchFilter?: string;
    onToggleStatus: (group: SearchSynonymApi) => void;
    onEdit: (group: SearchSynonymApi) => void;
    onDelete: (group: SearchSynonymApi) => void;
}

export function AdminSynonymsTable({
    groups,
    searchFilter = '',
    onToggleStatus,
    onEdit,
    onDelete,
}: AdminSynonymsTableProps) {
    if (groups.length === 0) {
        return (
            <div className={styles.root}>
                <div className={styles.emptyState}>
                    {searchFilter.trim() ? (
                        <p>
                            No se encontraron grupos de sinónimos que coincidan con &ldquo;
                            {searchFilter.trim()}&rdquo;.
                        </p>
                    ) : (
                        <p>No hay grupos de sinónimos registrados en el buscador.</p>
                    )}
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
                            <th scope="col" style={{ width: '180px' }}>
                                Grupo
                            </th>
                            <th scope="col">Términos equivalentes (normalizados)</th>
                            <th scope="col" style={{ width: '140px' }}>
                                Estado
                            </th>
                            <th scope="col" style={{ width: '240px', textAlign: 'right' }}>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group) => (
                            <tr key={group.id} className={styles.row}>
                                <td>
                                    <span className={styles.groupName}>{group.nombreGrupo}</span>
                                </td>
                                <td>
                                    <div className={styles.termsWrap}>
                                        {group.terminos.map((term) => (
                                            <span key={term} className={styles.termChip}>
                                                {term}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    {group.activo ? (
                                        <span className={`${styles.pill} ${styles.pillActive}`}>
                                            ● Activo
                                        </span>
                                    ) : (
                                        <span className={`${styles.pill} ${styles.pillInactive}`}>
                                            ○ Pausado
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.actionsCell}>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className={styles.actionBtn}
                                            onClick={() => onToggleStatus(group)}
                                            title={
                                                group.activo
                                                    ? 'Pausar grupo de sinónimos'
                                                    : 'Activar grupo de sinónimos'
                                            }
                                            aria-label={`${group.activo ? 'Pausar' : 'Activar'} grupo ${group.nombreGrupo}`}
                                        >
                                            {group.activo ? 'Pausar' : 'Activar'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className={styles.actionBtn}
                                            onClick={() => onEdit(group)}
                                            title="Editar grupo de sinónimos"
                                            aria-label={`Editar grupo ${group.nombreGrupo}`}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className={styles.actionBtn}
                                            onClick={() => onDelete(group)}
                                            title="Eliminar grupo de sinónimos"
                                            aria-label={`Eliminar grupo ${group.nombreGrupo}`}
                                            style={{ color: '#ef4444' }}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
