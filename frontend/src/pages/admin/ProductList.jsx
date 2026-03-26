import Navbar from "../../components/Navbar"
import { useNavigate } from 'react-router-dom';
import { useProduct } from "../../context/ProductContext";
import { useToast } from "../../context/ToastContext";
import { CategoryForm } from "../../components/admin/CategoryForm";

export default function ProductList() {
    const navigate = useNavigate();
    const { productos, categorias, loading, reloadProducts, updateProduct, deleteProduct, createCategory } = useProduct();
    const { showSuccess, showError } = useToast();

    const handleDelete = async (id, nombre) => {
        const confirmed = window.confirm(`¿Estás seguro de que quieres desactivar el producto ${nombre}?`);
        if (!confirmed) return;

        try {
            const result = await deleteProduct(id);
            if (result.success) {
                showSuccess('Producto eliminado exitosamente');
                await reloadProducts();
            } else {
                showError(`Error al eliminar el producto: ${result.message}`);
            }
        } catch (error) {
            showError('Error al eliminar el producto');
        }
    };
    
    return (
        <>
            <Navbar />
            <main className="products-container">
                <h1>Admin: Productos y Categorías</h1>
                
                {loading && <div className="loading-indicator">Cargando datos...</div>}

                <div className="admin-actions">
                    <button 
                        onClick={() => navigate('/admin/products/new')}
                        className='btn-submit'
                    >
                        Agregar Producto
                    </button>

                    {/* <button 
                        onClick={() => reloadProducts()}
                        className='btn-secondary'
                    >
                        Recargar datos
                    </button> */}
                </div>

                <section className="category-section">
                    <CategoryForm
                        categorias={categorias || []}
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
                        <h2>Categorías existentes</h2>
                        {categorias?.length > 0 ? (
                            <ul>
                                {categorias.map((cat) => (
                                    <li key={cat.id}>
                                        {cat.nombre} {cat.parentId ? `(hijo de ${cat.parentId})` : '(raíz)'}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay categorías cargadas.</p>
                        )}
                    </div>
                </section>

                    <h2>Productos</h2>
                <section className="admin-product-list">
                    {productos?.length > 0 ? (
                        <div className="admin-product-grid">
                            {productos.map((producto) => {
                                //.log('Producto:', producto.nombre, 'Imágenes:', producto.imagenesUrl);
                                return (
                                <article key={producto.id} className="product-card">
                                    <div className="card-preview">
                                        {((producto.imagenesUrl && producto.imagenesUrl.length > 0) || (producto.images && producto.images.length > 0)) ? (
                                            <img
                                                src={producto.imagenesUrl?.[0] || producto.images?.[0] || ''}
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
                                        <h3 className="card-name">{producto.nombre}</h3>
                                        <p className="card-desc">{producto.descripcion || 'Sin descripción'}</p>

                                        <div className="product-info">
                                            <span className="product-sku">SKU: {producto.sku}</span>
                                            <span className="product-stock">Stock: {producto.stock || 0}</span>
                                            <span 
                                                className="product-status" 
                                                data-status={producto.estado || 'desconocido'}
                                            >
                                                {producto.estado 
                                                    ? producto.estado.charAt(0).toUpperCase() + producto.estado.slice(1) 
                                                    : 'Desconocido'}
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

            </main>
        </>
    );
}