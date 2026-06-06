import { useState } from 'react';
import type { ProductApi } from '@/entities/product';
import './ProductTabs.css';

type ProductTabsProps = {
    producto: ProductApi;
};

export default function ProductTabs({ producto }: ProductTabsProps) {
    const [tabActiva, setTabActiva] = useState<'descripcion' | 'caracteristicas'>('descripcion');
    const specsArray = producto.specs ? Object.entries(producto.specs) : [];

    return (
        <div className="pd-tabs-section">
            <div className="pd-tabs-header" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tabActiva === 'descripcion'}
                    className={`tab-btn ${tabActiva === 'descripcion' ? 'active' : ''}`}
                    onClick={() => setTabActiva('descripcion')}
                >
                    Descripción Detallada
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tabActiva === 'caracteristicas'}
                    className={`tab-btn ${tabActiva === 'caracteristicas' ? 'active' : ''}`}
                    onClick={() => setTabActiva('caracteristicas')}
                >
                    Características Técnicas
                </button>
            </div>

            <div className="pd-tabs-content">
                {tabActiva === 'descripcion' && (
                    <div className="tab-content fade-in" role="tabpanel">
                        <h3>Detalles del producto</h3>
                        <div
                            className="full-description"
                            dangerouslySetInnerHTML={{
                                __html: (producto.descripcion ?? '').replace(/\n/g, '<br/>'),
                            }}
                        />
                    </div>
                )}

                {tabActiva === 'caracteristicas' && (
                    <div className="tab-content fade-in" role="tabpanel">
                        <h3>Especificaciones Técnicas</h3>
                        {specsArray.length > 0 ? (
                            <table className="specs-table">
                                <tbody>
                                    {specsArray.map(([key, value]) => (
                                        <tr key={key}>
                                            <td className="spec-key">{key}</td>
                                            <td className="spec-value">{String(value)}</td>
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
