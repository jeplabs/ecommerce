export type {
    ProductApi,
    ProductAdminApi,
    ProductImageApi,
    ProductStatus,
    CreateProductRequest,
    UpdateProductRequest,
    UpdateProductStatusRequest,
    AddProductImagesRequest,
    ProductAdminFormValues,
    ProductPage,
    ProductAdminPage,
    ProductCardView,
    ProductDetailView,
    ProductListFilters,
} from './model/types';

export {
    productStatusSchema,
    productApiSchema,
    productAdminApiSchema,
    productImageApiSchema,
    productPageSchema,
    productAdminPageSchema,
    createProductRequestSchema,
    updateProductRequestSchema,
    updateProductStatusRequestSchema,
    addProductImagesRequestSchema,
    productAdminFormSchema,
    mapProductAdminFormToCreateRequest,
} from './model/types';

export {
    mapProductApiToCard,
    mapProductApiToDetail,
    getProductMainImageUrl,
} from './model/mappers';
