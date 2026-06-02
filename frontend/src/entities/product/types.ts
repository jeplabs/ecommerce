import { z } from 'zod';
import {
    productSchema,
    productStatusSchema,
    createProductSchema,
    updateProductSchema,
} from './schema';

// Tipos principales inferidos de Zod para el producto y sus operaciones relacionadas
export type Product = z.infer<typeof productSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Tipos para Componentes UI (Props)
export type ProductCardProps = {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    image: string;
    description: string;
    status?: ProductStatus;
    onAddToCart?: (id: string) => void;
};

export type ProductListProps = {
    products: Product[];
    onAddToCart?: (id: string) => void;
};

export type ProductDetailProps = {
    product: Product;
    isLoading: boolean;
    onAddToCart?: (quantity: number) => void;
};

// Tipos para Lógica de Negocio y API
export type ProductFilters = {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: ProductStatus;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'name';
};

export type ProductAPIResponse = {
    products: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
};