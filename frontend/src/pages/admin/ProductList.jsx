import Navbar from "../../components/layout/Navbar/Navbar";
import { useNavigate } from 'react-router-dom';
import { useProduct } from "../../context/ProductContext";
import { useCategorias } from "../../context/CategoriasContext";
import { useToast } from "../../context/ToastContext";
import { CategoryForm } from "../../components/admin/CategoryForm";

export default function ProductList() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    // const { arbolCategorias, createCategory } = useCategorias();
    const { 
        productos, 
        productosOcultos, 
        productosDescontinuados, 
        loading, 
        reloadProducts, 
        deleteProduct, 
    } = useProduct();

    const handleDelete = async (id, nombre) => {
        const confirmed = window.confirm(`¿Estás seguro de que quieres desactivar el producto ${nombre}?`);
        if (!confirmed) return;

        try {
            const result = await deleteProduct(id);
            
            if (result.success) {
                showSuccess('Producto desactivado exitosamente');
                await reloadProducts();
            } else {
                showError(`Error al desactivar el producto: ${result.message}`);
            }
        } catch (error) {
            console.error('ProductList error en handleDelete:', error);
            showError('Error al desactivar el producto');
        }
    };
    
    return (
        <>
            <Navbar />
            <main className="products-container">
                <h1>Admin: Productos y Categorías</h1>
                
                {loading && <div className="loading-indicator">Cargando datos...</div>}

                <div className="admin-product-actions">
                    <button 
                        onClick={() => navigate('/admin/products/new')}
                        className='btn-submit'
                    >
                        Agregar Producto
                    </button>
                    <button 
                        onClick={() => navigate('/admin')}
                        className='btn-submit'
                    >
                        Volver atrás
                    </button>

                    {/* <button 
                        onClick={() => reloadProducts()}
                        className='btn-secondary'
                    >
                        Recargar datos
                    </button> */}
                </div>

                {/* <section className="category-section">
                    <CategoryForm
                        categorias={arbolCategorias || []}
                        onCreate={async (datos) => {
                            try {
                                await createCategory(datos);
                                showSuccess('Categoría creada exitosamente');
                                await reloadProducts();
                            } catch (error) {
                                showError(`Error al crear la categoría: ${error.message}`);
                            }
                        }}
                        isLoading={loading}
                    />

                    <div className="category-list">
                        <h2>Categorías</h2>
                        {arbolCategorias?.length > 0 ? (
                            <ul>
                                {arbolCategorias.map((cat) => (
                                    <li key={cat.id}>
                                        {cat.nombre} {cat.parentId ? `(hijo de ${cat.parentId})` : '(raíz)'}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay categorías cargadas.</p>
                        )}
                        <br />
                        <h2>Subcategorías</h2>
                        {arbolCategorias?.length > 0 ? (
                            <ul>
                                {arbolCategorias.flatMap((cat) => 
                                    cat.subcategorias?.map((subcat) => (
                                        <li key={subcat.id}>
                                            {subcat.nombre} {subcat.parentId ? `(hijo de ${subcat.parentId})` : '(raíz)'}
                                        </li>
                                    ))
                                )}
                            </ul>
                        ) : (
                            <p>No hay subcategorías cargadas.</p>
                        )}
                    </div>
                </section> */}

                <h2>Productos Disponibles</h2>
                <section className="admin-product-list">
                    {productos?.length > 0 ? (
                        <div className="admin-product-grid">
                            {productos.map((producto) => {
                                //.log('Producto:', producto.nombre, 'Imágenes:', producto.imagenesUrl);
                                return (
                                <article key={producto.id} className="product-card">
                                    <div className="card-preview">
                                        {((producto.imagenesUrl && producto.imagenesUrl.length > 0) || (producto.imagenes && producto.imagenes.length > 0) || (producto.images && producto.images.length > 0)) ? (
                                            <img
                                                src={
                                                    producto.imagenesUrl?.[0] ||
                                                    (typeof producto.imagenes?.[0]?.url === 'string'
                                                        ? (producto.imagenes.find(i => i?.principal)?.url || producto.imagenes?.[0]?.url)
                                                        : '') ||
                                                    (typeof producto.images?.[0] === 'string'
                                                        ? producto.images?.[0]
                                                        : (producto.images?.[0]?.url || producto.images?.[0]?.imagenUrl || '')) ||
                                                    ''
                                                }
                                                alt={producto.nombre}
                                                className="product-image"
                                                onError={(e) => {
                                                    console.warn('Error cargando imagen:', producto.nombre, e.target.src);
                                                    e.target.src = '/placeholder-product.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="product-image-placeholder">
                                                <span>Sin imagen</span>
                                            </div>
                                        )}
                                        <div className="product-price-tag">
                                            ${producto.precioVenta || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <h3 className="card-name">{producto.nombre.length > 25 ? producto.nombre.slice(0, 25) + '...' : producto.nombre}</h3>
                                        {/* <p className="card-desc">{producto.descripcion || 'Sin descripción'}</p> */}

                                        <div className="product-info">
                                            <span className="product-sku">SKU: {producto.sku}</span>
                                            <span className="product-stock">Stock: {producto.stock || 0}</span>
                                            <span 
                                                className="product-status" 
                                                data-status={producto.estado || 'desconocido'}
                                            >
                                                {(() => {
                                                    switch ((producto.estado || '').toUpperCase()) {
                                                        case 'DISPONIBLE': return 'Disponible';
                                                        case 'SIN_STOCK': return 'Sin stock';
                                                        case 'OCULTO': return 'Oculto';
                                                        case 'DESCONTINUADO': return 'Descontinuado';
                                                        default: return 'Desconocido';
                                                    }
                                                })()}
                                            </span>
                                        </div>

                                        <div className="product-actions">
                                            <button
                                                onClick={() => navigate(`/admin/products/edit/${producto.id}`)}
                                                className="btn-edit"
                                                title="Editar producto"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(producto.id, producto.nombre)}
                                                className="btn-delete"
                                                title="Eliminar producto"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </article>
                                );
                            })}
                        </div>
                    ) : (
                        <p>No hay productos disponibles.</p>
                    )}
                </section>
                
                <h2>Productos Ocultos</h2>
                <section className="admin-product-list">
                    {productosOcultos?.length > 0 ? (
                        <div className="admin-product-grid">
                            {productosOcultos.map((producto) => {
                                return (
                                <article key={producto.id} className="product-card">
                                    <div className="card-body">
                                        <h3 className="card-name">{producto.nombre}</h3>
                                        <p className="card-desc">{producto.descripcion || 'Sin descripción'}</p>

                                        <div className="product-info">
                                            <span className="product-sku">SKU: {producto.sku}</span>
                                            <span className="product-stock">Stock: {producto.stock || 0}</span>
                                            <span 
                                                className="product-status" 
                                                data-status={producto.estado || 'desconocido'}
                                            >
                                                {(() => {
                                                    switch ((producto.estado || '').toUpperCase()) {
                                                        case 'DISPONIBLE': return 'Disponible';
                                                        case 'SIN_STOCK': return 'Sin stock';
                                                        case 'OCULTO': return 'Oculto';
                                                        case 'DESCONTINUADO': return 'Descontinuado';
                                                        default: return 'Desconocido';
                                                    }
                                                })()}
                                            </span>
                                        </div>

                                        <div className="product-actions">
                                            <button
                                                onClick={() => navigate(`/admin/products/edit/${producto.id}`)}
                                                className="btn-edit"
                                                title="Editar producto"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(producto.id, producto.nombre)}
                                                className="btn-delete"
                                                title="Eliminar producto"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </article>
                                );
                            })}
                        </div>
                    ) : (
                        <p>No hay productos disponibles.</p>
                    )}
                </section>

                <h2>Productos Descontinuados</h2>
                <section className="admin-product-list">
                    {productosDescontinuados?.length > 0 ? (
                        <div className="admin-product-grid">
                            {productosDescontinuados.map((producto) => {
                                return (
                                <article key={producto.id} className="product-card">
                                    <div className="card-body">
                                        <h3 className="card-name">{producto.nombre}</h3>
                                        <p className="card-desc">{producto.descripcion || 'Sin descripción'}</p>
                                        <div className="product-info">
                                            <span className="product-sku">SKU: {producto.sku}</span>
                                            <span 
                                                className="product-status" 
                                                data-status={producto.estado || 'desconocido'}
                                            >
                                                {(() => {
                                                    switch ((producto.estado || '').toUpperCase()) {
                                                        case 'DISPONIBLE': return 'Disponible';
                                                        case 'SIN_STOCK': return 'Sin stock';
                                                        case 'OCULTO': return 'Oculto';
                                                        case 'DESCONTINUADO': return 'Descontinuado';
                                                        default: return 'Desconocido';
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                                );
                            })}
                        </div>
                    ) : (
                        <p>No hay productos descontinuados.</p>
                    )}
                </section>

            </main>
        </>
    );
}