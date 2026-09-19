import { useAuth, useCart, useToast } from '@/app/providers';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ProductCard } from '@/shared/ui/Card/ProductCard';
import { Pagination } from '@/shared/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMainProductImageUrl, productApi } from '@/entities/product';
import type {
    CatalogProduct,
    CatalogFiltros,
    CatalogSortOrder,
    SpecFacetOption,
} from '@/features/catalog/model/types';
import { ProductFilters } from '@/features/catalog/ui/ProductFilters/ProductFilters';
import { SortSelector } from '@/shared/ui/SortSelector/SortSelector';
import {
    extractFilterFacets,
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

type ProductCatalogProps = {
    productosExternos?: CatalogProduct[] | null;
    facetsExternas?: Record<string, SpecFacetOption[]> | null;
    loadingExterno?: boolean;
    totalPaginasExterno?: number;
};

export const ProductCatalog = ({
    productosExternos = null,
    facetsExternas = null,
    loadingExterno = false,
    totalPaginasExterno,
}: ProductCatalogProps) => {
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [serverData, setServerData] = useState<{
        content: CatalogProduct[];
        facets?: Record<string, SpecFacetOption[]>;
        totalPages: number;
        totalElements: number;
    } | null>(null);
    const [loadingServer, setLoadingServer] = useState<boolean>(productosExternos === null);

    useEffect(() => {
        if (productosExternos !== null) return undefined;

        let isMounted = true;
        setLoadingServer(true);

        const queryParams = new URLSearchParams(searchParams);
        const rawPage = queryParams.get('page');
        const pageNum = rawPage ? Math.max(1, Number(rawPage)) : 1;
        queryParams.set('page', String(pageNum - 1));
        if (!queryParams.has('size')) {
            queryParams.set('size', '12');
        }

        productApi.getCatalogo(queryParams)
            .then((data) => {
                if (!isMounted) return;
                setServerData({
                    content: (data.content || []) as CatalogProduct[],
                    facets: data.facets as Record<string, SpecFacetOption[]> | undefined,
                    totalPages: data.totalPages ?? 1,
                    totalElements: data.totalElements ?? 0,
                });
            })
            .catch((err) => {
                console.error('Error al cargar catálogo del servidor:', err);
                if (!isMounted) return;
                setServerData({ content: [], totalPages: 1, totalElements: 0 });
            })
            .finally(() => {
                if (isMounted) setLoadingServer(false);
            });

        return () => {
            isMounted = false;
        };
    }, [productosExternos, searchParams]);

    const sortSelectValue = useMemo(
        () => getPersistedSortParam(searchParams) ?? '',
        [searchParams]
    );
    const effectiveSort = useMemo(() => getEffectiveSortOrder(searchParams), [searchParams]);
    const searchTerm = searchParams.get('search') || '';

    const isExternal = productosExternos !== null;
    const productosAUsar = isExternal
        ? productosExternos
        : (serverData?.content || []);
    const serverFacets = isExternal
        ? (facetsExternas || undefined)
        : serverData?.facets;
    const loadingAUsar = isExternal ? loadingExterno : loadingServer;

    const opciones = useMemo(
        () => extractFilterFacets(productosAUsar || [], serverFacets),
        [productosAUsar, serverFacets]
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

    const listaOrdenada = useMemo(
        () => sortCatalogProducts(productosAUsar, effectiveSort),
        [productosAUsar, effectiveSort]
    );

    const totalPaginas = isExternal
        ? (totalPaginasExterno ?? 1)
        : (serverData?.totalPages ?? 1);

    const totalConteo = isExternal
        ? listaOrdenada.length
        : (serverData?.totalElements ?? listaOrdenada.length);

    const paginaActual = useMemo(
        () => Math.min(Math.max(1, rawPage), Math.max(1, totalPaginas)),
        [rawPage, totalPaginas]
    );

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [paginaActual]);

    if (loadingAUsar) {
        return <p className="center-message">Cargando productos...</p>;
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
                        <h2 className={styles.title}>Productos ({totalConteo})</h2>
                        <SortSelector sortOption={sortSelectValue} onChange={handleSortChange} />
                    </header>

                    {searchTerm.trim() && (
                        <p className={styles.searchHint}>
                            Resultados para: &ldquo;{searchTerm.trim()}&rdquo;
                        </p>
                    )}

                    {productosAUsar.length === 0 ? (
                        <p className="center-message">No hay productos disponibles que coincidan con los filtros.</p>
                    ) : (
                        <>
                            <ul className={styles.productGrid}>
                                {listaOrdenada.map((producto) => (
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

                            {totalPaginas > 1 && (
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
