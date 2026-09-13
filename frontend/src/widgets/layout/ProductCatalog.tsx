import { useProduct, useAuth, useCart, useToast } from '@/app/providers';
import { useMemo, useCallback, useEffect } from 'react';
import { ProductCard } from '@/shared/ui/Card/ProductCard';
import { Pagination } from '@/shared/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMainProductImageUrl } from '@/entities/product';
import type {
    CatalogProduct,
    CatalogFiltros,
    CatalogSortOrder,
} from '@/features/catalog/model/types';
import { ProductFilters } from '@/features/catalog/ui/ProductFilters/ProductFilters';
import { SortSelector } from '@/shared/ui/SortSelector/SortSelector';
import {
    extractFilterFacets,
    applyProductFilters,
    createDefaultFiltros,
    mergeFiltrosWithFacets,
} from '@/features/catalog/lib/filter-facets';
import {
    getPersistedSortParam,
    getEffectiveSortOrder,
    parseFiltrosFromParams,
    buildCatalogSearchParams,
    isFiltrosDefault,
    getPageParam,
} from '@/features/catalog/lib/catalog-query-params';
import { sortCatalogProducts } from '@/features/catalog/lib/sort-catalog-products';
import styles from './ProductCatalog.module.css';

const PAGE_SIZE = 12;

type ProductCatalogProps = {
    productosExternos?: CatalogProduct[] | null;
    loadingExterno?: boolean;
};

export const ProductCatalog = ({
    productosExternos = null,
    loadingExterno = false,
}: ProductCatalogProps) => {
    const { productos: productosContexto, loading: loadingContexto } = useProduct();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const sortSelectValue = useMemo(
        () => getPersistedSortParam(searchParams) ?? '',
        [searchParams]
    );
    const effectiveSort = useMemo(() => getEffectiveSortOrder(searchParams), [searchParams]);
    const searchTerm = searchParams.get('search') || '';

    const productosAUsar =
        productosExternos !== null ? productosExternos : (productosContexto as CatalogProduct[]);
    const loadingAUsar = productosExternos !== null ? loadingExterno : loadingContexto;

    const opciones = useMemo(
        () => extractFilterFacets(productosAUsar || []),
        [productosAUsar]
    );

    const defaultFiltros = useMemo(() => createDefaultFiltros(opciones), [opciones]);

    const filtrosActivos = useMemo(
        () => parseFiltrosFromParams(searchParams, opciones),
        [searchParams, opciones]
    );

    const filtrosParaUi = useMemo(
        () => mergeFiltrosWithFacets(filtrosActivos ?? defaultFiltros, opciones),
        [filtrosActivos, defaultFiltros, opciones]
    );

    const rawPage = useMemo(() => getPageParam(searchParams), [searchParams]);

    const handleFilterChange = useCallback(
        (nextFiltros: CatalogFiltros) => {
            const merged = mergeFiltrosWithFacets(nextFiltros, opciones);
            const forUrl = isFiltrosDefault(merged, opciones) ? null : merged;
            const params = buildCatalogSearchParams(searchParams, {
                filtros: forUrl,
                sort: getPersistedSortParam(searchParams),
                opciones,
            });
            setSearchParams(params, { replace: false });
        },
        [searchParams, setSearchParams, opciones]
    );

    const handleSortChange = useCallback(
        (sort: CatalogSortOrder | '') => {
            const sortForUrl = sort === '' ? null : sort;
            const params = buildCatalogSearchParams(searchParams, {
                filtros: filtrosActivos,
                sort: sortForUrl,
                opciones,
            });
            setSearchParams(params, { replace: false });
        },
        [searchParams, setSearchParams, filtrosActivos, opciones]
    );

    const handlePageChange = useCallback(
        (page: number) => {
            const params = buildCatalogSearchParams(searchParams, {
                filtros: filtrosActivos,
                sort: getPersistedSortParam(searchParams),
                page,
                opciones,
            });
            setSearchParams(params, { replace: false });
        },
        [searchParams, setSearchParams, filtrosActivos, opciones]
    );

    const handleAddProductToCart = async (productoId: number, nombre: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const result = await addToCart(productoId, 1);
        if (result.success) {
            showSuccess(`${nombre} agregado al carrito`);
        } else {
            showError(result.error || 'No se pudo agregar el producto');
        }
    };

    const productosFiltrados = useMemo(
        () => applyProductFilters(productosAUsar, filtrosActivos, searchTerm),
        [productosAUsar, filtrosActivos, searchTerm]
    );

    const listaOrdenada = useMemo(
        () => sortCatalogProducts(productosFiltrados, effectiveSort),
        [productosFiltrados, effectiveSort]
    );

    const isExternal = productosExternos !== null;
    const totalPaginas = useMemo(
        () => Math.max(1, Math.ceil(listaOrdenada.length / PAGE_SIZE)),
        [listaOrdenada.length]
    );
    const paginaActual = useMemo(
        () => Math.min(Math.max(1, rawPage), totalPaginas),
        [rawPage, totalPaginas]
    );

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [paginaActual]);

    const productosMostrados = useMemo(() => {
        if (isExternal) return listaOrdenada;
        const startIndex = (paginaActual - 1) * PAGE_SIZE;
        return listaOrdenada.slice(startIndex, startIndex + PAGE_SIZE);
    }, [isExternal, listaOrdenada, paginaActual]);

    if (loadingAUsar) {
        return <p className="center-message">Cargando productos...</p>;
    }

    if (!productosAUsar || productosAUsar.length === 0) {
        return <p className="center-message">No hay productos disponibles en esta sección.</p>;
    }

    return (
        <section className={styles.catalog} aria-label="Catálogo de productos">
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <ProductFilters
                        productos={productosAUsar}
                        filtros={filtrosParaUi}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className={styles.content}>
                    <header className={styles.toolbar}>
                        <h2 className={styles.title}>Productos ({listaOrdenada.length})</h2>
                        <SortSelector sortOption={sortSelectValue} onChange={handleSortChange} />
                    </header>

                    {searchTerm.trim() && (
                        <p className={styles.searchHint}>
                            Resultados para: &ldquo;{searchTerm.trim()}&rdquo;
                        </p>
                    )}

                    {listaOrdenada.length === 0 ? (
                        <p className="center-message">No hay productos que coincidan con los filtros.</p>
                    ) : (
                        <>
                            <ul className={styles.productGrid}>
                                {productosMostrados.map((producto) => (
                                    <li key={producto.id} className={styles.productGridItem}>
                                        <ProductCard
                                            imageSrc={getMainProductImageUrl(producto)}
                                            altText={producto.nombre}
                                            title={producto.nombre}
                                            description={producto.descripcion}
                                            price={producto.precioVenta}
                                            stock={producto.stock}
                                            actionLabel="Ver producto"
                                            onAction={() =>
                                                navigate(`/producto/${producto.slug || producto.id}`)
                                            }
                                            onAddToCart={() =>
                                                handleAddProductToCart(producto.id, producto.nombre)
                                            }
                                            addLabel="Agregar"
                                        />
                                    </li>
                                ))}
                            </ul>

                            {!isExternal && totalPaginas > 1 && (
                                <Pagination
                                    currentPage={paginaActual}
                                    totalPages={totalPaginas}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
