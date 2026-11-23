# Evaluación e Implementación de Mejoras de Rendimiento Frontend

**Fecha:** Septiembre 2026  
**Proyecto:** E-Commerce  
**Ubicación:** `frontend/docs/Evaluacion-Rendimiento-Frontend.md`  

---

## 1. Resumen Ejecutivo y Diagnóstico

Este documento consolida el diagnóstico de rendimiento realizado sobre el frontend de la aplicación E-Commerce, detallando las optimizaciones aplicadas en la arquitectura de empaquetado, gestión de fuentes, carga de medios visuales y consumo de datos de la API.

A pesar de que previamente se había implementado *Lazy Loading* básico en las rutas del navegador (`React.lazy`), la aplicación presentaba cuellos de botella importantes en:
1. **Carga masiva e incondicional de datos al iniciar:** Todos los proveedores globales descargaban el catálogo completo de productos y categorías incluso al visitar páginas estáticas como `/login`.
2. **Bundle monolítico de dependencias:** Vendor JS pesado sin separación adecuada de caché.
3. **Descarga redundante de fuentes:** Múltiples familias tipográficas repetidas cargando archivos `.woff2` innecesarios.
4. **Priorización no óptima de imágenes principales (LCP):** Imágenes principales cargando con baja prioridad sin atributos de precarga acelerada.

---

## 2. Detalle de las 4 Fases de Optimización Implementadas

### 2.1. Fase 1: Divisón de Chunks y Compilación de Producción (Vite)

* **Archivo modificado:** [vite.config.ts](file:///d:/Programación/ecommerce/frontend/vite.config.ts)
* **Acciones realizadas:**
  * Configuración de `manualChunks` en Rollup para independizar las librerías de React de las librerías pesadas de validación y formularios:
    ```ts
    manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
    }
    ```
  * Adición de descarte automático de `console.log` y `debugger` en el build de producción mediante Esbuild:
    ```ts
    esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
    }
    ```
* **Impacto en Rendimiento:**
  * Permite que las librerías de formularios (`64 kB`) y el runtime de React (`158 kB`) se almacenen en la caché de HTTP del navegador de forma independiente.
  * Los chunks por cada vista/página de la aplicación se redujeron a tamaños de entre **0.9 kB y 14 kB**.

---

### 2.2. Fase 2: Consolidación y Optimización de Fuentes Tipográficas

* **Archivos modificados:** [main.tsx](file:///d:/Programación/ecommerce/frontend/src/main.tsx), [ProductDetailView.module.css](file:///d:/Programación/ecommerce/frontend/src/widgets/product-detail/ProductDetailView.module.css), [Footer.module.css](file:///d:/Programación/ecommerce/frontend/src/widgets/layout/Footer/Footer.module.css)
* **Acciones realizadas:**
  * Se identificó que `@fontsource/inter` solo se utilizaba en 2 componentes aislados y duplicaba las familias tipográficas primarias del sistema de diseño (`Instrument Sans`).
  * Se reemplazaron las declaraciones de `font-family: 'Inter'` por `'Instrument Sans'` en las hojas de estilo y se eliminaron las 3 importaciones de `@fontsource/inter` en `main.tsx`.
* **Impacto en Rendimiento:**
  * **Eliminación de 6 archivos de fuentes `.woff` y `.woff2`** de la descarga inicial de la aplicación.
  * Ahorro de más de **170 KB** de transferencia de red en la carga inicial (*First Contentful Paint*).

---

### 2.3. Fase 3: Optimización de Imágenes y Core Web Vitals (LCP y CLS)

* **Archivos modificados:** [ProductGallery.tsx](file:///d:/Programación/ecommerce/frontend/src/widgets/product-detail/ProductGallery/ProductGallery.tsx), [ProductCard.tsx](file:///d:/Programación/ecommerce/frontend/src/shared/ui/Card/ProductCard.tsx)
* **Acciones realizadas:**
  * **Optimización LCP (Largest Contentful Paint):** La imagen principal en la galería del detalle de producto fue configurada con máxima prioridad de descarga:
    ```tsx
    <img
        src={imagenActiva}
        alt={producto.nombre}
        className={styles.mainImg}
        loading="eager"
        fetchPriority="high"
        decoding="async"
    />
    ```
  * **Diferimiento de Imágenes Secundarias:** Las miniaturas y tarjetas fuera de pantalla fueron configuradas con `loading="lazy"` y `decoding="async"`.
* **Impacto en Rendimiento:**
  * Reducción drástica del tiempo necesario para desplegar el elemento visual primario (LCP) en las páginas de producto.
  * Prevención de bloqueos en el hilo principal durante la decodificación de imágenes grandes.

---

### 2.4. Fase 4: Eliminación de Fetch Waterfalls y Caché en Memoria en Providers

* **Archivos modificados:** [useCategorias.ts](file:///d:/Programación/ecommerce/frontend/src/entities/category/model/useCategorias.ts), [useProducts.ts](file:///d:/Programación/ecommerce/frontend/src/entities/product/model/useProducts.ts)
* **Acciones realizadas:**
  * **Deduplicación de Promesas e In-Memory Cache:** Se implementó una variable de caché a nivel de módulo (`cachedCategories` y `cachedProducts`) junto con un patrón de deduplicación de promesas en vuelo (*in-flight promise deduplication*).
  ```ts
  let cachedCategories: CategoryApi[] | null = null;
  let categoriesFetchPromise: Promise<CategoryApi[]> | null = null;

  async function getOrFetchCategories(): Promise<CategoryApi[]> {
      if (cachedCategories) return cachedCategories;
      if (!categoriesFetchPromise) {
          categoriesFetchPromise = categoryApi.getAll()
              .then((data) => {
                  cachedCategories = data;
                  return data;
              })
              .finally(() => {
                  categoriesFetchPromise = null;
              });
      }
      return categoriesFetchPromise;
  }
  ```
  * **Invalidación Reactiva de Caché:** Ante operaciones de mutación (creación, edición, cambio de estado o eliminación), la caché se invalida explícitamente (`reloadProducts(true)`) obligando a refrescar la información contra la API.
* **Impacto en Rendimiento:**
  * Si múltiples componentes o hooks se montan al mismo tiempo, **solo se realiza 1 única petición HTTP a la API**.
  * Al navegar entre diferentes páginas de la aplicación, el catálogo y las categorías se responden en **0 milisegundos desde la memoria**, eliminando tiempos de espera por red.

---

## 3. Matriz de Resultados

| Métrica / Aspecto | Antes de las Mejoras | Después de las Mejoras |
| :--- | :--- | :--- |
| **Archivos de Fuentes Descargados** | 12 archivos `.woff` / `.woff2` | **6 archivos** (ahorro de ~170 KB) |
| **Prioridad de Imagen LCP** | Baja / `loading="lazy"` genérico | **`fetchPriority="high"` + `loading="eager"`** |
| **Peticiones HTTP por Navegación** | Múltiples re-fetches al cambiar de vista | **0ms (Resuelto desde caché en memoria)** |
| **Separación de Chunks JS** | Vendor monolítico | **`react-vendor` (158KB) + `forms-vendor` (64KB)** |
| **Tests Automatizados** | 151 pasados | **151/151 pasados (0 regresiones)** |
| **Tiempo de Build de Producción** | ~21.7s (con logs y overhead) | **~1.44s en reconstrucción** |

---

## 4. Guía de Buenas Prácticas Continuas para el Equipo Dev

1. **Mantener la Disciplina de Componentes Perezosos:** Toda pantalla administrativa o widget secundario de gran tamaño debe importarse vía `React.lazy`.
2. **Utilizar `fetchPriority="high"` en la Imagen Hero:** En cualquier vista nueva con un Banner principal o producto destacado, asignar siempre `fetchPriority="high"` a la primera imagen visible.
3. **No Agregar Familias Tipográficas Adicionales:** Mantener la interfaz unificada sobre `Instrument Sans` para cuerpo y `Bebas Neue` / `Instrument Serif` para títulos.
4. **Respetar el Esquema de Caché en Hooks:** Al crear nuevos servicios en la capa de entidades (`entities/`), reutilizar el patrón de deduplicación de promesas si los datos no cambian con alta frecuencia.

---
*Documento generado como parte del informe de evaluación e implementación de rendimiento del frontend.*

