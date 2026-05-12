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
import { extractFilterOptions } from "../../utils/filterHelpers";
import {
    getPersistedSortParam,
    getEffectiveSortOrder,
    parseFiltrosFromParams,
    buildCatalogSearchParams,
    isFiltrosDefault,
} from "../../utils/catalogQueryParams";

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
    const loadingAUsar = loadingExterno !== false ? loadingExterno : loadingContexto;

    const opciones = useMemo(() => extractFilterOptions(productosAUsar || []), [productosAUsar]);

    const defaultFiltros = useMemo(
        () => ({
            marca: [],
            ram: [],
            almacenamiento: [],
            precioMin: opciones.precioMin ?? 0,
            precioMax: opciones.precioMax ?? 10000,
        }),
        [opciones.precioMin, opciones.precioMax]
    );

    const filtrosActivos = useMemo(
        () => parseFiltrosFromParams(searchParams, opciones),
        [searchParams, opciones]
    );

    const filtrosParaUi = useMemo(
        () => filtrosActivos ?? defaultFiltros,
        [filtrosActivos, defaultFiltros]
    );

    const handleFilterChange = useCallback(
        (nextFiltros) => {
            const forUrl = isFiltrosDefault(nextFiltros, opciones) ? null : nextFiltros;
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

    const productosFiltrados = useMemo(() => {
        if (!productosAUsar) return [];

        let resultado = [...productosAUsar];

        if (filtrosActivos) {
            const { marca, ram, almacenamiento, precioMin, precioMax } = filtrosActivos;

            resultado = resultado.filter(
                (p) => p.precioVenta >= precioMin && p.precioVenta <= precioMax
            );

            if (marca && marca.length > 0) {
                resultado = resultado.filter((p) => {
                    const pMarca = p.specs?.Marca || p.marca;
                    return pMarca && marca.includes(pMarca);
                });
            }

            if (ram && ram.length > 0) {
                resultado = resultado.filter((p) => {
                    const pRam = p.specs?.RAM?.toString().replace(/\s/g, "");
                    return pRam && ram.includes(pRam);
                });
            }

            if (almacenamiento && almacenamiento.length > 0) {
                resultado = resultado.filter((p) => {
                    const pStorage = p.specs?.Almacenamiento?.toString().replace(/\s/g, "");
                    return pStorage && almacenamiento.includes(pStorage);
                });
            }
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            resultado = resultado.filter(
                (p) => p.nombre && p.nombre.toLowerCase().includes(term)
            );
        }

        return resultado;
    }, [productosAUsar, filtrosActivos, searchTerm]);

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
        <section
            className="product-catalog"
            style={{
                display: "flex",
                gap: "2rem",
                alignItems: "flex-start",
            }}
        >
            <div
                style={{
                    width: "250px",
                    flexShrink: 0,
                    minWidth: "250px",
                }}
            >
                <ProductFilters
                    productos={productosAUsar}
                    filtros={filtrosParaUi}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <div
                style={{
                    flexGrow: 1,
                    minWidth: 0,
                    width: "100%",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                        Productos ({listaOrdenada.length})
                    </h2>
                    <SortSelector sortOption={sortSelectValue} onChange={handleSortChange} />
                </div>

                {searchTerm.trim() && (
                    <p
                        style={{
                            fontSize: "1rem",
                            color: "var(--text-secondary)",
                            marginBottom: "1rem",
                        }}
                    >
                        Resultados para: "{searchTerm.trim()}"
                    </p>
                )}

                {listaOrdenada.length === 0 ? (
                    <p className="center-message">No hay productos que coincidan con los filtros.</p>
                ) : (
                    <div
                        className="admin-product-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {listaOrdenada.map((producto) => (
                            <ProductCard
                                className="product-card"
                                key={producto.id}
                                imageSrc={getMainProductImageUrl(producto)}
                                altText={producto.altText}
                                title={producto.nombre}
                                description={producto.descripcion}
                                price={producto.precioVenta}
                                actionLabel="Ver producto"
                                onAction={() => navigate(`/producto/${producto.slug || producto.id}`)}
                                onAddToCart={() => handleAddProductToCart(producto.id, producto.nombre)}
                                addLabel="Agregar"
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
