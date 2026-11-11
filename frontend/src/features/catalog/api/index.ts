import { getCatalogo, invalidateCatalogoCache } from './catalogApi';
import { getById, getBySlug, getAll, getByCategory } from './productsApi';
import {
    getAdminPage,
    getAdmin,
    getByIdAdmin,
    create,
    update,
    deleteProduct,
    updateStatus,
    addImages,
    getImages,
    deleteImage,
    setMainImage,
} from './productsAdminApi';
import { categoriesApi } from './categoriesApi';

export { catalogApi, getCatalogo, invalidateCatalogoCache } from './catalogApi';
export {
    productsApi,
    getById,
    getBySlug,
    getAll,
    getByCategory,
    getAll as getAllProducts,
} from './productsApi';
export {
    productsAdminApi,
    getAdminPage,
    getAdmin,
    getByIdAdmin,
    create,
    update,
    deleteProduct,
    updateStatus,
    addImages,
    getImages,
    deleteImage,
    setMainImage,
    create as createProduct,
    update as updateProduct,
    type AdminProductsQueryParams,
} from './productsAdminApi';
export {
    categoriesApi,
    getAll as getAllCategories,
    create as createCategory,
} from './categoriesApi';

/** Objeto consolidado para retrocompatibilidad 100% con consumidores que esperan productApi.* */
export const productApi = {
    getCatalogo,
    invalidateCatalogoCache,
    getById,
    getBySlug,
    getAll,
    getByCategory,
    getAdminPage,
    getAdmin,
    getByIdAdmin,
    create,
    update,
    delete: deleteProduct,
    deleteProduct,
    updateStatus,
    addImages,
    getImages,
    deleteImage,
    setMainImage,
};

export const categoryApi = categoriesApi;
