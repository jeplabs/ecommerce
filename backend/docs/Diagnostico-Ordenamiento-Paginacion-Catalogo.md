# Diagnóstico de Arquitectura: Ordenamiento y Paginación en Catálogo

## 1. Contexto y Descripción del Problema
Al navegar por el catálogo público de productos (`/catalogo` y `/categoria/...`), el usuario puede seleccionar opciones de ordenamiento en el dropdown **"Ordenar por:"**:
- `Nombre: A-Z` (`name-asc`)
- `Nombre: Z-A` (`name-desc`)
- `Precio: menor a mayor` (`price-asc`)
- `Precio: mayor a menor` (`price-desc`)
- `Más reciente` (`newest`)

Se detectó que el ordenamiento se comporta de forma inconsistente entre páginas sucesivas (especialmente notorio en `Nombre: Z-A`):
- En la **Página 1**, los productos se muestran invertidos alfabéticamente pero solo dentro de un rango inicial (por ejemplo, de la **C** a la **A**).
- Al avanzar a la **Página 2**, aparecen productos que van de la **M** a la **D**.
- Los productos con letras finales (como la **Z** o la **V**) no aparecen en la primera página, sino que permanecen en la última página.

---

## 2. Diagnóstico Técnico

### 2.1 Comportamiento en el Backend (`ProductoService.java`)
En el servicio `ProductoService.java`, el método principal de listado público es `listarFacetado`:
```java
// 1. Base filtrada desde BD con orden fijo alfabético
List<Producto> productosBase = productoRepositorio.buscarActivosSinPaginacion(nombre, categoriaId);

// 2. Filtros dinámicos en memoria (precio y specs)
List<Producto> filtrados = new ArrayList<>();
for (Producto p : productosBase) {
    // ... evaluación de filtros
    if (matches) filtrados.add(p);
}

// 3. Cálculo de Facetas sobre los resultados
// ...

// 4. Paginación Manual
int totalElements = filtrados.size();
int start = (int) pageable.getOffset();
int end = Math.min((start + pageable.getPageSize()), totalElements);
List<Producto> paginatedList = start <= end ? filtrados.subList(start, end) : new ArrayList<>();
```

**Causa raíz en el backend:**
1. La consulta SQL `buscarActivosSinPaginacion` tiene codificado `ORDER BY p.nombre ASC`.
2. La lista `filtrados` mantiene estrictamente ese orden alfabético original A-Z.
3. El parámetro de consulta `sort` (`name-desc`, `price-asc`, etc.) llega al backend en el mapa `params` / `specs`, pero **no se aplica ningún ordenamiento sobre `filtrados` antes de invocar `filtrados.subList(start, end)`**.
4. En consecuencia, el backend **siempre** devuelve páginas cortadas sobre la lista en orden alfabético ascendente:
   - Página 0: Productos 0 a 11 (A - C).
   - Página 1: Productos 12 a 23 (D - M).
   - Página 2: Productos 24 a N (N - Z).

### 2.2 Comportamiento en el Frontend (`ProductCatalog.tsx`)
En el cliente, el componente del catálogo recibe la página devuelta por el servidor (`serverData.content`), la cual contiene únicamente los 12 productos recortados por el backend.

A continuación, el frontend ejecuta:
```ts
const listaOrdenada = useMemo(
    () => sortCatalogProducts(productosAUsar, effectiveSort),
    [productosAUsar, effectiveSort]
);
```

Dado que `productosAUsar` solo tiene los 12 elementos de la página activa, la función cliente `sortCatalogProducts` ordena **únicamente esa rebanada local en memoria**:
- Página 1: Recibe (A, B, C) -> Invierte localmente -> Muestra (C, B, A).
- Página 2: Recibe (D, E, M) -> Invierte localmente -> Muestra (M, E, D).
- Página 3: Recibe (S, T, Z) -> Invierte localmente -> Muestra (Z, T, S).

---

## 3. Impacto en Otros Criterios de Ordenamiento
Este mismo fenómeno afecta a los demás criterios cuando el catálogo supera el tamaño de una página (`size = 12`):
- **Precio (menor a mayor / mayor a menor):** Si en la página 2 hay un producto de \$5 y en la página 1 el más barato es \$25, al ordenar por precio menor a mayor en la página 1 solo se ordenan los 12 productos que fueron seleccionados alfabéticamente por el backend; el producto de \$5 permanece en la página 2.
- **Más reciente:** Los productos más nuevos ubicados en páginas posteriores no se trasladan a la primera página.

---

## 4. Propuesta de Solución Técnica para el Backend (Roadmap Futuro)
Para que el ordenamiento sea consistente en todo el catálogo paginado, el backend debe ordenar la colección completa `filtrados` **antes** del paso 4 (`subList`):

```java
// Paso 3.5: Ordenamiento global en memoria antes del recorte de paginación
String sortParam = params != null ? params.getFirst("sort") : null;
if (sortParam != null) {
    switch (sortParam) {
        case "name-desc":
            filtrados.sort((a, b) -> {
                String nA = a.getNombre() != null ? a.getNombre() : "";
                String nB = b.getNombre() != null ? b.getNombre() : "";
                return nB.compareToIgnoreCase(nA);
            });
            break;
        case "name-asc":
            filtrados.sort((a, b) -> {
                String nA = a.getNombre() != null ? a.getNombre() : "";
                String nB = b.getNombre() != null ? b.getNombre() : "";
                return nA.compareToIgnoreCase(nB);
            });
            break;
        case "price-asc":
            filtrados.sort((a, b) -> Double.compare(obtenerPrecioActual(a), obtenerPrecioActual(b)));
            break;
        case "price-desc":
            filtrados.sort((a, b) -> Double.compare(obtenerPrecioActual(b), obtenerPrecioActual(a)));
            break;
        case "newest":
            filtrados.sort((a, b) -> {
                LocalDateTime tA = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.MIN;
                LocalDateTime tB = b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.MIN;
                return tB.compareTo(tA);
            });
            break;
        default:
            break;
    }
}
```

Con este ajuste en el backend:
1. `filtrados` quedará ordenado globalmente según el criterio seleccionado.
2. `subList(start, end)` extraerá el segmento correspondiente en orden absoluto.
3. El frontend recibirá directamente los datos ordenados y la paginación responderá de forma continua (Página 1: Z -> R, Página 2: R -> H, etc.).
