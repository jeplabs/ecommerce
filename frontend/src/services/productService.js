/**
 * Fachada de compatibilidad: implementación en entities/product/api.
 * @deprecated Preferir `import { productApi } from '@/entities/product'`
 */
export {
    productService,
    productApi,
    getByCategory,
    getAll,
    getAdmin,
    getById,
    getByIdAdmin,
    create,
    update,
    deleteProduct as delete,
    updateStatus,
    addImages,
    getImages,
    deleteImage,
    setMainImage,
} from '@/entities/product/api/productApi';
