import type { CategoryTreeNode } from '@/features/catalog';
import type { AdminImageApiSource, AdminProductFormImage } from '../../lib/product-image-admin';

export type ProductFormImage = AdminProductFormImage;

export type ProductFormSpec = {
    id: string;
    key: string;
    value: string;
};

export type AdditionalCategoryGroup = {
    id: string;
    categoria: string;
    subcategoria: string;
    subsubcategoria: string;
};

export type ProductFormData = {
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

export type ProductCategoryNode = {
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

export type ProductFormProps = {
    initialData?: ProductFormInitialData | null;
    onSubmit: (payload: ProductFormSubmitPayload, images: AdminProductFormImage[]) => void;
    isSubmitting?: boolean;
    onCancel?: () => void;
    arbolCategorias?: CategoryTreeNode[];
    preserveMissingMetadata?: boolean;
};

export type FormErrors = Partial<Record<keyof ProductFormData | 'images' | 'specs', string | null>>;
