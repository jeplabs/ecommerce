import type { CatalogProduct } from '@/features/catalog/model/types';
import {
    mockCatalogProducts,
    mockProduct,
    mockProductAlpha,
    mockProductBeta,
    mockSoldOutProduct,
} from '@/test/msw/fixtures/products';

/** Productos tipados para tests de catálogo (helpers puros). */
export const catalogProductsFixture: CatalogProduct[] = mockCatalogProducts.map((product) => ({
    ...product,
    marca: product.specs?.Marca as string | undefined,
}));

export {
    mockProduct,
    mockProductAlpha,
    mockProductBeta,
    mockSoldOutProduct,
    mockCatalogProducts,
};
