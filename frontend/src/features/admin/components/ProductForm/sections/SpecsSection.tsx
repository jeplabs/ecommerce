import { Input } from '@/components/ui/Input';
import { FieldError } from '@/components/ui/FormField';
import type { ProductFormSpec } from '../types';
import styles from '../ProductForm.module.css';

interface SpecsSectionProps {
    specs: ProductFormSpec[];
    error?: string | null;
    onAdd: () => void;
    onUpdate: (id: string, field: 'key' | 'value', value: string) => void;
    onRemove: (id: string) => void;
}

export function SpecsSection({
    specs,
    error,
    onAdd,
    onUpdate,
    onRemove,
}: SpecsSectionProps) {
    return (
        <div className={styles.specsSection}>
            <div className={styles.specsHeader}>
                <span className={styles.specsTitle}>Características / Especificaciones</span>
                <button
                    type="button"
                    className={styles.btnAddSpec}
                    onClick={onAdd}
                    title="Agregar característica"
                >
                    + Agregar
                </button>
            </div>

            <div className={styles.specsList}>
                {specs.map((spec) => (
                    <div key={spec.id} className={styles.specRow}>
                        <Input
                            type="text"
                            placeholder="Clave (ej. Color)"
                            value={spec.key}
                            onChange={(e) => onUpdate(spec.id, 'key', e.target.value)}
                            className={styles.specKey}
                        />
                        <Input
                            type="text"
                            placeholder="Valor (ej. Rojo)"
                            value={spec.value}
                            onChange={(e) => onUpdate(spec.id, 'value', e.target.value)}
                            className={styles.specValue}
                        />
                        <button
                            type="button"
                            className={styles.btnRemoveSpec}
                            onClick={() => onRemove(spec.id)}
                            title="Eliminar fila"
                            aria-label="Eliminar característica"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            {error && <FieldError>{error}</FieldError>}
            <p className={styles.fieldHelp}>Agrega pares clave-valor para detallar el producto.</p>
        </div>
    );
}
