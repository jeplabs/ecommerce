import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
import { getProductImageUrls, getMainProductImageUrl } from "../utils/productImages";
import Navbar from "../components/layout/Navbar/Navbar";
import CategoriasNav from "../components/layout/CategoriasNav/CategoriasNav";
import Breadcrumbs from "../components/ui/Breadcrumbs/Breadcrumbs";
import Footer from "../components/layout/Footer/Footer";
import "./Producto.css";

export default function Producto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { productos, loading } = useProduct();
    
    const [producto, setProducto] = useState(null);
    const [imagenActiva, setImagenActiva] = useState("");
    const [tabActiva, setTabActiva] = useState("descripcion"); // 'descripcion' | 'caracteristicas'

    // Cargar datos del producto
    useEffect(() => {
        if (productos && productos.length > 0) {
            const encontrado = productos.find(p => p.id === parseInt(id));
            if (encontrado) {
                setProducto(encontrado);
                setImagenActiva(getMainProductImageUrl(encontrado));
            }
        }
    }, [id, productos]);

    if (loading) return <div className="loading-container">Cargando producto...</div>;
    if (!producto) return (
        <div className="error-container">
            <h2>Producto no encontrado</h2>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
    );

    // 1. Construir Breadcrumbs desde las categorías
    const breadcrumbs = [
        { label: "Inicio", path: "/" },
        { label: "Catálogo", path: "/catalogo" },
        ...producto.categorias.map(cat => ({
            label: cat.nombre,
            path: `/categoria/${cat.id}` // Ajusta la ruta según tu router
        }))
    ];

    // 2. Formatear precio
    const precioFormateado = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: producto.moneda || 'CLP'
    }).format(producto.precioVenta);

    // 3. Convertir objeto specs a array para mapear
    const specsArray = producto.specs ? Object.entries(producto.specs) : [];

    return (
        <>
            <Navbar />
            <CategoriasNav />
            <main className="product-detail-page">
                <div className="pd-container">
                    
                    <Breadcrumbs items={breadcrumbs} />
                    {/* BREADCRUMBS */}
                    {/* <div className="pd-breadcrumbs">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={index} className="bc-item">
                                {index < breadcrumbs.length - 1 ? (
                                    <Link to={crumb.path} className="bc-link">{crumb.label}</Link>
                                ) : (
                                    <span className="bc-current">{crumb.label}</span>
                                )}
                                {index < breadcrumbs.length - 1 && (
                                    <span className="bc-separator"> /</span>
                                )}
                            </div>
                        ))}
                    </div> */}

                    {/* SECCIÓN PRINCIPAL: GRID IMAGEN + INFO */}
                    <div className="pd-main-grid">
                        
                        {/* COLUMNA IZQUIERDA: GALERÍA */}
                        <div className="pd-gallery">
                            <div className="main-image-wrapper">
                                <img src={imagenActiva} alt={producto.nombre} className="main-img" />
                                {producto.stock === 0 && (
                                    <div className="stock-badge out">Agotado</div>
                                )}
                            </div>
                            
                            {getProductImageUrls(producto).length > 1 && (
                                <div className="thumbnail-list">
                                    {getProductImageUrls(producto).map((img, idx) => (
                                        <button 
                                            key={idx}
                                            className={`thumb-btn ${imagenActiva === img ? 'active' : ''}`}
                                            onClick={() => setImagenActiva(img)}
                                        >
                                            <img src={img} alt={`Vista ${idx + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* COLUMNA DERECHA: DATOS CLAVE */}
                        <div className="pd-info">
                            <h1 className="pd-title">{producto.nombre}</h1>
                            
                            <div className="pd-meta">
                                <span className="pd-sku">SKU: {producto.sku}</span>
                                <span className={`pd-stock ${producto.stock > 0 ? 'in' : 'out'}`}>
                                    {producto.stock > 0 ? '✓ Disponible' : '✕ Sin Stock'}
                                </span>
                            </div>

                            <div className="pd-price">{precioFormateado}</div>

                            <div className="pd-short-desc">
                                <p>{producto.descripcion.substring(0, 150)}...</p>
                            </div>

                            <div className="pd-actions">
                                <button 
                                    className="btn-submit"
                                    disabled={producto.stock === 0}
                                    onClick={() => alert("Añadido al carrito")}
                                >
                                    {producto.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
                                </button>
                                <button className="btn-secondary">
                                    <span className="material-symbols-outlined">favorite_border</span>
                                </button>
                            </div>

                            <div className="pd-trust">
                                <div className="trust-item">
                                    <span className="material-symbols-outlined">local_shipping</span>
                                    <span>Envío Seguro</span>
                                </div>
                                <div className="trust-item">
                                    <span className="material-symbols-outlined">security</span>
                                    <span>Compra Protegida</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR: PESTAÑAS (DESCRIPCIÓN & SPECS) */}
                    <div className="pd-tabs-section">
                        <div className="pd-tabs-header">
                            <button 
                                className={`tab-btn ${tabActiva === 'descripcion' ? 'active' : ''}`}
                                onClick={() => setTabActiva('descripcion')}
                            >
                                Descripción Detallada
                            </button>
                            <button 
                                className={`tab-btn ${tabActiva === 'caracteristicas' ? 'active' : ''}`}
                                onClick={() => setTabActiva('caracteristicas')}
                            >
                                Características Técnicas
                            </button>
                        </div>

                        <div className="pd-tabs-content">
                            {tabActiva === 'descripcion' && (
                                <div className="tab-content fade-in">
                                    <h3>Detalles del producto</h3>
                                    <div className="full-description" dangerouslySetInnerHTML={{ __html: producto.descripcion.replace(/\n/g, '<br/>') }} />
                                </div>
                            )}

                            {tabActiva === 'caracteristicas' && (
                                <div className="tab-content fade-in">
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

                </div>
            </main>
            <Footer />
        </>
    );
}