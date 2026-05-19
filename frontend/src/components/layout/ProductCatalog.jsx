import { useMemo, useCallback } from "react";
import { ProductCard } from "../ui/Card/ProductCard";
import { useProduct } from "../../context/ProductContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMainProductImageUrl } from "../../utils/productImages";
import { ProductFilters } from "../ui/ProductFilters/ProductFilters";
import { SortSelector } from "../ui/SortSelector/SortSelector";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import {
    extractFilterFacets,
    applyProductFilters,
    createDefaultFiltros,
    mergeFiltrosWithFacets,
} from "../../utils/productFilterFacets";
import {
    getPersistedSortParam,
    getEffectiveSortOrder,
    parseFiltrosFromParams,
    buildCatalogSearchParams,
    isFiltrosDefault,
} from "../../utils/catalogQueryParams";
import "./ProductCatalog.css";

export const ProductCatalog = ({ productosExternos = null, loadingExterno = false }) => {
    const { productos: productosContexto, loading: loadingContexto } = useProduct();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const sortSelectValue = useMemo(
        () => getPersistedSortParam(searchParams) ?? "",
        [searchParams]
    );
    const effectiveSort = useMemo(() => getEffectiveSortOrder(searchParams), [searchParams]);
    const searchTerm = searchParams.get("search") || "";

    const productosAUsar = productosExternos !== null ? productosExternos : productosContexto;
    const loadingAUsar = productosExternos !== null ? loadingExterno : loadingContexto;

    const opciones = useMemo(
        () => extractFilterFacets(productosAUsar || []),
        [productosAUsar]
    );

    const defaultFiltros = useMemo(
        () => createDefaultFiltros(opciones),
        [opciones]
    );

    const filtrosActivos = useMemo(
        () => parseFiltrosFromParams(searchParams, opciones),
        [searchParams, opciones]
    );

    const filtrosParaUi = useMemo(
        () => mergeFiltrosWithFacets(filtrosActivos ?? defaultFiltros, opciones),
        [filtrosActivos, defaultFiltros, opciones]
    );

    const handleFilterChange = useCallback(
        (nextFiltros) => {
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
        (sort) => {
            const sortForUrl = sort === "" ? null : sort;
            const params = buildCatalogSearchParams(searchParams, {
                filtros: filtrosActivos,
                sort: sortForUrl,
                opciones,
            });
            setSearchParams(params, { replace: false });
        },
        [searchParams, setSearchParams, filtrosActivos, opciones]
    );

    const handleAddProductToCart = async (productoId, nombre) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const result = await addToCart(productoId, 1);
        if (result.success) {
            showSuccess(`${nombre} agregado al carrito`);
        } else {
            showError(result.error || "No se pudo agregar el producto");
        }
    };

    const productosFiltrados = useMemo(
        () => applyProductFilters(productosAUsar, filtrosActivos, searchTerm),
        [productosAUsar, filtrosActivos, searchTerm]
    );

    const sortProducts = (productos) => {
        if (!productos) return [];
        const ordenados = [...productos];
        switch (effectiveSort) {
            case "price-desc":
                return ordenados.sort((a, b) => (b.precioVenta || 0) - (a.precioVenta || 0));
            case "name-asc":
                return ordenados.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            case "name-desc":
                return ordenados.sort((a, b) => (b.nombre || "").localeCompare(a.nombre || ""));
            case "newest":
                return ordenados.sort((a, b) => {
                    const fechaA = new Date(a.createdAt || a.updatedAt || 0).getTime();
                    const fechaB = new Date(b.createdAt || b.updatedAt || 0).getTime();
                    return fechaB - fechaA;
                });
            case "price-asc":
            default:
                return ordenados.sort((a, b) => (a.precioVenta || 0) - (b.precioVenta || 0));
        }
    };

    const listaOrdenada = useMemo(
        () => sortProducts(productosFiltrados),
        [productosFiltrados, effectiveSort]
    );

    if (loadingAUsar) {
        return <p className="center-message">Cargando productos...</p>;
    }

    if (!productosAUsar || productosAUsar.length === 0) {
        return <p className="center-message">No hay productos disponibles en esta sección.</p>;
    }

    return (
        <section className="product-catalog" aria-label="Catálogo de productos">
            <div className="catalog-container">
                <div className="catalog-sidebar">
                    <ProductFilters
                        productos={productosAUsar}
                        filtros={filtrosParaUi}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="catalog-content">
                    <header className="catalog-toolbar">
                        <h2 className="catalog-title">
                            Productos ({listaOrdenada.length})
                        </h2>
                        <SortSelector sortOption={sortSelectValue} onChange={handleSortChange} />
                    </header>

                    {searchTerm.trim() && (
                        <p className="catalog-search-hint">
                            Resultados para: &ldquo;{searchTerm.trim()}&rdquo;
                        </p>
                    )}

                    {listaOrdenada.length === 0 ? (
                        <p className="center-message">No hay productos que coincidan con los filtros.</p>
                    ) : (
                        <ul className="catalog-product-grid">
                            {listaOrdenada.map((producto) => (
                                <li key={producto.id} className="catalog-product-grid__item">
                                    <ProductCard
                                        className="product-card"
                                        imageSrc={getMainProductImageUrl(producto)}
                                        altText={producto.altText}
                                        title={producto.nombre}
                                        description={producto.descripcion}
                                        price={producto.precioVenta}
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
                    )}
                </div>
            </div>
        </section>
    );
};
