import { useState } from 'react';

export const ProductForm = () => {
    // 1. Estado para los campos fijos
    const [formData, setFormData] = useState({
        nombre: '',
        sku: '',
        descripcion: '',
        price: '',
        stock: '',
        estado: 'activo',
        categoria: '1',
        images: [] // Para manejar los archivos
    });

    // 2. Estado para las características dinámicas (Array de objetos)
    const [specs, setSpecs] = useState([
        { id: Date.now(), key: '', value: '' } // Valor inicial con 1 fila vacía
    ]);

    // Manejador para campos simples
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejador para archivos
    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            images: Array.from(e.target.files)
        }));
    };

    // 3. Lógica para agregar/quitar/especificaciones
    const addSpec = () => {
        setSpecs([...specs, { id: Date.now(), key: '', value: '' }]);
    };

    const removeSpec = (id) => {
        if (specs.length === 1) {
            // Opcional: Limpiar el último en vez de borrarlo
            setSpecs([{ id: Date.now(), key: '', value: '' }]);
            return;
        }
        setSpecs(specs.filter(spec => spec.id !== id));
    };

    const updateSpec = (id, field, value) => {
        setSpecs(specs.map(spec => 
            spec.id === id ? { ...spec, [field]: value } : spec
        ));
    };

    // 4. Submit final
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Combinar formData con specs procesados
        const finalData = {
            ...formData,
            caracteristicas: specs.filter(s => s.key && s.value) // Solo enviar los completos
        };

        console.log('Enviando producto:', finalData);
        alert('Producto listo para enviar (ver consola)');
        // Aquí iría tu llamada a la API
    };

    return (
        <section className="product-form">
            <h2>Formulario de producto</h2>
            {/* <br /> */}
            <form>

                {/* Nombre */}
                <label htmlFor="nombre">Nombre</label>
                <input 
                    type="text" 
                    id="nombre" 
                    name="nombre" 
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre del producto" 
                    required
                />

                {/* SKU */}
                <label htmlFor="sku">SKU</label>
                <input 
                    type="text" 
                    id="sku" 
                    name="sku" 
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="SKU del producto" 
                    required
                />

                {/* Descripción */}
                <label htmlFor="descripcion">Descripción</label>
                <textarea 
                    id="descripcion" 
                    name="descripcion" 
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del producto"
                    required
                ></textarea>

                {/* Precio */}
                <label htmlFor="price">Precio</label>
                <input 
                    type="number" 
                    id="price" 
                    name="price" 
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                />

                {/* Stock */}
                <label htmlFor="stock">Stock</label>
                <input 
                    type="number" 
                    id="stock"
                    name="stock" 
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    required
                />

                {/* Estado */}
                <label htmlFor="estado">Estado</label>
                <select 
                    id="estado" 
                    name="estado" 
                    value={formData.estado}
                    onChange={handleChange}
                    required
                >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>

                {/* Categoria */}
                <label htmlFor="categoria">Categoria</label>
                <select 
                    id="categoria" 
                    name="categoria" 
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                >
                    <option value="1">Electrónica</option>
                    <option value="2">Hogar</option>
                    <option value="3">Moda</option>
                    <option value="4">Deportes</option>
                    <option value="5">Juguetes</option>
                    <option value="6">Otros</option>
                </select>

                {/* Características */}

                <div className="field specs-section">
                    <div className="specs-header">
                        <label>Características / Especificaciones</label>
                        <button 
                            type="button" 
                            className="btn-add-spec" 
                            onClick={addSpec}
                            title="Agregar característica"
                        >
                            + Agregar
                        </button>
                    </div>
                    
                    <div className="specs-list">
                        {specs.map((spec, index) => (
                            <div key={spec.id} className="spec-row">
                                <input 
                                    type="text" 
                                    placeholder="Clave (ej. Color)" 
                                    value={spec.key}
                                    onChange={(e) => updateSpec(spec.id, 'key', e.target.value)}
                                    className="spec-key"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Valor (ej. Rojo)" 
                                    value={spec.value}
                                    onChange={(e) => updateSpec(spec.id, 'value', e.target.value)}
                                    className="spec-value"
                                />
                                <button 
                                    type="button" 
                                    className="btn-remove-spec" 
                                    onClick={() => removeSpec(spec.id)}
                                    title="Eliminar fila"
                                    aria-label="Eliminar característica"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="field-help">Agrega pares clave-valor para detallar el producto.</p>
                </div>
                {/* <label htmlFor="caracteristicas">Características</label>
                <textarea 
                    id="caracteristicas" 
                    name="caracteristicas" 
                    placeholder="Características del producto"
                    required
                ></textarea> */}

                {/* Imágenes */}
                <label htmlFor="image">Imágenes</label>
                <input 
                    type="file" 
                    id="image" 
                    name="image" 
                    multiple
                    onChange={handleFileChange}
                    accept='image/**'
                />
                {formData.images.length > 0 && (
                    <span className="file-count">{formData.images.length} archivo(s) seleccionado(s)</span>
                )}

                {/* <input 
                    type="url" 
                    id="imageurl" 
                    name="imageurl" 
                    multiple
                /> */}

                {/* Botón de enviar */}
                <button type="submit">Agregar producto</button>
                <br />
            </form>
        </section>
    );
};