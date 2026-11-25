import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/utils/format';
import type { BannerApi } from '../../types';
import styles from './AdminBannersTable.module.css';

export interface AdminBannersTableProps {
    banners: BannerApi[];
    loading?: boolean;
    reordering?: boolean;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onToggleEstado: (id: number) => void;
    onEdit: (banner: BannerApi) => void;
    onDelete: (banner: BannerApi) => void;
}

type BannerVigencia = 'ACTIVO' | 'INACTIVO' | 'PROGRAMADO' | 'EXPIRADO';

function getVigenciaStatus(banner: BannerApi): BannerVigencia {
    if (!banner.activo) return 'INACTIVO';
    const now = new Date();
    if (banner.fechaInicio && new Date(banner.fechaInicio) > now) {
        return 'PROGRAMADO';
    }
    if (banner.fechaFin && new Date(banner.fechaFin) < now) {
        return 'EXPIRADO';
    }
    return 'ACTIVO';
}

export function AdminBannersTable({
    banners,
    loading = false,
    reordering = false,
    onMoveUp,
    onMoveDown,
    onToggleEstado,
    onEdit,
    onDelete,
}: AdminBannersTableProps) {
    if (loading && banners.length === 0) {
        return (
            <div className={styles.root}>
                <div className={styles.emptyState}>
                    <p>Cargando banners…</p>
                </div>
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div className={styles.root}>
                <div className={styles.emptyState}>
                    <p>No hay banners registrados para esta sección.</p>
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
                            <th scope="col" style={{ width: '100px' }}>Orden</th>
                            <th scope="col" style={{ width: '140px' }}>Miniatura</th>
                            <th scope="col">Campaña y Enlace</th>
                            <th scope="col" style={{ width: '180px' }}>Estado y Vigencia</th>
                            <th scope="col" style={{ width: '220px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map((banner, index) => {
                            const vigencia = getVigenciaStatus(banner);
                            const hasDates = Boolean(banner.fechaInicio || banner.fechaFin);

                            return (
                                <tr key={banner.id} className={styles.row}>
                                    {/* Orden con botones subir / bajar */}
                                    <td>
                                        <div className={styles.orderCell}>
                                            <span className={styles.orderNum}>{banner.orden}</span>
                                            <button
                                                type="button"
                                                className={styles.arrowBtn}
                                                disabled={index === 0 || reordering}
                                                onClick={() => onMoveUp(index)}
                                                aria-label={`Subir banner ${banner.titulo}`}
                                                title="Subir posición"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.arrowBtn}
                                                disabled={index === banners.length - 1 || reordering}
                                                onClick={() => onMoveDown(index)}
                                                aria-label={`Bajar banner ${banner.titulo}`}
                                                title="Bajar posición"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </td>

                                    {/* Miniatura decorativa con alt="" para evitar redundancia */}
                                    <td>
                                        <div className={styles.thumbWrap}>
                                            <img
                                                src={banner.desktopUrl}
                                                alt=""
                                                aria-hidden="true"
                                                className={styles.thumbImg}
                                            />
                                            {banner.mobileUrl && (
                                                <span className={styles.badgeMobile} title="Tiene versión Mobile">
                                                    📱 M
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Título y Enlace */}
                                    <td>
                                        <div className={styles.infoWrap}>
                                            <span className={styles.title}>{banner.titulo}</span>
                                            {banner.linkUrl ? (
                                                <span className={styles.linkInfo} title={banner.linkUrl}>
                                                    🔗 {banner.linkUrl}
                                                </span>
                                            ) : (
                                                <span className={styles.linkInfo} style={{ fontStyle: 'italic' }}>
                                                    Sin enlace
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Estado y Vigencia */}
                                    <td>
                                        <div className={styles.statusWrap}>
                                            {vigencia === 'ACTIVO' && (
                                                <span className={`${styles.pill} ${styles.pillActive}`}>
                                                    ● Activo
                                                </span>
                                            )}
                                            {vigencia === 'INACTIVO' && (
                                                <span className={`${styles.pill} ${styles.pillInactive}`}>
                                                    ○ Pausado
                                                </span>
                                            )}
                                            {vigencia === 'PROGRAMADO' && (
                                                <span className={`${styles.pill} ${styles.pillScheduled}`}>
                                                    🕒 Programado
                                                </span>
                                            )}
                                            {vigencia === 'EXPIRADO' && (
                                                <span className={`${styles.pill} ${styles.pillExpired}`}>
                                                    ✕ Expirado
                                                </span>
                                            )}

                                            {hasDates && (
                                                <span className={styles.datesHint}>
                                                    {banner.fechaInicio ? formatDateTime(banner.fechaInicio) : 'Inicio'}
                                                    {' → '}
                                                    {banner.fechaFin ? formatDateTime(banner.fechaFin) : 'Siempre'}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Acciones */}
                                    <td>
                                        <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className={styles.actionBtn}
                                                onClick={() => onToggleEstado(banner.id)}
                                                title={banner.activo ? 'Pausar campaña' : 'Reactivar campaña'}
                                                aria-label={`${banner.activo ? 'Pausar' : 'Activar'} banner ${banner.titulo}`}
                                            >
                                                {banner.activo ? 'Pausar' : 'Activar'}
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className={styles.actionBtn}
                                                onClick={() => onEdit(banner)}
                                                title="Editar banner"
                                                aria-label={`Editar banner ${banner.titulo}`}
                                            >
                                                Editar
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className={styles.actionBtn}
                                                onClick={() => onDelete(banner)}
                                                title="Eliminar banner"
                                                aria-label={`Eliminar banner ${banner.titulo}`}
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
