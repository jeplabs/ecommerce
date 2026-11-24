import type { CategoryApi } from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import styles from './DeleteCategoryModal.module.css';

export interface DeleteCategoryModalProps {
    isOpen: boolean;
    category?: CategoryApi | null;
    onClose: () => void;
    onConfirm: (category: CategoryApi) => Promise<boolean>;
    isDeleting?: boolean;
}

export function DeleteCategoryModal({
    isOpen,
    category,
    onClose,
    onConfirm,
    isDeleting = false,
}: DeleteCategoryModalProps) {
    if (!isOpen || !category) return null;

    const hasChildren = Boolean(category.subcategorias && category.subcategorias.length > 0);
    const subCount = category.subcategorias?.length ?? 0;

    const handleConfirm = async () => {
        if (hasChildren) return;
        const success = await onConfirm(category);
        if (success) {
            onClose();
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-cat-modal-title"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 id="delete-cat-modal-title">Eliminar categoría</h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    <p>
                        ¿Estás seguro de que deseas eliminar la categoría <strong>«{category.nombre}»</strong>?
                    </p>

                    {hasChildren ? (
                        <div className={styles.warningBox}>
                            <span>⚠️</span>
                            <div>
                                <strong>Acción bloqueada:</strong> Esta categoría contiene{' '}
                                <strong>{subCount} {subCount === 1 ? 'subcategoría' : 'subcategorías'}</strong>.
                                Para evitar la pérdida de ramas jerárquicas o errores de integridad, debes eliminar o reasignar
                                primero sus categorías hijas.
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
                            Nota: Si esta categoría tiene productos vinculados, el backend rechazará la operación para proteger
                            la integridad del catálogo.
                        </p>
                    )}
                </div>

                <div className={styles.footer}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={isDeleting || hasChildren}
                        style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar definitivamente'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
