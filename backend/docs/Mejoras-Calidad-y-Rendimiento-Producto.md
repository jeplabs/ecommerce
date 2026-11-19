# Mejoras de Calidad y Rendimiento en el Módulo de Productos

Este documento detalla las 4 mejoras aplicadas sobre el repositorio, servicio y entidad de productos después de implementar el ordenamiento global multi-página, la inclusión de subcategorías y la paginación de favoritos.

---

## 1. Limpieza de `ORDER BY p.nombre` redundante en `ProductoRepository`

- **Problema**: Las consultas nativas `buscarActivosSinPaginacion` y `buscarTodosAdminSinPaginacion` conservaban `ORDER BY p.nombre` en SQL aunque el ordenamiento determinista ya se aplicaba en `ProductoService.ordenarProductos(...)` antes de paginar. Además, existía el método `buscarActivos` con `ORDER BY p.nombre` fijo sin llamadores activos.
- **Solución**:
  - Se eliminó `buscarActivos` de [ProductoRepository.java](file:///C:/Users/alexe/Desktop/2026-Projects/e-commerce/ecommerce/backend/src/main/java/com/jeplabs/ecommerce/domain/producto/ProductoRepository.java).
  - Se removió `ORDER BY p.nombre` de `buscarActivosSinPaginacion` y `buscarTodosAdminSinPaginacion`, evitando ordenamientos innecesarios en PostgreSQL antes del ordenamiento global en Java.
  - Se actualizó `ProductoService.listar(...)` para reutilizar `buscarActivosSinPaginacion`, `ordenarProductos` y `sublistaPaginada`, garantizando soporte consistente de `Sort` dinámico.

---

## 2. Eliminación de duplicación al extraer el precio activo (`ProductoService`)

- **Problema**: Los métodos `obtenerPrecioVentaActual`, `obtenerPrecioCostoActual` y `obtenerMargenActual` en [ProductoService.java](file:///C:/Users/alexe/Desktop/2026-Projects/e-commerce/ecommerce/backend/src/main/java/com/jeplabs/ecommerce/domain/producto/ProductoService.java) repetían exactamente el mismo flujo `stream().filter(p -> p.getFechaFin() == null)...findFirst()`.
- **Solución**: Se extrajo un único helper parametrizado:
  ```java
  private static BigDecimal obtenerValorPrecioActivo(
          Producto producto, Function<PrecioHistorial, BigDecimal> extractor) {
      return producto.getPrecios().stream()
              .filter(p -> p.getFechaFin() == null)
              .map(extractor)
              .findFirst()
              .orElse(BigDecimal.ZERO);
  }
  ```
  Los tres métodos ahora delegan en este helper.

---

## 3. Comparación monetaria precisa con `BigDecimal` en filtro de precios

- **Problema**: En `ProductoService.listarFacetado(...)`, el filtro por rango (`precioMin` / `precioMax`) convertía el `BigDecimal` de `obtenerPrecioVentaActual(p)` a `double` mediante `.doubleValue()`, apartándose de la regla de usar `BigDecimal` para comparaciones monetarias.
- **Solución**: Se reemplazó por comparación directa con `BigDecimal.compareTo(...)`:
  ```java
  if (precioMin != null || precioMax != null) {
      BigDecimal precioActual = obtenerPrecioVentaActual(p);
      if (precioMin != null && precioActual.compareTo(BigDecimal.valueOf(precioMin)) < 0) matches = false;
      if (precioMax != null && precioActual.compareTo(BigDecimal.valueOf(precioMax)) > 0) matches = false;
  }
  ```

---

## 4. Mitigación de consultas `N+1` mediante `@BatchSize(size = 50)`

- **Problema**: Al mapear páginas de productos (`DatosRespuestaProducto`, `DatosRespuestaProductoAdmin`) o favoritos (`DatosRespuestaFavorito`), las colecciones `LAZY` de `Producto` (`categorias`, `precios` e `imagenes`) se cargaban individualmente por cada producto.
- **Solución**: Se agregó `@BatchSize(size = 50)` en [Producto.java](file:///C:/Users/alexe/Desktop/2026-Projects/e-commerce/ecommerce/backend/src/main/java/com/jeplabs/ecommerce/domain/producto/Producto.java) sobre:
  - `categorias`
  - `precios`
  - `imagenes`

  Esto permite que Hibernate cargue las colecciones en lotes de hasta 50 productos usando cláusulas `IN (...)`, reduciendo drásticamente el número de queries sin provocar `MultipleBagFetchException`.

---

## Verificación
- Suite completa ejecutada con `.\mvnw.cmd -o test`: **118 tests ejecutados, 0 fallos, 0 errores, 0 omitidos (`BUILD SUCCESS`)**.
