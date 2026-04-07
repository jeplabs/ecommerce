import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

export const ProductForm = ({ 
    initialData = null, 
    onSubmit, 
    isSubmitting = false, 
    onCancel, 
    arbolCategorias = [] 
}) => {
    //Datos iniciales del formulario (si es edición)
    const isEditing = !!initialData; 

    //Modo de imagen (url o file)
    const [imageMode, setImageMode] = useState('url'); // Solo URLs, sin archivos

    //console.log(subcategorias)
    // Estado para manejar el input de URL 
    const [urlInput, setUrlInput] = useState('');

    // Estado para el mensaje de error
    const [errors, setErrors] = useState({});

    // Estado para las características dinámicas (Array de objetos)
    const [specs, setSpecs] = useState([]);

    // Estado para categorías adicionales
    const [additionalCategories, setAdditionalCategories] = useState([]);


    //  Estado para los campos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        sku: '',
        descripcion: '',
        price: '',
        stock: '',
        estado: 'disponible',
        categoria: '',
        subcategoria: '',
        subsubcategoria: '',
        moneda: 'USD',
        images: [] 
    });

    // Cargar datos si es edición
    useEffect(() => {
        if (initialData) {
            console.log(initialData)

            const estadoNormalizado = initialData.estado
                ? initialData.estado.toLowerCase().replace(/_/g, '-')
                : 'disponible';
            
                // 1. Obtener todos los IDs de categorías disponibles
            // Usamos el array 'categorias' que envía el backend
            const todosLosNodos = initialData.categorias || [];
            const todosLosIds = todosLosNodos.map(n => n.id);

            // 2. Función auxiliar para ordenar una rama jerárquica (Padre -> Hijo -> Nieto)
            const construirRama = (idsDisponibles) => {
                if (idsDisponibles.length === 0) return [];
                
                // Buscar el nodo raíz (el que tiene parentId null)
                let raiz = todosLosNodos.find(n => idsDisponibles.includes(n.id) && n.parentId === null);
                
                // Si no hay raíz explícita (ej. todo son subcategorías), tomamos el primero disponible como base
                if (!raiz) raiz = todosLosNodos.find(n => idsDisponibles.includes(n.id));
                if (!raiz) return [];

                const rama = [raiz.id];

                // Buscar hijo
                let hijo = todosLosNodos.find(n => n.parentId === raiz.id && idsDisponibles.includes(n.id));
                if (hijo) {
                    rama.push(hijo.id);
                    // Buscar nieto
                    let nieto = todosLosNodos.find(n => n.parentId === hijo.id && idsDisponibles.includes(n.id));
                    if (nieto) rama.push(nieto.id);
                }
                return rama;
            };

            // 3. Construir la Categoría Principal
            const ramaPrincipal = construirRama(todosLosIds);
            
            setFormData({
                nombre: initialData.nombre || '',
                sku: initialData.sku || '',
                descripcion: initialData.descripcion || '',
                price: initialData.price || '',
                stock: initialData.stock || '',
                estado: estadoNormalizado,
                categoria: ramaPrincipal[0]?.toString() || '',
                subcategoria: ramaPrincipal[1]?.toString() || '',
                subsubcategoria: ramaPrincipal[2]?.toString() || '',
                moneda: initialData.moneda || 'USD',
                images: [] 
            });

            // 4. Construir Categorías Adicionales
            // Quitamos los IDs que ya usamos en la principal
            const idsUsados = new Set(ramaPrincipal);
            const idsRestantes = todosLosIds.filter(id => !idsUsados.has(id));

            const gruposAdicionales = [];
            if (idsRestantes.length > 0) {
                // Mientras queden IDs, intentamos construir ramas de 3
                let idsTemp = [...idsRestantes];
                let index = 0;
                
                while (idsTemp.length > 0) {
                    const rama = construirRama(idsTemp);
                    if (rama.length > 0) {
                        gruposAdicionales.push({
                            id: `edit_cat_${Date.now()}_${index}`,
                            categoria: rama[0]?.toString() || '',
                            subcategoria: rama[1]?.toString() || '',
                            subsubcategoria: rama[2]?.toString() || ''
                        });
                        // Remover los IDs usados de la lista temporal
                        idsTemp = idsTemp.filter(id => !rama.includes(id));
                        index++;
                    } else {
                        // Si no podemos construir una rama lógica, agregamos lo que quede como categoría suelta
                        // (Esto es un caso borde por si los datos están muy sucios)
                        gruposAdicionales.push({
                            id: `edit_cat_${Date.now()}_${index}`,
                            categoria: idsTemp[0]?.toString() || '',
                            subcategoria: '',
                            subsubcategoria: ''
                        });
                        idsTemp.shift();
                        index++;
                    }
                }
            }

            setAdditionalCategories(gruposAdicionales);
            // let categoria = '';
            // let subcategoria = '';
            // let subsubcategoria = '';
            // for (const cat in initialData.categorias) {
            //     if (initialData.categorias[cat].parentId == null) {
            //         categoria = cat;
            //     } else {
            //         subcategoria = cat;
            //     }
            // }

            if (initialData && initialData.specs) {
                if (specs.length === 0) {
                    if (initialData.specs && Object.keys(initialData.specs).length > 0) {
                        const specsArray = Object.entries(initialData.specs).map(([k, v], idx) => ({
                            id: `spec_${Date.now()}_${idx}`,
                            key: k,
                            value: v
                        }));
                        setSpecs(specsArray);
                    } else {
                        setSpecs([]);
                    }       
                }
            }
            
            // setFormData({
            //     nombre: initialData.nombre || '',
            //     sku: initialData.sku || '',
            //     descripcion: initialData.descripcion || '',
            //     price: initialData.price || '',
            //     stock: initialData.stock || '',
            //     estado: estadoNormalizado,
            //     categoria: initialData.categoria?.id?.toString() || initialData.categoria?.toString() || '',
            //     subcategoria: initialData.subcategoria?.id?.toString() || initialData.subcategoria?.toString() || '',
            //     subsubcategoria: initialData.subsubcategoria?.id?.toString() || initialData.subsubcategoria?.toString() || '',
            //     moneda: initialData.moneda || 'USD',
            //     images: [] 
            // });

            // const gruposAdicionales = [];
            
            // // Opción A: Si tu backend llega a enviar un campo 'categoriaIds' en el futuro
            // if (initialData.categoriaIds && Array.isArray(initialData.categoriaIds)) {
            //     const idsRestantes = initialData.categoriaIds.slice(3); // Saltamos los 3 primeros
            //     for (let i = 0; i < idsRestantes.length; i += 3) {
            //         const chunk = idsRestantes.slice(i, i + 3);
            //         if (chunk.length > 0) {
            //             gruposAdicionales.push({
            //                 id: `edit_cat_${Date.now()}_${i}`,
            //                 categoria: chunk[0]?.toString() || '',
            //                 subcategoria: chunk[1]?.toString() || '',
            //                 subsubcategoria: chunk[2]?.toString() || ''
            //             });
            //         }
            //     }
            // } 
            // // Opción B: Usar el array 'categorias' si contiene más objetos que la rama principal
            // else if (initialData.categorias && Array.isArray(initialData.categorias) && initialData.categorias.length > 3) {
            //     // Asumimos que los primeros 3 son la principal, el resto son adicionales
            //     const catsRestantes = initialData.categorias.slice(3);
            //     for (let i = 0; i < catsRestantes.length; i += 3) {
            //         const chunk = catsRestantes.slice(i, i + 3);
            //         if (chunk.length > 0) {
            //             gruposAdicionales.push({
            //                 id: `edit_cat_${Date.now()}_${i}`,
            //                 categoria: chunk[0]?.id?.toString() || '',
            //                 subcategoria: chunk[1]?.id?.toString() || '',
            //                 subsubcategoria: chunk[2]?.id?.toString() || ''
            //             });
            //         }
            //     }
            // }

            // setAdditionalCategories(gruposAdicionales);

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

            // setSpecs(initialData.specs || {})
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

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'categoria') {
                newData.subcategoria = "";
                newData.subsubcategoria = "";
            }

            if (name === 'subcategoria') {
                newData.subsubcategoria = "";
            }

            return newData;
        });
    
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
        const newSpec = {
            id: `spec_${Date.now()}_${Math.random()}`,
            key: '',
            value: ''
        };
        setSpecs(prev => {
            const nuevoArray = [...prev, newSpec]
            return nuevoArray;
        });
    };

    const removeSpec = (idToRemove) => {
        setSpecs(prev => prev.filter(spec => spec.id !== idToRemove));
    };

    const updateSpec = (id, field, newValue) => {
        setSpecs(prev => prev.map(spec => 
            spec.id === id ? { ...spec, [field]: newValue } : spec
        ));
    };

    // Lógica para Categorías Adicionales
    const addAdditionalCategory = () => {
        const newCatGroup = {
            id: `cat_group_${Date.now()}_${Math.random()}`,
            categoria: '',
            subcategoria: '',
            subsubcategoria: ''
        };
        setAdditionalCategories(prev => [...prev, newCatGroup]);
    };

    const removeAdditionalCategory = (idToRemove) => {
        setAdditionalCategories(prev => prev.filter(cat => cat.id !== idToRemove));
    };

    const updateAdditionalCategory = (id, field, newValue) => {
        setAdditionalCategories(prev => prev.map(cat => {
            if (cat.id !== id) return cat;
            
            const updatedCat = { ...cat, [field]: newValue };
            
            if (field === 'categoria') {
                updatedCat.subcategoria = '';
                updatedCat.subsubcategoria = '';
            }
            if (field === 'subcategoria') {
                updatedCat.subsubcategoria = '';
            }
            return updatedCat;
        }));
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
        const subcategoria = (formData.subcategoria ?? '').toString();
        const subsubcategoria = (formData.subsubcategoria ?? '').toString();

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

        if (!subcategoria.trim()) {
            newErrors.subcategoria = "La subcategoría es obligatoria";
        }

        // if (!subsubcategoria.trim()) {
        //     newErrors.subsubcategoria = "La subsubcategoría es obligatoria";
        // }

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
        const specsObject = {};
        specs.forEach(spec => {
            if (spec.key && spec.value && spec.key.trim() !== '') {
                specsObject[spec.key] = spec.value;
            }
        });

        // const categoriasIds = [
        //     formData.categoria,
        //     formData.subcategoria,
        //     formData.subsubcategoria
        // ]
        //     .filter(id => id)
        //     .map(id => Number(id));

        const allCategoryIds = new Set();

        if (formData.categoria) allCategoryIds.add(Number(formData.categoria));
        if (formData.subcategoria) allCategoryIds.add(Number(formData.subcategoria));
        if (formData.subsubcategoria) allCategoryIds.add(Number(formData.subsubcategoria));

        additionalCategories.forEach(group => {
            if (group.categoria) allCategoryIds.add(Number(group.categoria));
            if (group.subcategoria) allCategoryIds.add(Number(group.subcategoria));
            if (group.subsubcategoria) allCategoryIds.add(Number(group.subsubcategoria));
        });

        const finalData = {
            sku: formData.sku.trim(),
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            specs: Object.keys(specsObject).length > 0 ? specsObject : null,
            stock: Number(formData.stock),
            estado: formData.estado,
            precio: {
                precioVenta: Number(formData.price),
                precioCosto: Number(formData.price),
                moneda: formData.moneda || 'USD'
            },
            // categoriaIds: categoriasIds,
            categoriaIds: Array.from(allCategoryIds),
            imagenesUrl: urlsToSave.length > 0 ? urlsToSave : null
        };

        //console.debug('ProductForm submit finalData', finalData);
        onSubmit(finalData);
    };

    // Helper para encontrar nodos en el árbol
    const findNodeById = (id, tree) => {
        for (const node of tree) {
            if (node.id == id) return node;
            if (node.subcategorias) {
                const found = findNodeById(id, node.subcategorias);
                if (found) return found;
            }
        }
        return null;
    };

    // Componente interno para renderizar un grupo de categorías (Principal o Adicional)
    const renderCategoryGroup = (catData, isAdditional = false, index = null) => {
        const catId = isAdditional ? catData.categoria : formData.categoria;
        const subCatId = isAdditional ? catData.subcategoria : formData.subcategoria;
        const subSubCatId = isAdditional ? catData.subsubcategoria : formData.subsubcategoria;

        const catNode = findNodeById(catId, arbolCategorias);
        const subCatNode = subCatId ? findNodeById(subCatId, arbolCategorias) : null;

        const handleChangeLocal = (e) => {
            const { name, value } = e.target;
            if (isAdditional && index !== null) {
                updateAdditionalCategory(catData.id, name, value);
            } else {
                // Para la principal, usamos el handleChange global del formulario
                // Pero necesitamos simular el evento con el nombre correcto
                handleChange(e);
            }
        };

        return (
            <div className={`category-group ${isAdditional ? 'additional-category-group' : 'main-category-group'}`} 
                style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '15px',
                    position: 'relative'
                }}>
                
                {/* Fila 1: Categoría y Subcategoría */}
                <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-field" style={{ flex: 1 }}>
                        <label>{isAdditional ? 'Categoría' : 'Categoria'}</label>
                        <select
                            name="categoria"
                            value={catId}
                            onChange={handleChangeLocal}
                            required={!isAdditional}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="">Selecciona una categoría</option>
                            {arbolCategorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field" style={{ flex: 1 }}>
                        <label>{isAdditional ? 'Subcategoría' : 'Subcategoria'}</label>
                        <select
                            name="subcategoria"
                            value={subCatId}
                            onChange={handleChangeLocal}
                            disabled={!catId}
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="">Selecciona una subcategoría</option>
                            {catId && catNode?.subcategorias?.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Fila 2: Subsubcategoría y Botón Eliminar (si es adicional) */}
                <div className="form-row" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div className="form-field" style={{ flex: 1 }}>
                        <label>{isAdditional ? 'Subsubcategoría' : 'Subsubcategoria'}</label>
                        <select
                            name="subsubcategoria"
                            value={subSubCatId}
                            onChange={handleChangeLocal}
                            disabled={!subCatId}
                            // required={!isAdditional} // Opcional: hacerla obligatoria solo en la principal
                            style={{ width: '100%', padding: '8px' }}
                        >
                            <option value="">Selecciona una subsubcategoría</option>
                            {subCatId && subCatNode?.subcategorias?.map((subsub) => (
                                <option key={subsub.id} value={subsub.id}>{subsub.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {isAdditional && (
                        <div className="form-field" style={{ flex: '0 0 auto' }}>
                            <label style={{ visibility: 'hidden' }}>Acción</label>
                            <button 
                                type="button" 
                                onClick={() => removeAdditionalCategory(catData.id)}
                                className="btn-remove-spec"
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="product-form">
            {/* <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2> */}
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
                            <option value="disponible">Disponible</option>
                            <option value="sin-stock">Sin stock</option>
                            <option value="oculto">Oculto</option>
                            <option value="descontinuado">Descontinuado</option>
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
                            {arbolCategorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subcategoria */}
                    <div className="form-field">
                        <label htmlFor="subcategoria">Subcategoria</label>
                        <select
                            id="subcategoria"
                            name="subcategoria"
                            value={formData.subcategoria}
                            onChange={handleChange}
                            required
                            disabled={!formData.categoria} 
                        >
                            <option value="">Selecciona una subcategoría</option>
                            {arbolCategorias
                                .find((cat) => cat.id == formData.categoria)
                                ?.subcategorias
                                .map((subcategoria) => (
                                    <option key={subcategoria.id} value={subcategoria.id}>
                                        {subcategoria.nombre}
                                    </option>
                            ))}
                        </select>
                    </div>

                    {/* Subsubcategoria */}
                    <div className="form-field">
                        <label htmlFor="subsubcategoria">Subsubcategoria</label>
                        <select
                            id="subsubcategoria"
                            name="subsubcategoria"
                            value={formData.subsubcategoria}
                            onChange={handleChange}
                            //required
                            disabled={!formData.subcategoria} 
                        >
                            <option value="">Selecciona una subcategoría</option>
                            {arbolCategorias
                                .find((cat) => cat.id == formData.categoria)
                                ?.subcategorias
                                .find((subcat) => subcat.id == formData.subcategoria)
                                ?.subcategorias
                                .map((subsubcategoria) => (
                                    <option key={subsubcategoria.id} value={subsubcategoria.id}>
                                        {subsubcategoria.nombre}
                                    </option>
                            ))}
                        </select>
                    </div>

                    {/* Botón Agregar */}
                    <div>
                        <label>(Opcional)</label>
                        <button 
                            type="button" 
                            onClick={addAdditionalCategory} 
                            className="btn-submit"
                            style={{ marginTop: '6px' }}
                        >
                            Agregar categoría
                        </button>
                    </div>
                </div>

                {/* Categorías Adicionales */}
                {additionalCategories.map((group) => {
                    const catNode = findNodeById(group.categoria, arbolCategorias);
                    const subCatNode = group.subcategoria ? findNodeById(group.subcategoria, arbolCategorias) : null;

                    return (
                        <div 
                            key={group.id} 
                            // style={{ marginTop: '20px' }}
                            className="form-row"
                        >
                            <div className="form-field">
                                <label>Categoria Adicional</label>
                                <select
                                    value={group.categoria}
                                    onChange={(e) => updateAdditionalCategory(group.id, 'categoria', e.target.value)}
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {arbolCategorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Subcategoria</label>
                                <select
                                    value={group.subcategoria}
                                    onChange={(e) => updateAdditionalCategory(group.id, 'subcategoria', e.target.value)}
                                    disabled={!group.categoria}
                                >
                                    <option value="">Selecciona una subcategoría</option>
                                    {catNode?.subcategorias?.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Subsubcategoria</label>
                                <div 
                                    style={{ display: 'flex', gap: '10px' }}
                                >
                                    <select
                                        value={group.subsubcategoria}
                                        onChange={(e) => updateAdditionalCategory(group.id, 'subsubcategoria', e.target.value)}
                                        disabled={!group.subcategoria}
                                        // style={{ flex: 1 }}
                                    >
                                        <option value="">Selecciona una subcategoría</option>
                                        {subCatNode?.subcategorias?.map((subsub) => (
                                            <option key={subsub.id} value={subsub.id}>{subsub.nombre}</option>
                                        ))}
                                    </select>
                                    
                                    
                                </div>
                                
                            </div>
                            {/* Botón Eliminar */}
                            <div>
                                <label>Remover</label>
                                <button 
                                    type="button" 
                                    className="btn-submit" 
                                    onClick={() => removeAdditionalCategory(group.id)}
                                    title="Eliminar categoría"
                                    style={{ marginTop: '6px' }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
                

                {/* Specs */}

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
                        {specs.map((spec) => (
                            <div key={spec.id} className="spec-row" >
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
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
                            </div>
                        ))}
                    </div>
                    {errors.specs && <span className="error">{errors.specs}</span>}
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
                <div 
                    style={{ display: 'flex', gap: '10px' }}
                >
                    <input
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                    />
                    <button 
                        type="button" 
                        onClick={handleAddUrl} 
                        className="btn-submit"
                        style={{ width: '140px' }}
                    >
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
                    <br />
                    <br />
                    {onCancel && (
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            disabled={isSubmitting}
                            className="btn-submit"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
                <br />
            </form>
        </section>
    );
};