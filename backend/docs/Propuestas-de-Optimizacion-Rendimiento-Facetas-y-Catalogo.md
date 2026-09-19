# Propuestas de Optimización de Rendimiento: Catálogo y Facetas Dinámicas

Este documento analiza el rendimiento del nuevo sistema de **catálogo y facetas dinámicas calculadas en servidor** (`GET /api/productos`) y detalla las optimizaciones recomendadas a nivel de **Base de Datos**, **Backend (Spring Boot)** y **Frontend (React)** para reducir la latencia de respuesta y mejorar la experiencia de usuario.

---

## 1. Contexto y Diagnóstico de Rendimiento

### El Cambio de Arquitectura
- **Antes**: El frontend descargaba en memoria un lote inicial de 100 productos y realizaba el filtrado, paginación y recuento de facetas en JavaScript local (0ms de latencia de red en cada clic).
- **Ahora**: Cada cambio de filtro, categoría o página ejecuta una **consulta HTTP asíncrona real** a la API de Spring Boot (`/api/productos?...`), la cual calcula dinámicamente en tiempo de ejecución las facetas y productos filtrados mediante la base de datos PostgreSQL.

### Causa de la Latencia Percibida
1. **Tráfico de Red + Consulta a BD en cada interacción**: Cada clic en un checkbox de filtro requiere un viaje completo de ida y vuelta (round-trip) HTTP + ejecución de especificaciones dinámicas SQL.
2. **Desmonte Visual en el Frontend**: El frontend actualmente activa un estado de carga global que oculta la cuadrícula de productos y muestra *"Cargando productos..."*, haciendo evidente el tiempo de red para el usuario.
3. **Falta de Índices Especializados en JSONB**: Sin un índice GIN en PostgreSQL, la extracción de especificaciones dinámicas (`specs`) requiere un recorrido completo de la tabla (*Full Table Scan*).

---

## 2. Optimizaciones en Base de Datos (PostgreSQL)

### A. Índice GIN sobre Columna JSONB (`specs`)
Dado que las facetas dinámicas (RAM, Marca, Almacenamiento, etc.) se almacenan en un campo JSONB (`specs`), es crítico crear un índice GIN (*Generalized Inverted Index*) para que PostgreSQL filtre claves/valores JSONB en orden `O(log N)` en lugar de `O(N)`.

```sql
-- Creación de índice GIN sobre la columna specs
CREATE INDEX IF NOT EXISTS idx_productos_specs_gin ON productos USING gin (specs);
```

### B. Índices B-Tree en Filtros Convencionales
Asegurar índices compuestos o individuales en las columnas de mayor frecuencia de filtrado y ordenamiento:

```sql
CREATE INDEX IF NOT EXISTS idx_productos_categoria_estado ON producto_categoria (categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_precio_estado ON productos (precio_venta, estado);
```

---

## 3. Optimizaciones en Backend (Spring Boot)

### A. Caché de Facetas por Categoría (`@Cacheable`)
El conjunto de facetas disponibles y sus rangos/opciones generales para una categoría cambian con poca frecuencia. Se recomienda almacenar en caché los objetos de facetas agregadas utilizando Spring Cache (`@Cacheable` con Caffeine en memoria o Redis).

```java
@Cacheable(value = "categoriaFacets", key = "#categoriaId", unless = "#result == null")
public Map<String, List<DatosRespuestaFaceta>> obtenerFacetasPorCategoria(Long categoriaId) {
    // Cálculo pesado de facetas
}
```

### B. Encabezados HTTP ETag y Cache-Control (`304 Not Modified`)
Inyectar la cabecera `ETag` generada a partir de un hash de la última actualización de la tabla `productos`. Si el usuario repite la misma consulta y los datos no han variado, el servidor responderá con HTTP `304 Not Modified` con cuerpo vacío (0 bytes de transferencia de datos).

---

## 4. Optimizaciones en Frontend (React / TypeScript) — ESTADO: IMPLEMENTADO

### A. Evitar Parpadeos Visuales (`keepPreviousData` / `useTransition`)
- **Estado**: ✅ **COMPLETADO (Frontend)**
- **Detalle de Implementación**: Se separó el estado de carga inicial (`isInitialLoading`) del estado de consulta en segundo plano (`isFetchingServer`) en `ProductCatalog.tsx`. Al aplicar un filtro o cambiar de página, la cuadrícula actual se mantiene montada en pantalla con opacidad reducida (`opacity: 0.6`) y la etiqueta `(Actualizando...)` en la barra superior, eliminando el desmontaje completo del componente y el parpadeo de *"Cargando productos..."*.

### B. Caché de Consultas en Cliente (`catalogoCache` en memoria)
- **Estado**: ✅ **COMPLETADO (Frontend)**
- **Detalle de Implementación**: Se implementó `catalogoCache` en `productApi.ts` utilizando un mapa en memoria con TTL de 5 minutos. Si el usuario alterna entre filtros ya consultados (ej. *"Apple"*, luego *"Samsung"* y regresa a *"Apple"*), los datos y recuentos de facetas se devuelven en **0ms** sin peticiones HTTP a la red. El caché se invalida automáticamente (`invalidateCatalogoCache`) cuando ocurren operaciones de mutación (`create`, `update`, `delete`, `updateStatus`).

### C. Transición Suave de Datos
- **Estado**: ✅ **COMPLETADO (Frontend)**
- **Detalle de Implementación**: Transición CSS suave (`transition: opacity 0.2s ease`) al refrescar productos, garantizando que el usuario mantenga el foco visual mientras se reciben los nuevos datos.

---

## 5. Matriz de Prioridad de Implementación

| Optimización | Componente | Impacto | Estado |
| :--- | :--- | :--- | :--- |
| **Mantener datos previos en UI** | Frontend React | **Alto** (Elimina parpadeo visual del usuario) | ✅ **Completado (Frontend)** |
| **Caché de Consultas en Cliente** | Frontend React | **Alto** (Respuestas en 0ms a búsquedas previas) | ✅ **Completado (Frontend)** |
| **Transición suave al refrescar** | Frontend React | **Medio** (Mejora experiencia táctil/visual) | ✅ **Completado (Frontend)** |
| **Índice GIN en JSONB (`specs`)** | PostgreSQL | **Alto** (Reduce tiempo de consulta SQL de N a log N) | ⏳ Pendiente (Equipo Backend) |
| **Caché de Facetas (`@Cacheable`)** | Backend Spring | **Medio** (Reduce carga de CPU en servidor) | ⏳ Pendiente (Equipo Backend) |
| **Encabezados HTTP ETag / 304** | Backend Spring | **Medio** (Respuestas vacías si no hay cambios) | ⏳ Pendiente (Equipo Backend) |

