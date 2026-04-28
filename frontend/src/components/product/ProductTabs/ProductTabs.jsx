import { useState } from "react";
import "./ProductTabs.css";

export default function ProductTabs({ producto }) {
    const [tabActiva, setTabActiva] = useState("descripcion");
    const specsArray = producto.specs ? Object.entries(producto.specs) : [];

    return (
        <div className="pd-tabs-section">
            <div className="pd-tabs-header" role="tablist">
                <button 
                    role="tab"
                    aria-selected={tabActiva === 'descripcion'}
                    className={`tab-btn ${tabActiva === 'descripcion' ? 'active' : ''}`}
                    onClick={() => setTabActiva('descripcion')}
                >
                    Descripción Detallada
                </button>
                <button 
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
                            dangerouslySetInnerHTML={{ __html: producto.descripcion.replace(/\n/g, '<br/>') }} 
                        />
                    </div>
                )}

                {tabActiva === 'caracteristicas' && (
                    <div className="tab-content fade-in" role="tabpanel">
                        <h3>Especificaciones Técnicas</h3>
                        {specsArray.length > 0 ? (
                            <div className="specs-grid">
                                {specsArray.map(([key, value]) => (
                                    <div key={key} className="spec-row">
                                        <span className="spec-key">{key}</span>
                                        <span className="spec-value">{value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No hay especificaciones técnicas disponibles.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}