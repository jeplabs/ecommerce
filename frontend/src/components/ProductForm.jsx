import { useState, useEffect } from 'react';    

export const ProductForm = () => {
    //  Estado para los campos del formulario
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

    // Estado para el mensaje de error
    const [errors, setErrors] = useState({});

    // Estado para las características dinámicas (Array de objetos)
    const [specs, setSpecs] = useState([
        { id: Date.now(), key: '', value: '' } // Valor inicial con 1 fila vacía
    ]);

    // Este efecto se ejecuta CADA VEZ que el estado 'errors' cambia
    useEffect(() => {
        // Si hay al menos un error en el objeto...
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
            const firstErrorElement = document.querySelector('.error');
            
            if (firstErrorElement) {
                // Obtener el input asociado a este error
                const inputAssociated = firstErrorElement.previousElementSibling;
                
                // SOLO hacer scroll y foco si el usuario NO está ya enfocado en OTRO campo válido
                // o si el campo con error no es el que tiene el foco actual
                if (document.activeElement !== inputAssociated) {
                    firstErrorElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    // Solo enfocar si no estamos escribiendo activamente en otro lado
                    // Esto previene el salto mientras escribes
                    if (inputAssociated) {
                        // Pequeña verificación extra: ¿El usuario está escribiendo en otro lado?
                        // Si el activeElement es un input, y no es el del error, no hacemos foco.
                        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                        inputAssociated.focus();
                        }
                    }
                }
            }
            }, 100); // 100ms es suficiente

            return () => clearTimeout(timer); // Limpieza
        }
    }, [errors]); // <--- Esto es clave: solo se ejecuta cuando 'errors' cambia

    // Manejador para campos simples
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Manejador para archivos
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        const newImages = selectedFiles.map(file => ({
            id: Date.now() + Math.random(),
            file: file,
            preview: URL.createObjectURL(file)
        }));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
        
        // Limpiar error de imágenes si se selecciona al menos una
        if (formData.images.length + newImages.length > 0 && errors.images) {
            setErrors(prev => ({ ...prev, images: null }));
        }

        // Limpiar el input de archivos
        e.target.value = '';
    };

    const removeImage = (idToRemove) => {
        setFormData(prev => {
            const newImages = prev.images.filter(img => img.id !== idToRemove);

            if (newImages.length === 0) {
                setErrors(err => ({ ...err, images: 'Debe seleccionar al menos una imagen del producto' }));
            }

            return { 
                ...prev, 
                images: newImages 
            };
        });

        if (formData.images.length === 1)
            setErrors(prev => ({ 
                ...prev, 
                images: "Debe seleccionar al menos una imagen del producto" 
        }));
    };

    // Lógica para características dinámicas
    const addSpec = () => {
        setSpecs([...specs, { id: Date.now(), key: '', value: '' }]);
    };

    const removeSpec = (id) => {
        if (specs.length === 1) {
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

    // Validar campos obligatorios
    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio";
        }

        if (!formData.sku.trim()) {
            newErrors.sku = "El SKU es obligatorio";
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        }

        if (!formData.price.trim()) {
            newErrors.price = "El precio es obligatorio";
        } else if (isNaN(formData.price)) {
            newErrors.price = "El precio debe ser un número mayor a 0";
        }

        if (!formData.stock.trim()) {
            newErrors.stock = "El stock es obligatorio";
        } else if (isNaN(formData.stock)) {
            newErrors.stock = "El stock debe ser un número mayor a 0";
        }

        if (!formData.estado.trim()) {
            newErrors.estado = "El estado es obligatorio";
        }

        if (!formData.categoria.trim()) {
            newErrors.categoria = "La categoria es obligatoria";
        }

        if (formData.images.length === 0) {
            newErrors.images = "Debe seleccionar al menos una imagen del producto";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit final
    const handleSubmit = (e) => {
        e.preventDefault();

        // Ejecutar validación antes de proceder
        if (!validateForm()) {
            // Scroll suave hacia el primer error
            const firstErrorField = document.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
            return;
        }

        // Convertir los archivos a arreglo de objetos
        const filesToUpload = formData.images.map(img => img.file);

        // Combinar formData con specs procesados
        const finalData = {
            ...formData,
            images: filesToUpload,
            price: parseInt(formData.price),
            stock: parseInt(formData.stock),
            caracteristicas: specs.filter(s => s.key && s.value)
        };

        console.log('Enviando producto:', finalData);
        alert('Producto listo para enviar (ver consola)');
        // Aquí iría tu llamada a la API
    };

    return (
        <section className="product-form">
            <h2>Formulario de producto</h2>
            {/* <br /> */}
            <form onSubmit={handleSubmit} noValidate>

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
                {errors.nombre && <span className="error">{errors.nombre}</span>}

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
                {errors.sku && <span className="error">{errors.sku}</span>}

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
                {errors.descripcion && <span className="error">{errors.descripcion}</span>}
                
                {/* Campos de precio y stock */}
                <div className="form-row">
                        
                    {/* Precio */}
                    <div className="form-field">
                        <label htmlFor="price">Precio</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            //step="0.01"
                            onInput={(e) => {
                                if (e.target.value < 0) {
                                    e.target.value = '';
                                }
                            }}
                            placeholder="0.00"
                            required
                        />
                        {errors.price && <span className="error">{errors.price}</span>}
                    </div>

                    {/* Stock */}
                    <div className="form-field">
                        <label htmlFor="stock">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                            required
                        />
                        {errors.stock && <span className="error">{errors.stock}</span>}
                    </div>
                </div>

                <div className="form-row">
                    {/* Estado */}
                    <div className="form-field">
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
                    </div>

                    {/* Categoria */}
                    <div className="form-field">
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
                    </div>
                </div>

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
                    {errors.caracteristicas && <span className="error">{errors.caracteristicas}</span>}
                    <p className="field-help">Agrega pares clave-valor para detallar el producto.</p>
                </div>

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

                {errors.images && <span className="error">{errors.images}</span>}

                {formData.images.length > 0 && !errors.images && (
                    <div style={{ 
                        color: '#10b981', 
                        fontSize: '0.85rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {formData.images.length} imagen(es) lista(s) para subir
                    </div>
                )}

                {formData.images.length > 0 && (
        <div style={{ 
            padding: '1rem', 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0',
            marginBottom: '1rem'
        }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>
                Archivos seleccionados ({formData.images.length}):
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {formData.images.map((img) => (
                    <li key={img.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        //background: 'white',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        //border: '1px solid #f1f5f9',
                        fontSize: '0.9rem'
                    }}>
                        <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            maxWidth: '80%',
                            //color: '#334155'
                        }}>
                            📄 {img.file.name}
                        </span>
                        
                        {/* Botón para eliminar este archivo específico */}
                        <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            style={{
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.2rem 0.6rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                marginLeft: '0.5rem'
                            }}
                            title="Eliminar archivo"
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )}

                {/* Vistas previas de las imágenes */}
                {formData.images.length > 0 && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                        gap: '0.8rem', 
                        marginTop: '1rem' 
                    }}>
                        {formData.images.map((img) => (
                            <div key={img.id} style={{ position: 'relative', group: 'hover' }}>
                                {/* Imagen */}
                                <img 
                                    src={img.preview} 
                                    alt="Vista previa"
                                    style={{ 
                                        width: '100%', 
                                        aspectRatio: '1/1', 
                                        objectFit: 'cover', 
                                        borderRadius: '8px',
                                        border: '1px solid var(--border, rgba(255,255,255,0.1))',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                />
                                
                                {/* Botón Eliminar (X) */}
                                <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: '2px solid #1a2235', // Borde del color de fondo del form
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                    aria-label="Eliminar imagen"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* Botón de enviar */}
                <button type="submit" className="btn-submit">Agregar producto</button>
                <br />
            </form>
        </section>
    );
};