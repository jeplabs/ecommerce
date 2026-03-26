import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

export const ProductForm = ({ initialData = null, onSubmit, isSubmitting = false, onCancel, categorias = [] }) => {
    //Datos iniciales del formulario (si es edición)
    const isEditing = !!initialData; 

    //Modo de imagen (url o file)
    const [imageMode, setImageMode] = useState('url'); // Solo URLs, sin archivos

    //  Estado para los campos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        sku: '',
        descripcion: '',
        price: '',
        stock: '',
        estado: 'activo',
        categoria: '',
        moneda: 'USD',
        images: [] 
    });

    // Estado para manejar el input de URL 
    const [urlInput, setUrlInput] = useState('');

    // Estado para el mensaje de error
    const [errors, setErrors] = useState({});

    // Estado para las características dinámicas (Array de objetos)
    const [specs, setSpecs] = useState([
        { id: Date.now(), key: '', value: '' } // Valor inicial con 1 fila vacía
    ]);

    // Cargar datos si es edición
    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.nombre || '',
                sku: initialData.sku || '',
                descripcion: initialData.descripcion || '',
                price: initialData.price || '',
                stock: initialData.stock || '',
                estado: initialData.estado || 'activo',
                categoria: initialData.categoria?.id?.toString() || initialData.categoria?.toString() || '',
                moneda: initialData.moneda || 'USD',
                images: [] 
            });

            // Si el producto editado tiene imágenes que son URLs (strings), las cargamos
            if (initialData.images && initialData.images.length > 0) {
                const loadedImages = initialData.images.map((img, index) => {
                    const isUrl = typeof img === 'string';
                    return {
                        id: index,
                        type: isUrl ? 'url' : 'file',
                        url: isUrl ? img : null,
                        file: isUrl ? null : img,
                        preview: isUrl ? img : URL.createObjectURL(img)
                    };
                });
                setFormData(prev => ({ ...prev, images: loadedImages }));
                
                // Si hay URLs, cambiamos el modo automáticamente (opcional)
                if (loadedImages.some(i => i.type === 'url')) {
                    setImageMode('url');
                }
            }

            if (initialData.caracteristicas && initialData.caracteristicas.length > 0) {
                setSpecs(initialData.caracteristicas.map((c, index) => ({
                    id: index,
                    key: c.key || c.nombre,
                    value: c.value
                })));
            } else {
                setSpecs([{ id: Date.now(), key: '', value: '' }]);
            }
        }
    }, [initialData]);

    // Efecto de scroll de errores
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
            return () => clearTimeout(timer); 
        }
    }, [errors]); 

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
            type: 'file',
            file: file,
            preview: URL.createObjectURL(file)
        }));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
        
        // Limpiar error de imágenes si se selecciona al menos una
        // if (formData.images.length + newImages.length > 0 && errors.images) {
        //     setErrors(prev => ({ ...prev, images: null }));
        // }

        if (errors.images) setErrors(prev => ({ ...prev, images: null }));

        // Limpiar el input de archivos
        e.target.value = '';
    };

    // Manejador para URLS
    const handleAddUrl = () => {
        if (!urlInput.trim()) return;
        
        // Validación básica de URL
        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            setErrors(prev => ({ ...prev, images: 'La URL debe comenzar con http:// o https://' }));
            return;
        }

        const newImage = {
            id: Date.now(),
            type: 'url',
            url: urlInput,
            preview: urlInput
        };

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImage]
        }));
        
        setUrlInput(''); // Limpiar input
        if (errors.images) setErrors(prev => ({ ...prev, images: null }));
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

        const nombre = (formData.nombre ?? '').toString();
        const sku = (formData.sku ?? '').toString();
        const descripcion = (formData.descripcion ?? '').toString();
        const price = (formData.price ?? '').toString();
        const stock = (formData.stock ?? '').toString();
        const estado = (formData.estado ?? '').toString();
        const moneda = (formData.moneda ?? '').toString();
        const categoria = (formData.categoria ?? '').toString();

        if (!nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio";
        }

        if (!sku.trim()) {
            newErrors.sku = "El SKU es obligatorio";
        }

        if (!descripcion.trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        }

        if (!price.trim()) {
            newErrors.price = "El precio es obligatorio";
        } else if (isNaN(price)) {
            newErrors.price = "El precio debe ser un número mayor a 0";
        }

        if (!stock.trim()) {
            newErrors.stock = "El stock es obligatorio";
        } else if (isNaN(stock)) {
            newErrors.stock = "El stock debe ser un número mayor a 0";
        }

        if (!estado.trim()) {
            newErrors.estado = "El estado es obligatorio";
        }

        if (!moneda.trim()) {
            newErrors.moneda = "La moneda es obligatoria";
        }

        if (!categoria.trim()) {
            newErrors.categoria = "La categoria es obligatoria";
        }

        // En edición, no requerimos imágenes (ya existen en el servidor)
        // En creación, sí requerimos al menos una imagen
        if (!isEditing && formData.images.length === 0) {
            newErrors.images = "Debe seleccionar al menos una imagen del producto";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit final
    const handleSubmit = (e) => {
        e.preventDefault();

        // Ejecutar validación antes de proceder
        if (!validateForm()) return;

        const filesToUpload = formData.images.filter(img => img.type === 'file').map(img => img.file);
        const urlsToSave = formData.images.filter(img => img.type === 'url').map(img => img.url);

        if (filesToUpload.length > 0) {
            setErrors(prev => ({ ...prev, images: 'Por favor usa URLs de imagen para crear producto (backend no soporta carga directa de archivos aquí).'}));
            return;
        }

        // En creación: obligar al menos una imagen
        // En edición: permitir no cambiar imágenes
        if (!isEditing && urlsToSave.length === 0) {
            setErrors(prev => ({ ...prev, images: 'Debe haber al menos una imagen en formato URL.'}));
            return;
        }

        // Combinar formData con specs procesados y esquema que exige el backend
        const specsObject = specs
            .filter(s => s.key && s.value)
            .reduce((acc, spec) => {
                acc[spec.key] = spec.value;
                return acc;
            }, {});

        const finalData = {
            sku: formData.sku.trim(),
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            specs: Object.keys(specsObject).length > 0 ? specsObject : null,
            stock: Number(formData.stock),
            precio: {
                precioVenta: Number(formData.price),
                precioCosto: Number(formData.price),
                moneda: formData.moneda || 'USD'
            },
            categoriaIds: [Number(formData.categoria)],
            imagenesUrl: urlsToSave.length > 0 ? urlsToSave : null
        };

        console.debug('ProductForm submit finalData', finalData);
        onSubmit(finalData);
    };

    return (
        <section className="product-form">
            <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
                    disabled={isEditing}
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

                    {/* Moneda */}
                    <div className="form-field">
                        <label htmlFor="moneda">Moneda</label>
                        <select
                            id="moneda"
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleChange}
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="ARS">ARS</option>
                        </select>
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
                            <option value="">Selecciona una categoría</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
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
                {/* <label htmlFor="image">Imágenes</label>
                <input 
                    type="file" 
                    id="image" 
                    name="image" 
                    multiple
                    onChange={handleFileChange}
                    accept='image/**'
                /> */}
                {/* {formData.images.length > 0 && (
                    <span className="file-count">{formData.images.length} archivo(s) seleccionado(s)</span>
                )} */}


                {/* Solo se permiten URLs de imágenes */}
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                    Ingresa las URLs de las imágenes del producto:
                </p>

                {/* Opción B: Usar URLs */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                    />
                    <button type="button" onClick={handleAddUrl} style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Agregar URL
                    </button>
                </div>

                {/* Opción comentada: Subir Archivos (no se usa) */}
                {/*
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="imageMode"
                            value="file"
                            checked={imageMode === 'file'}
                            onChange={() => setImageMode('file')}
                            style={{ marginRight: '5px' }}
                        />
                        Subir Archivos
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="imageMode"
                            value="url"
                            checked={imageMode === 'url'}
                            onChange={() => setImageMode('url')}
                            style={{ marginRight: '5px' }}
                        />
                        Usar URL
                    </label>
                </div>

                {imageMode === 'file' && (
                    <div>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            multiple
                            onChange={handleFileChange}
                            accept='image/**'
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>Puedes seleccionar múltiples archivos.</p>
                    </div>
                )}
                */}

                {errors.images && <span className="error">{errors.images}</span>}

                {/* Vista Previa (Común para ambos) */}
                {/* {formData.images.length > 0 && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                        gap: '10px', 
                        marginTop: '15px' 
                    }}>
                        {formData.images.map((img) => (
                            <div key={img.id} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                <img 
                                    src={img.preview} 
                                    alt="Vista previa"
                                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                />
                                {img.type === 'url' && (
                                    <span style={{ position: 'absolute', top: '2px', left: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px' }}>URL</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    style={{
                                        position: 'absolute', top: '2px', right: '2px',
                                        background: '#ef4444', color: 'white', border: 'none',
                                        borderRadius: '50%', width: '20px', height: '20px',
                                        cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                )} */}

                

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
                {/* <button type="submit" className="btn-submit">Agregar producto</button>
                <br /> */}
                {/* Botones */}
                <div style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Agregar Producto')}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }} disabled={isSubmitting}>
                            Cancelar
                        </button>
                    )}
                </div>
                <br />
            </form>
        </section>
    );
};