import { useState, useEffect, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import {
    createClientImageId,
    normalizeApiImageToForm,
} from '@/features/admin/lib/product-image-admin';
import type { AdminImageApiSource, AdminProductFormImage } from '@/features/admin/lib/product-image-admin';
import type { CategoryTreeNode } from '@/entities/category';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form/Form';
import { FieldError, FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import styles from './ProductForm.module.css';

type ProductFormImage = AdminProductFormImage;

type ProductFormSpec = {
    id: string;
    key: string;
    value: string;
};

type AdditionalCategoryGroup = {
    id: string;
    categoria: string;
    subcategoria: string;
    subsubcategoria: string;
};

type ProductFormData = {
    nombre: string;
    sku: string;
    descripcion: string;
    price: string;
    stock: string;
    estado: string;
    categoria: string;
    subcategoria: string;
    subsubcategoria: string;
    moneda: string;
    images: ProductFormImage[];
};

type ProductCategoryNode = {
    id: number;
    parentId?: number | null;
};

/** Datos transformados para edición (shape distinto a ProductAdminApi en el widget). */
export type ProductFormInitialData = {
    nombre?: string;
    sku?: string;
    descripcion?: string;
    price?: string | number;
    stock?: string | number;
    estado?: string;
    moneda?: string;
    categorias?: ProductCategoryNode[];
    specs?: Record<string, string>;
    images?: AdminImageApiSource[];
};

export type ProductFormSubmitPayload = {
    sku: string;
    nombre: string;
    descripcion: string | null;
    specs: Record<string, string> | null;
    stock: number;
    estado: string;
    precio: {
        precioVenta: number;
        precioCosto: number;
        moneda: string;
    };
    categoriaIds: number[];
    imagenesUrl: string[] | null;
    imagenesAEliminarIds: number[] | null;
    imagenPrincipalId: string | number | null;
};

type ProductFormProps = {
    initialData?: ProductFormInitialData | null;
    onSubmit: (payload: ProductFormSubmitPayload, images: AdminProductFormImage[]) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    arbolCategorias?: CategoryTreeNode[];
};

type FormErrors = Partial<Record<keyof ProductFormData | 'images' | 'specs', string | null>>;

export const ProductForm = ({
    initialData = null,
    onSubmit,
    isSubmitting = false,
    onCancel,
    arbolCategorias = [],
}: ProductFormProps) => {
    //Datos iniciales del formulario (si es edición)
    const isEditing = !!initialData; 

    //console.log(subcategorias)
    // Estado para manejar el input de URL 
    const [urlInput, setUrlInput] = useState('');

    // Estado para el mensaje de error
    const [errors, setErrors] = useState<FormErrors>({});

    // Estado para las características dinámicas (Array de objetos)
    const [specs, setSpecs] = useState<ProductFormSpec[]>([]);

    // Estado para categorías adicionales
    const [additionalCategories, setAdditionalCategories] = useState<AdditionalCategoryGroup[]>([]);

    // Para rastrear qué IDs de imágenes originales se eliminaron en esta sesión
    const [imagenesAEliminarIds, setImagenesAEliminarIds] = useState<number[]>([]);
    
    // Para guardar el ID de la imagen que el usuario marca como principal
    const [imagenPrincipalId, setImagenPrincipalId] = useState<string | null>(null);

    //  Estado para los campos del formulario
    const [formData, setFormData] = useState<ProductFormData>({
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

            //console.log('🔍 DEBUG BACKEND - initialData completo:', initialData);
            //console.log('🖼️ DEBUG IMÁGENES - initialData.images:', initialData.images);
            
            // console.log(initialData)
            setImagenesAEliminarIds([]); 
            setImagenPrincipalId(null);

            const estadoNormalizado = initialData.estado
                ? initialData.estado.toLowerCase().replace(/_/g, '-')
                : 'disponible';
            
                // 1. Obtener todos los IDs de categorías disponibles
            // Usamos el array 'categorias' que envía el backend
            const todosLosNodos = initialData.categorias || [];
            const todosLosIds = todosLosNodos.map(n => n.id);

            // 2. Función auxiliar para ordenar una rama jerárquica (Padre -> Hijo -> Nieto)
            const construirRama = (idsDisponibles: number[]): number[] => {
                if (idsDisponibles.length === 0) return [];
                
                // Buscar el nodo raíz (el que tiene parentId null)
                let raiz = todosLosNodos.find(n => idsDisponibles.includes(n.id) && n.parentId === null);
                
                // Si no hay raíz explícita (ej. todo son subcategorías), tomamos el primero disponible como base
                if (!raiz) raiz = todosLosNodos.find(n => idsDisponibles.includes(n.id));
                if (!raiz) return [];

                const rama = [raiz.id];

                // Buscar hijo
                const hijo = todosLosNodos.find(n => n.parentId === raiz.id && idsDisponibles.includes(n.id));
                if (hijo) {
                    rama.push(hijo.id);
                    // Buscar nieto
                    const nieto = todosLosNodos.find(n => n.parentId === hijo.id && idsDisponibles.includes(n.id));
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
                price: String(initialData.price ?? ''),
                stock: String(initialData.stock ?? ''),
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

            const gruposAdicionales: AdditionalCategoryGroup[] = [];
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

            if (initialData.specs && Object.keys(initialData.specs).length > 0) {
                const specsArray = Object.entries(initialData.specs).map(([k, v], idx) => ({
                    id: `spec_${Date.now()}_${idx}`,
                    key: k,
                    value: v,
                }));
                setSpecs(specsArray);
            } else {
                setSpecs([]);
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
                const loadedImages = initialData.images.map((img, index) =>
                    normalizeApiImageToForm(img, index)
                );
                const principalImg =
                    loadedImages.find((i) => i.principal) || loadedImages[0];
                if (principalImg) {
                    setImagenPrincipalId(principalImg.id);
                }
                setFormData((prev) => ({ ...prev, images: loadedImages }));

            }

            // setSpecs(initialData.specs || {})
        }
    }, [initialData]);

    // Efecto de scroll de errores
    useEffect(() => {
        // Si hay al menos un error en el objeto...
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
            const firstErrorElement = document.querySelector('[data-field-error]');
            
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
                        const active = document.activeElement;
                        if (
                            active &&
                            active.tagName !== 'INPUT' &&
                            active.tagName !== 'TEXTAREA' &&
                            inputAssociated instanceof HTMLElement
                        ) {
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
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        const fieldName = name as keyof FormErrors;
        if (errors[fieldName]) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: null,
            }));
        }
    };

    // Manejador para URLS
    const handleAddUrl = () => {
        if (!urlInput.trim()) return;
        
        // Validación básica de URL
        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            setErrors(prev => ({ ...prev, images: 'La URL debe comenzar con http:// o https://' }));
            return;
        }

        const newImage: AdminProductFormImage = {
            id: createClientImageId(),
            backendId: null,
            type: 'url',
            url: urlInput.trim(),
            file: null,
            preview: urlInput.trim(),
            persisted: false,
            principal: false,
        };

        // setFormData(prev => ({
        //     ...prev,
        //     images: [...prev.images, newImage]
        // }));

        setFormData(prev => {
            // Si es la PRIMERA imagen que se agrega, la hacemos principal automáticamente
            const isFirstImage = prev.images.length === 0;
            if (isFirstImage) {
                newImage.principal = true;
                setImagenPrincipalId(newImage.id);
            }

            return {
                ...prev,
                images: [...prev.images, newImage]
            };
        });
        
        setUrlInput(''); // Limpiar input
        if (errors.images) setErrors(prev => ({ ...prev, images: null }));
    };

    const removeImage = (idToRemove: string | number) => {
        const isConfirmed = window.confirm('¿Estás seguro de que deseas eliminar esta imagen?');
        if (!isConfirmed) return;

        const imagenPrev = formData.images.find((img) => img.id === idToRemove);
        if (imagenPrev?.persisted && imagenPrev.principal) {
            const otrasPersistidas = formData.images.filter(
                (img) => img.id !== idToRemove && img.persisted
            );
            if (otrasPersistidas.length === 0) {
                window.alert(
                    'No puedes eliminar la única imagen guardada. Agrega otra y márcala como principal primero.'
                );
                return;
            }
            window.alert(
                'Esta imagen es la principal en el servidor. Marca otra como principal (★) antes de eliminarla.'
            );
            return;
        }

        setFormData((prev) => {
            const imagenAEliminar = prev.images.find((img) => img.id === idToRemove);

            if (imagenAEliminar?.persisted && imagenAEliminar.backendId != null) {
                const backendId = imagenAEliminar.backendId;
                setImagenesAEliminarIds((prevIds) => {
                    if (prevIds.includes(backendId)) return prevIds;
                    return [...prevIds, backendId];
                });
            }
            const newImages = prev.images.filter(img => img.id !== idToRemove);
            
            // if (newImages.length === 0) {
            //     setErrors(err => ({ ...err, images: 'Debe seleccionar al menos una imagen del producto' }));
            // }

            // // Si eliminamos la que era principal, limpiamos la selección
            // if (imagenPrincipalId === idToRemove) {
            //     setImagenPrincipalId(null);
            // }

        //     if (imagenAEliminar?.principal && newImages.length > 0) {
        //         // Marcamos la primera de la lista como principal visualmente
        //         newImages[0].principal = true;
        //         // Actualizamos el ID de referencia
        //         setImagenPrincipalId(newImages[0].backendId || newImages[0].id);
        //     } else if (newImages.length === 0) {
        //         // Si no quedan imágenes, limpiamos todo
        //         setImagenPrincipalId(null);
        //         setErrors(err => ({ ...err, images: 'Debe seleccionar al menos una imagen del producto' }));
        //     }

        //     return { 
        //         ...prev, 
        //         images: newImages 
        //     };
        // });

        // if (formData.images.length === 1)
        //     setErrors(prev => ({ 
        //         ...prev, 
        //         images: "Debe seleccionar al menos una imagen del producto" 
        // }));
            if (imagenAEliminar?.principal && newImages.length > 0) {
                const imagesUpdated = newImages.map((img, index) => ({
                    ...img,
                    principal: index === 0,
                }));

                // Actualizamos el ID de referencia
                const nuevaPrincipal = imagesUpdated[0];
                setImagenPrincipalId(String(nuevaPrincipal.id));

                return {
                    ...prev,
                    images: imagesUpdated
                };
            } 
            
            // Si no había principal o no quedan imágenes
            if (newImages.length === 0) {
                setImagenPrincipalId(null);
                setErrors(err => ({ ...err, images: 'Debe seleccionar al menos una imagen del producto' }));
            }

            return { 
                ...prev, 
                images: newImages 
            };
        });
    };

    const handleSetPrincipal = (clientId: string) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img) => ({
                ...img,
                principal: img.id === clientId,
            })),
        }));
        setImagenPrincipalId(clientId);
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

    const removeSpec = (idToRemove: string) => {
        setSpecs(prev => prev.filter(spec => spec.id !== idToRemove));
    };

    const updateSpec = (id: string, field: 'key' | 'value', newValue: string) => {
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

    const removeAdditionalCategory = (idToRemove: string) => {
        setAdditionalCategories(prev => prev.filter(cat => cat.id !== idToRemove));
    };

    const updateAdditionalCategory = (
        id: string,
        field: 'categoria' | 'subcategoria' | 'subsubcategoria',
        newValue: string
    ) => {
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
        const newErrors: FormErrors = {};

        const nombre = (formData.nombre ?? '').toString();
        const sku = (formData.sku ?? '').toString();
        const descripcion = (formData.descripcion ?? '').toString();
        const price = (formData.price ?? '').toString();
        const stock = (formData.stock ?? '').toString();
        const estado = (formData.estado ?? '').toString();
        const moneda = (formData.moneda ?? '').toString();
        const categoria = (formData.categoria ?? '').toString();
        const subcategoria = (formData.subcategoria ?? '').toString();
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
        } else if (Number.isNaN(Number(price))) {
            newErrors.price = "El precio debe ser un número mayor a 0";
        }

        if (!stock.trim()) {
            newErrors.stock = "El stock es obligatorio";
        } else if (Number.isNaN(Number(stock))) {
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
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Ejecutar validación antes de proceder
        if (!validateForm()) return;

        const urlsToSave = formData.images.map((img) => img.url);

        // En creación: obligar al menos una imagen
        // En edición: permitir no cambiar imágenes
        if (!isEditing && urlsToSave.length === 0) {
            setErrors(prev => ({ ...prev, images: 'Debe haber al menos una imagen en formato URL.'}));
            return;
        }

        // Combinar formData con specs procesados y esquema que exige el backend
        const specsObject: Record<string, string> = {};
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

        const allCategoryIds = new Set<number>();

        if (formData.categoria) allCategoryIds.add(Number(formData.categoria));
        if (formData.subcategoria) allCategoryIds.add(Number(formData.subcategoria));
        if (formData.subsubcategoria) allCategoryIds.add(Number(formData.subsubcategoria));

        additionalCategories.forEach(group => {
            if (group.categoria) allCategoryIds.add(Number(group.categoria));
            if (group.subcategoria) allCategoryIds.add(Number(group.subcategoria));
            if (group.subsubcategoria) allCategoryIds.add(Number(group.subsubcategoria));
        });

        const principalImg =
            formData.images.find((img) => img.id === imagenPrincipalId) ||
            formData.images.find((img) => img.principal);

        let finalImagenPrincipalId = principalImg?.id ?? imagenPrincipalId;

        if (!finalImagenPrincipalId && formData.images.length > 0) {
            finalImagenPrincipalId = formData.images[0].id;
        }

        const finalData: ProductFormSubmitPayload = {
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
            imagenesUrl: urlsToSave.length > 0 ? urlsToSave : null,
            // Lista de IDs a eliminar en el backend
            imagenesAEliminarIds: imagenesAEliminarIds.length > 0 ? imagenesAEliminarIds : null,
            // ID de la nueva imagen principal (si cambió)
            //imagenPrincipalId: imagenPrincipalId
            imagenPrincipalId: finalImagenPrincipalId
        };

        //console.debug('ProductForm submit finalData', finalData);
        //onSubmit(finalData);
        onSubmit(
            finalData,
            formData.images
        );
    };

    // Helper para encontrar nodos en el árbol
    const findNodeById = (id: string | number, tree: CategoryTreeNode[]): CategoryTreeNode | null => {
        for (const node of tree) {
            if (node.id == id) return node;
            if (node.subcategorias) {
                const found = findNodeById(id, node.subcategorias);
                if (found) return found;
            }
        }
        return null;
    };

    return (
        <section className={styles.productForm}>
            {/* <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2> */}
            {/* <br /> */}
            <Form variant="wide" onSubmit={handleSubmit} noValidate>

                <FormField label="Nombre" htmlFor="nombre" error={errors.nombre}>
                    <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre del producto"
                        required
                        invalid={!!errors.nombre}
                    />
                </FormField>

                <FormField label="SKU" htmlFor="sku" error={errors.sku}>
                    <Input
                        type="text"
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="SKU del producto"
                        disabled={isEditing}
                        required
                        invalid={!!errors.sku}
                    />
                </FormField>

                <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion}>
                    <Textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción del producto"
                        required
                        invalid={!!errors.descripcion}
                    />
                </FormField>
                
                {/* Campos de precio y stock */}
                <div className={styles.formRow}>
                        
                    <FormField label="Precio" htmlFor="price" error={errors.price}>
                        <Input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                if (Number(input.value) < 0) {
                                    input.value = '';
                                }
                            }}
                            placeholder="0.00"
                            required
                            invalid={!!errors.price}
                        />
                    </FormField>

                    <FormField label="Moneda" htmlFor="moneda">
                        <Select
                            id="moneda"
                            name="moneda"
                            value={formData.moneda}
                            onChange={handleChange}
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="ARS">ARS</option>
                        </Select>
                    </FormField>

                    <FormField label="Stock" htmlFor="stock" error={errors.stock}>
                        <Input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                            required
                            invalid={!!errors.stock}
                        />
                    </FormField>

                    <FormField label="Estado" htmlFor="estado">
                        <Select
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
                        </Select>
                    </FormField>

                    <FormField label="Categoria" htmlFor="categoria">
                        <Select
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
                        </Select>
                    </FormField>

                    <FormField label="Subcategoria" htmlFor="subcategoria">
                        <Select
                            id="subcategoria"
                            name="subcategoria"
                            value={formData.subcategoria}
                            onChange={handleChange}
                            required
                            disabled={!formData.categoria}
                        >
                            <option value="">Selecciona una subcategoría</option>
                            {arbolCategorias
                                .find((cat) => String(cat.id) === formData.categoria)
                                ?.subcategorias
                                .map((subcategoria) => (
                                    <option key={subcategoria.id} value={subcategoria.id}>
                                        {subcategoria.nombre}
                                    </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Subsubcategoria" htmlFor="subsubcategoria">
                        <Select
                            id="subsubcategoria"
                            name="subsubcategoria"
                            value={formData.subsubcategoria}
                            onChange={handleChange}
                            disabled={!formData.subcategoria}
                        >
                            <option value="">Selecciona una subcategoría</option>
                            {arbolCategorias
                                .find((cat) => String(cat.id) === formData.categoria)
                                ?.subcategorias
                                .find((subcat) => String(subcat.id) === formData.subcategoria)
                                ?.subcategorias
                                .map((subsubcategoria) => (
                                    <option key={subsubcategoria.id} value={subsubcategoria.id}>
                                        {subsubcategoria.nombre}
                                    </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="(Opcional)">
                        <Button
                            type="button"
                            variant="primary"
                            onClick={addAdditionalCategory}
                            style={{ marginTop: '6px' }}
                        >
                            Agregar categoría
                        </Button>
                    </FormField>
                </div>

                {/* Categorías Adicionales */}
                {additionalCategories.map((group) => {
                    const catNode = findNodeById(group.categoria, arbolCategorias);
                    const subCatNode = group.subcategoria ? findNodeById(group.subcategoria, arbolCategorias) : null;

                    return (
                        <div 
                            key={group.id} 
                            // style={{ marginTop: '20px' }}
                            className={styles.formRow}
                        >
                            <FormField label="Categoria Adicional">
                                <Select
                                    value={group.categoria}
                                    onChange={(e) => updateAdditionalCategory(group.id, 'categoria', e.target.value)}
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {arbolCategorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </Select>
                            </FormField>

                            <FormField label="Subcategoria">
                                <Select
                                    value={group.subcategoria}
                                    onChange={(e) => updateAdditionalCategory(group.id, 'subcategoria', e.target.value)}
                                    disabled={!group.categoria}
                                >
                                    <option value="">Selecciona una subcategoría</option>
                                    {catNode?.subcategorias?.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                                    ))}
                                </Select>
                            </FormField>

                            <FormField label="Subsubcategoria">
                                <Select
                                    value={group.subsubcategoria}
                                    onChange={(e) => updateAdditionalCategory(group.id, 'subsubcategoria', e.target.value)}
                                    disabled={!group.subcategoria}
                                >
                                    <option value="">Selecciona una subcategoría</option>
                                    {subCatNode?.subcategorias?.map((subsub) => (
                                        <option key={subsub.id} value={subsub.id}>{subsub.nombre}</option>
                                    ))}
                                </Select>
                            </FormField>

                            <FormField label="Remover">
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => removeAdditionalCategory(group.id)}
                                    title="Eliminar categoría"
                                    style={{ marginTop: '6px' }}
                                >
                                    Eliminar
                                </Button>
                            </FormField>
                        </div>
                    );
                })}
                

                {/* Specs */}

                <div className={styles.specsSection}>
                    <div className={styles.specsHeader}>
                        <span className={styles.specsTitle}>Características / Especificaciones</span>
                        <button
                            type="button"
                            className={styles.btnAddSpec}
                            onClick={addSpec}
                            title="Agregar característica"
                        >
                            + Agregar
                        </button>
                    </div>

                    <div className={styles.specsList}>
                        {specs.map((spec) => (
                            <div key={spec.id} className={styles.specRow}>
                                <Input
                                    type="text"
                                    placeholder="Clave (ej. Color)"
                                    value={spec.key}
                                    onChange={(e) => updateSpec(spec.id, 'key', e.target.value)}
                                    className={styles.specKey}
                                />
                                <Input
                                    type="text"
                                    placeholder="Valor (ej. Rojo)"
                                    value={spec.value}
                                    onChange={(e) => updateSpec(spec.id, 'value', e.target.value)}
                                    className={styles.specValue}
                                />
                                <button
                                    type="button"
                                    className={styles.btnRemoveSpec}
                                    onClick={() => removeSpec(spec.id)}
                                    title="Eliminar fila"
                                    aria-label="Eliminar característica"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors.specs && <FieldError>{errors.specs}</FieldError>}
                    <p className={styles.fieldHelp}>Agrega pares clave-valor para detallar el producto.</p>
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
                    <Input
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        style={{ flex: 1 }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                    />
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleAddUrl}
                        style={{ width: '140px' }}
                    >
                        Agregar URL
                    </Button>
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

                {errors.images && <FieldError>{errors.images}</FieldError>}

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
                            <div key={img.id} style={{ position: 'relative' }}>
                                {/* Imagen */}
                                <img 
                                    src={img.preview} 
                                    alt="Vista previa"
                                    style={{ 
                                        width: '100%', 
                                        aspectRatio: '1/1', 
                                        objectFit: 'cover', 
                                        borderRadius: '8px',
                                       // Borde verde si es la principal
                                        border: img.principal
                                            ? '3px solid #10b981'
                                            : '1px solid var(--border, rgba(255,255,255,0.1))',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                />

                                {/* Etiqueta de Principal (Opcional) */}
                                {img.principal && (
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: '#10b981',
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold'
                                    }}>
                                        PRINCIPAL
                                    </span>
                                )}
                                
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
                                    onMouseOver={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                    onMouseOut={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    aria-label="Eliminar imagen"
                                >
                                    &times;
                                </button>

                                {/* --- NUEVO BOTÓN: ESTABLECER PRINCIPAL --- */}
                                {!img.principal && (
                                    <button
                                        type="button"
                                        onClick={() => handleSetPrincipal(String(img.id))}
                                        title="Marcar como principal"
                                        style={{
                                            position: 'absolute',
                                            bottom: '-6px',
                                            right: '-6px',
                                            background: '#3b82f6', // Azul
                                            color: 'white',
                                            border: '2px solid #1a2235',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            zIndex: 10
                                        }}
                                    >
                                        ★
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {/* Botón de enviar */}
                {/* <button type="submit" className="btn-submit">Agregar producto</button>
                <br /> */}
                {/* Botones */}
                <div className={styles.actions}>
                    <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Agregar Producto')}
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
                <br />
            </Form>
        </section>
    );
};