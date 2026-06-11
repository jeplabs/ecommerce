import { useState } from 'react';
import clsx from 'clsx';
import type { ProductApi } from '@/entities/product';
import styles from './ProductTabs.module.css';

type ProductTabsProps = {
    producto: ProductApi;
};

export default function ProductTabs({ producto }: ProductTabsProps) {
    const [tabActiva, setTabActiva] = useState<'descripcion' | 'caracteristicas'>('descripcion');
    const specsArray = producto.specs ? Object.entries(producto.specs) : [];

    return (
        <div className={styles.section}>
            <div className={styles.header} role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tabActiva === 'descripcion'}
                    className={clsx(styles.tabBtn, tabActiva === 'descripcion' && styles.tabBtnActive)}
                    onClick={() => setTabActiva('descripcion')}
                >
                    Descripción Detallada
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tabActiva === 'caracteristicas'}
                    className={clsx(
                        styles.tabBtn,
                        tabActiva === 'caracteristicas' && styles.tabBtnActive
                    )}
                    onClick={() => setTabActiva('caracteristicas')}
                >
                    Características Técnicas
                </button>
            </div>

            <div className={styles.content}>
                {tabActiva === 'descripcion' && (
                    <div className={clsx(styles.fadeIn)} role="tabpanel">
                        <h3>Detalles del producto</h3>
                        <div
                            className={styles.fullDescription}
                            dangerouslySetInnerHTML={{
                                __html: (producto.descripcion ?? '').replace(/\n/g, '<br/>'),
                            }}
                        />
                    </div>
                )}

                {tabActiva === 'caracteristicas' && (
                    <div className={clsx(styles.fadeIn)} role="tabpanel">
                        <h3>Especificaciones Técnicas</h3>
                        {specsArray.length > 0 ? (
                            <table className={styles.specsTable}>
                                <tbody>
                                    {specsArray.map(([key, value]) => (
                                        <tr key={key}>
                                            <td className={styles.specKey}>{key}</td>
                                            <td className={styles.specValue}>{String(value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No hay especificaciones técnicas disponibles.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
