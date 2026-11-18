import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import {
    createClientImageId,
    normalizeApiImageToForm,
    type AdminProductFormImage,
} from '../../../lib/product-image-admin';
import type { CategoryTreeNode } from '@/features/catalog';
import { getCurrencyConfig } from '@/utils/format';
import type {
    ProductFormData,
    FormErrors,
    ProductFormInitialData,
    ProductFormSpec,
    AdditionalCategoryGroup,
    ProductFormSubmitPayload,
} from '../types';

interface UseProductFormStateProps {
    initialData?: ProductFormInitialData | null;
    onSubmit: (payload: ProductFormSubmitPayload, images: AdminProductFormImage[]) => void;
    arbolCategorias?: CategoryTreeNode[];
    preserveMissingMetadata?: boolean;
}

export function useProductFormState({
    initialData = null,
    onSubmit,
    preserveMissingMetadata = false,
}: UseProductFormStateProps) {
    const isEditing = !!initialData;

    const [urlInput, setUrlInput] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [specs, setSpecs] = useState<ProductFormSpec[]>([]);
    const [additionalCategories, setAdditionalCategories] = useState<AdditionalCategoryGroup[]>([]);
    const [imagenesAEliminarIds, setImagenesAEliminarIds] = useState<number[]>([]);
    const [imagenPrincipalId, setImagenPrincipalId] = useState<string | null>(null);

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
        moneda: getCurrencyConfig().codigo || 'GTQ',
        images: [],
    });

    const isZeroDecimalCurrency = formData.moneda === 'CLP' || getCurrencyConfig().decimales === 0;

    // Cargar datos si es edición
    useEffect(() => {
        if (initialData) {
            setImagenesAEliminarIds([]);
            setImagenPrincipalId(null);

            const estadoNormalizado = initialData.estado
                ? initialData.estado.toLowerCase().replace(/_/g, '-')
                : 'disponible';

            const todosLosNodos = initialData.categorias || [];
            const todosLosIds = todosLosNodos.map((n) => n.id);

            const construirRama = (idsDisponibles: number[]): number[] => {
                if (idsDisponibles.length === 0) return [];

                let raiz = todosLosNodos.find((n) => idsDisponibles.includes(n.id) && n.parentId === null);
                if (!raiz) raiz = todosLosNodos.find((n) => idsDisponibles.includes(n.id));
                if (!raiz) return [];

                const rama = [raiz.id];
                const hijo = todosLosNodos.find((n) => n.parentId === raiz.id && idsDisponibles.includes(n.id));
                if (hijo) {
                    rama.push(hijo.id);
                    const nieto = todosLosNodos.find((n) => n.parentId === hijo.id && idsDisponibles.includes(n.id));
                    if (nieto) rama.push(nieto.id);
                }
                return rama;
            };

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
                moneda: initialData.moneda || getCurrencyConfig().codigo || 'GTQ',
                images: [],
            });

            const idsUsados = new Set(ramaPrincipal);
            const idsRestantes = todosLosIds.filter((id) => !idsUsados.has(id));

            const gruposAdicionales: AdditionalCategoryGroup[] = [];
            if (idsRestantes.length > 0) {
                let idsTemp = [...idsRestantes];
                let index = 0;

                while (idsTemp.length > 0) {
                    const rama = construirRama(idsTemp);
                    if (rama.length > 0) {
                        gruposAdicionales.push({
                            id: `edit_cat_${Date.now()}_${index}`,
                            categoria: rama[0]?.toString() || '',
                            subcategoria: rama[1]?.toString() || '',
                            subsubcategoria: rama[2]?.toString() || '',
                        });
                        idsTemp = idsTemp.filter((id) => !rama.includes(id));
                        index++;
                    } else {
                        gruposAdicionales.push({
                            id: `edit_cat_${Date.now()}_${index}`,
                            categoria: idsTemp[0]?.toString() || '',
                            subcategoria: '',
                            subsubcategoria: '',
                        });
                        idsTemp.shift();
                        index++;
                    }
                }
            }

            setAdditionalCategories(gruposAdicionales);

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
        }
    }, [initialData]);

    // Efecto de scroll de errores
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                const firstErrorElement = document.querySelector('[data-field-error]');
                if (firstErrorElement) {
                    const inputAssociated = firstErrorElement.previousElementSibling;
                    if (document.activeElement !== inputAssociated) {
                        firstErrorElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
                        if (inputAssociated) {
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
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Manejador para campos simples
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            if (name === 'categoria') {
                newData.subcategoria = '';
                newData.subsubcategoria = '';
            }

            if (name === 'subcategoria') {
                newData.subsubcategoria = '';
            }

            return newData;
        });

        const fieldName = name as keyof FormErrors;
        if (errors[fieldName]) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: null,
            }));
        }
    };

    // Manejador para URLs de imágenes
    const handleAddUrl = () => {
        if (!urlInput.trim()) return;

        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            setErrors((prev) => ({ ...prev, images: 'La URL debe comenzar con http:// o https://' }));
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

        setFormData((prev) => {
            const isFirstImage = prev.images.length === 0;
            if (isFirstImage) {
                newImage.principal = true;
                setImagenPrincipalId(newImage.id);
            }

            return {
                ...prev,
                images: [...prev.images, newImage],
            };
        });

        setUrlInput('');
        if (errors.images) setErrors((prev) => ({ ...prev, images: null }));
    };

    // Agregar imágenes por URLs directamente (ej. desde Cloudinary uploader)
    const handleAddImageUrls = (urls: string[]) => {
        if (!urls.length) return;

        setFormData((prev) => {
            let principalId = imagenPrincipalId;
            const newImages: AdminProductFormImage[] = urls.map((url, idx) => {
                const imgId = createClientImageId();
                const isFirstEver = prev.images.length === 0 && idx === 0 && !principalId;
                if (isFirstEver) {
                    principalId = imgId;
                    setImagenPrincipalId(imgId);
                }
                return {
                    id: imgId,
                    backendId: null,
                    type: 'url',
                    url: url.trim(),
                    file: null,
                    preview: url.trim(),
                    persisted: false,
                    principal: isFirstEver,
                };
            });

            return {
                ...prev,
                images: [...prev.images, ...newImages],
            };
        });

        if (errors.images) setErrors((prev) => ({ ...prev, images: null }));
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
            const newImages = prev.images.filter((img) => img.id !== idToRemove);

            if (imagenAEliminar?.principal && newImages.length > 0) {
                const imagesUpdated = newImages.map((img, index) => ({
                    ...img,
                    principal: index === 0,
                }));

                const nuevaPrincipal = imagesUpdated[0];
                setImagenPrincipalId(String(nuevaPrincipal.id));

                return {
                    ...prev,
                    images: imagesUpdated,
                };
            }

            if (newImages.length === 0) {
                setImagenPrincipalId(null);
                setErrors((err) => ({ ...err, images: 'Debe seleccionar al menos una imagen del producto' }));
            }

            return {
                ...prev,
                images: newImages,
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

    // Specs
    const addSpec = () => {
        const newSpec = {
            id: `spec_${Date.now()}_${Math.random()}`,
            key: '',
            value: '',
        };
        setSpecs((prev) => [...prev, newSpec]);
    };

    const removeSpec = (idToRemove: string) => {
        setSpecs((prev) => prev.filter((spec) => spec.id !== idToRemove));
    };

    const updateSpec = (id: string, field: 'key' | 'value', newValue: string) => {
        setSpecs((prev) =>
            prev.map((spec) => (spec.id === id ? { ...spec, [field]: newValue } : spec))
        );
    };

    // Categorías Adicionales
    const addAdditionalCategory = () => {
        const newCatGroup = {
            id: `cat_group_${Date.now()}_${Math.random()}`,
            categoria: '',
            subcategoria: '',
            subsubcategoria: '',
        };
        setAdditionalCategories((prev) => [...prev, newCatGroup]);
    };

    const removeAdditionalCategory = (idToRemove: string) => {
        setAdditionalCategories((prev) => prev.filter((cat) => cat.id !== idToRemove));
    };

    const updateAdditionalCategory = (
        id: string,
        field: 'categoria' | 'subcategoria' | 'subsubcategoria',
        newValue: string
    ) => {
        setAdditionalCategories((prev) =>
            prev.map((cat) => {
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
            })
        );
    };

    // Validación
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
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (!sku.trim()) {
            newErrors.sku = 'El SKU es obligatorio';
        }

        if (!preserveMissingMetadata && !descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        }

        if (!price.trim()) {
            newErrors.price = 'El precio es obligatorio';
        } else if (Number.isNaN(Number(price))) {
            newErrors.price = 'El precio debe ser un número mayor a 0';
        } else if (isZeroDecimalCurrency && !Number.isInteger(Number(price))) {
            newErrors.price = 'Para pesos chilenos (CLP) el precio debe ser un número entero sin decimales';
        }

        if (!stock.trim()) {
            newErrors.stock = 'El stock es obligatorio';
        } else if (Number.isNaN(Number(stock))) {
            newErrors.stock = 'El stock debe ser un número mayor a 0';
        }

        if (!estado.trim()) {
            newErrors.estado = 'El estado es obligatorio';
        }

        if (!moneda.trim()) {
            newErrors.moneda = 'La moneda es obligatoria';
        }

        if (!preserveMissingMetadata && !categoria.trim()) {
            newErrors.categoria = 'La categoria es obligatoria';
        }

        if (!preserveMissingMetadata && !subcategoria.trim()) {
            newErrors.subcategoria = 'La subcategoría es obligatoria';
        }

        if (!isEditing && formData.images.length === 0) {
            newErrors.images = 'Debe seleccionar al menos una imagen del producto';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit final
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        const urlsToSave = formData.images.map((img) => img.url);

        if (!isEditing && urlsToSave.length === 0) {
            setErrors((prev) => ({ ...prev, images: 'Debe haber al menos una imagen en formato URL.' }));
            return;
        }

        const specsObject: Record<string, string> = {};
        specs.forEach((spec) => {
            if (spec.key && spec.value && spec.key.trim() !== '') {
                specsObject[spec.key] = spec.value;
            }
        });

        const allCategoryIds = new Set<number>();

        if (formData.categoria) allCategoryIds.add(Number(formData.categoria));
        if (formData.subcategoria) allCategoryIds.add(Number(formData.subcategoria));
        if (formData.subsubcategoria) allCategoryIds.add(Number(formData.subsubcategoria));

        additionalCategories.forEach((group) => {
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
                moneda: formData.moneda || getCurrencyConfig().codigo || 'GTQ',
            },
            categoriaIds: Array.from(allCategoryIds),
            imagenesUrl: urlsToSave.length > 0 ? urlsToSave : null,
            imagenesAEliminarIds: imagenesAEliminarIds.length > 0 ? imagenesAEliminarIds : null,
            imagenPrincipalId: finalImagenPrincipalId,
        };

        onSubmit(finalData, formData.images);
    };

    return {
        formData,
        errors,
        isEditing,
        isZeroDecimalCurrency,
        urlInput,
        setUrlInput,
        specs,
        additionalCategories,
        handleChange,
        handleSubmit,
        addSpec,
        removeSpec,
        updateSpec,
        addAdditionalCategory,
        removeAdditionalCategory,
        updateAdditionalCategory,
        handleAddUrl,
        handleAddImageUrls,
        removeImage,
        handleSetPrincipal,
    };
}
