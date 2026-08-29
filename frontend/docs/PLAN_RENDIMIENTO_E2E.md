# Plan: Estabilizar E2E Cypress + Optimizar rendimiento del frontend

> Documento de planificación del frontend. Cubre dos objetivos relacionados que surgieron tras implementar la
> optimización de carga inicial (code-splitting por ruta, fuentes autoalojadas, `manualChunks`):
> **1) estabilizar los tests E2E de Cypress** (que empezaron a fallar de forma intermitente por timing) y
> **2) seguir mejorando el rendimiento en el navegador** (CLS e imagen de arranque) con base en métricas reales de DevTools.

## Estado actual / resumen del problema

### 1) Tests E2E: 2 fallos intermitentes por timing

Al aplicar `React.lazy` por ruta, la primera visita a una ruta **lazy** ahora descarga su chunk bajo demanda.
En el entorno de Cypress (Electron headless, sin caché aprovechable entre tests, sobre el server de dev) ese "primer
montaje" suma latencia que a veces supera los timeouts por defecto:

| Spec | Test que falla | Fallo observado | Patrón |
|---|---|---|---|
| `checkout-guest.cy.ts` | `redirige a login al agregar producto sin sesión` | `cy.contains('h1','Iniciar sesión')` no aparece a tiempo tras redirigir a `/login` | `cy.visit` + navegación a ruta lazy |
| `product.cy.ts` | `navega al detalle desde el catálogo` | `cy.wait('@getProductBySlug')` → "No request ever occurred" | `cy.visit` + click de navegación SPA a ruta lazy |
| `profile-orders.cy.ts` | (falló en una corrida, pasó en otra) | `cy.wait('@getOrderById')` → "No request ever occurred" | `cy.visit` directo a ruta lazy |

Confirmado que **no son errores funcionales**: los cambios aplicados no alteran la lógica en runtime (los imports de
`@/entities/order` → `@/entities/order/api/orderApi` solo cambian la ruta del import), los tests unitarios pasan todos,
y los mismos specs pasan en corridas sucesivas (flaky). El síntoma es **timing del primer montaje de un chunk lazy**.

**Nota técnica clave sobre Cypress:** para `cy.wait('@alias')`, cuando la request **es la 1ª** a esa ruta, el límite
de tiempo que se aplica es el **`requestTimeout` global** (`cypress.config.ts`), NO el `{ timeout }` del comando
`cy.wait`. El `{ timeout }` del comando aplica a re-matches posteriores. Por eso hay que tocar el global.

### 2) Rendimiento en el navegador (métricas reales de DevTools)

El usuario midió la carga inicial de la **home** en DevTools (sin limitar red):

- **213 solicitudes / 4,9 MB transferidos** (4,8 MB de recursos) — alto para una home.
- **LCP 1,28 s — bueno**, elemento LCP = `<img>` (primera imagen del hero).
- **CLS 0,44 — deficiente** (umbral objetivo < 0,1).
- **INP**: sin datos.

Análisis (ver detalles en [Hallazgos del build](#hallazgos-del-build)):

| Problema | Causa raíz probable |
|---|---|
| **CLS 0,44** | El **hero del Carousel no reserva altura** (`Carousel.module.css`). Al cargar el `.webp` crece de 0 a ~600 px y desplaza el layout. `CategoriasNav` además aparece tras la carga y empuja el hero. |
| **LCP 1,28 s** | Hero sin `fetchpriority="high"` ni `preload`; se descarga tarde en la secuencia de recursos. |
| **4,9 MB / 213 requests** | El chunk **`validation` (zod, 275 kB / 63 gzip)** se **pre-carga** en el HTML inicial (`dist/index.html` `modulepreload`) pese a que solo se usa en formularios. El chunk `forms` (react-hook-form) quedó **vacío** (0,04 kB) → RHF se embebió en checkout. + entry 265 kB + react-vendor 49 kB + CSS 32 kB + 20 fuentes (~400 kB) + hero + imágenes de producto. |
| **Sin caché** | **No existe `Cache-Control` en ningún lado** (backend no sirve el frontend; `netlify.toml` solo tiene la regla SPA). Los assets con hash se revalidan en cada visita. |

---

## Alineación de prioridades

El usuario pidió este orden:

1. **Primero** resolver/confirmar el bloqueante E2E (para poder commitear limpio).
2. **Después** atacar CLS + peso de imágenes/carga inicial.

Las dos fases son independientes y pueden trabajarse en paralelo, pero se recomienda validar la Fase 1 primero
porque el bloqueante es el commit.

---

## FASE 1 — Estabilizar los tests E2E de Cypress

### Objetivo
Que los 29 E2E pasen de forma **consistente** en cualquier máquina/CI, absorbiendo la latencia legítima del primer
montaje de chunks lazy.

### Cambio (ya aplicado, pendiente de validar)

**`frontend/cypress.config.ts`** — subir los timeouts globales:

```ts
e2e: {
    // ...
    defaultCommandTimeout: 10000, // (antes 4000) cubre cy.contains / cy.url / asserts
    requestTimeout: 10000,        // (antes 5000) cubre cy.wait que espera la 1ª request
}
```

**Timeouts explícitos en los 3 specs sensibles** (refuerzo + intención documentada):

- `cypress/e2e/checkout-guest.cy.ts:18-19` → `{ timeout: 10000 }` en `cy.url().should('include','/login')` y `cy.contains('h1','Iniciar sesión')`.
- `cypress/e2e/product.cy.ts:18,26` → `{ timeout: 10000 }` en los `cy.wait('@getProductBySlug')`.
- `cypress/e2e/profile-orders.cy.ts:30` → `{ timeout: 10000 }` en `cy.wait('@getOrderById')`.

### Paso 1.1 — Validar que se aplican (acciones del usuario)

El último reporte E2E del usuario aún mostraba timeouts de **4000/5000 ms** (los valores por defecto), pese a que los
cambios ya estaban guardados. Es decir, **esa corrida no incluyó la config actualizada**. 

> ⚠️ Es obligatorio **re-ejecutar `pnpm test:e2e` ahora que la config quedó guardada** para confirmar que los mensajes
> de fallo pasan a mostrar `10000ms` (si es que aún fallan) y, en el mejor caso, que **los 29 pasan**.

Resultado esperado del diagnóstico:
- Si pasan los 29 → Fase 1 cerrada. Avanzar a Fase 2.
- Si fallan pero ahora muestran `10000ms` → el timeout ya no es el problema y hay que investigar el flujo (Paso 1.2).

### Paso 1.2 — Si aún fallan con el timeout global ya aplicado

Hay que revisar la **causa de fondo** de cada fallo, no solo el timeout:

**a) `product.cy.ts` — "No request ever occurred" tras click SPA.**
   La navegación `/catalogo → /producto/:slug` monta `ProductPage` (lazy) → `ProductDetailView` → `loadProduct()`
   (`src/widgets/product-detail/ProductDetailView.tsx:39-52`) → `productApi.getBySlug`. Si el `cy.wait` se agota, la
   request no llegó a dispararse a tiempo. Estrategias (elegir la más robusta):
   - **Esperar un elemento visible en lugar de la request**: esperar el `h1` del producto o el `SKU` con
     `{ timeout: 10000 }` (verifican que la página montó y el fetch resolvió) y **quitar** el `cy.wait` de la request
     cuando no aporta (el fetch ya no se puede "assert" útilmente con datasource mocked si no se espera el payload).
   - O mantener el `cy.wait` pero asegurar que el click realmente navegó: `cy.location('pathname')` con timeout antes
     del wait.

**b) `checkout-guest.cy.ts` — `h1 'Iniciar sesión'` no aparece.**
   Tras redirigir a `/login`, `LoginPage` es lazy y debe montarse. Ya con `defaultCommandTimeout: 10000` el `cy.contains`
   esperará 10 s. Si sigue fallando, verificar que el redirect realmente ocurre (el assert de URL dejó de fallar →
   la URL sí cambió) y que el `h1` existe. Considerar usar un selector más ancho (p.ej. `body`) consistente con el
   test de abajo ("redirige a login al visitar el carrito" usa `cy.get('body').should('contain.text','Iniciar sesión')`).

**c) Regla general:** en rutas lazy, preferir **asserts de UI (elementos visibles)** sobre `cy.wait` de requests que
   dependen del montaje del chunk. Aplicable a catalogo/category/product/profile/checkout.

### Paso 1.3 — Considerar `cy.intercept` de tipo "spy" y no bloquear la app

Revisar que los intercepts no enmascaren la lentitud del chunk (los `stubShopApi`/`stubAuthenticatedApi` ya son
`cy.intercept` + `reply`, no bloquean). No es necesario cambio, solo referencia.

### Criterio de éxito Fase 1
`pnpm test:e2e` → **29 passing / 0 failing** en 2+ corridas consecutivas.

---

## FASE 2 — Mejorar rendimiento en el navegador

Basado en las métricas de DevTools. Orden por impacto percibido.

### 2.1 Resolver el CLS 0,44 (mayor impacto percibido)

**Causa raíz:** el hero del Carousel no reserva altura.

**Configurar `Carousel.module.css`** (`src/shared/ui/Carousel/Carousel.module.css`):
- Fijar una **relación de aspecto** o **altura mínima** al contenedor `.container`/`.slide` para que, antes de cargar
  el `.webp`, ya ocupe su espacio final. Ejemplo:
  ```css
  .container { aspect-ratio: 16 / 9; height: auto; max-height: 600px; }
  /* o */ .container { min-height: 300px; }
  ```
- Mantener `.slide img { width:100%; height:100%; object-fit:cover }`.
- En el `<img>` del JSX (`Carousel.tsx:39-45`) añadir `width`/`height` (dimensiones reales del WebP) como reserva
  adicional y compatibilidad.

**Mitigar el empuje de `CategoriasNav`**: si se monta después de la carga desplazando el hero, reservar su altura o
renderizarlo estable (evitar `display`/`height` que cambie tras el fetch). Ver `CategoriasNav.tsx:179` (retorna `null`
mientras carga).

**Fuentes / reflow de texto (menor):** con `font-display: swap` ya no hay FOIT, pero Bebas Neue en headings puede
desplazar texto. Confirmar que los headings/h4 (`.name`, precios) tengan altura reservada (`ProductCard.module.css:85`
ya usa `min-height: 2.8rem`). Revisar `h1`/`h2` de home si aplica.

**Criterio:** CLS **< 0,1** en recargas de la home.

### 2.2 Reducir el peso de carga inicial (4,9 MB → objetivo)

**a) Des-cargar `zod` del path crítico (el golpe más grande).**
   El chunk `validation-4o9dyszc.js` (275 kB / 63 gzip) se **pre-carga** en el HTML inicial porque Vite lo marca
   `modulepreload` al ser un `manualChunk`. Como solo se usa en formularios, evitar que se descargue en la home:
   - **Opción A (recomendada):** retirar `zod` de `manualChunks`. Con `React.lazy` de las páginas de formularios,
     Vite agrupará `zod` en el chunk lazy de la página que lo usa y **no** quedará en el path inicial.
   - **Opción B:** mantener `manualChunks` para `validation`, pero verificar que no se genere `modulepreload` en
     `dist/index.html` (si persiste, incluir `modulePreload: false`/resolver por ruta).

**b) La `forms` (react-hook-form) quedó vacía.**
   El objeto de `manualChunks` no capturó RHF (quedó en el chunk checkout, 38 kB). Confirmar el patrón de
   `manualChunks` (función vs objeto) para que `react-hook-form`/`@hookform/resolvers` realmente se agrupen o,
   preferiblemente, **eliminar `manualChunks`** y dejar que el code-splitting por ruta los maneje (ya que con lazy
   el agrupado automático suele ser mejor que las reglas manuales).

**c) Peso real del JS inicial tras los ajustes.**
   Meta: pasar el JS no-lazy de ~590 kB (161 gzip) a solo **entry + react-vendor** (≈ 315 kB / 98 gzip), dejando
   zod/react-hook-form detras de `React.lazy`.

**d) Fuentes (~400 kB en disco, los navegadores modernos usan solo woff2 ≈ 183 kB).**
   Ya están autoalojadas y con `font-display: swap`. Revisar si se puede:
   - **Reducir familias/pesos**: actualmente 5 familias × varios pesos. Confirmar que cada peso es usado
     (de momento Solución: mantener solo pesos realmente usados; p.ej. si Instrument Serif solo se usa en un heading
     de catálogo, considerar compartir con Instrument Sans para ahorrar).
   - El `@font-face` embebido en el CSS crítico hace que **todas** las fuentes se declaren en la carga inicial aunque
     solo se apliquen en páginas lazy. Considerable como wrap-ups a futuro; lo mínimo es no aumentar peso.

**e) Imágenes (LCP + reducción de requests).**
   - Añadir **`fetchpriority="high"`** a la imagen del hero (slide 0) para que el LCP se resuelva antes (`Carousel.tsx:44`).
   - El hero se sirve desde `media.spdigital.cl` (externa). Añadir **`<link rel="preconnect">` a `media.spdigital.cl`**
     y a los dominios de imágenes del backend en `index.html` para adelantar la conexión.
   - Confirmar que las imágenes de producto se sirven en **WebP/AVIF** y con dimensiones adecuadas al viewport
     (`loading="lazy"` fuera del viewport ya aplicado en `ProductCard.tsx:46`). Si el backend devuelve imágenes sin
     resize, coordinar con backend para servir variantes (fuera del alcance del frontend, anotar).

### 2.3 Caché de producción (Netlify)

El deploy es estático (`netlify.toml`). **No hay configurado `Cache-Control`** → los assets con hash se revalidan en
cada carga, lo que agrava la sensación de lentitud.

Actualizar **`netlify.toml`** (raíz del repo):

```toml
[build]
  base = "frontend"
  publish = "frontend/dist"
  command = "pnpm install && pnpm build"

[[headers]]
  for = "/assets/*"            # JS/CSS/fonts/imágenes con hash
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"          # SPA shell: no cachear
  [headers.values]
    Cache-Control = "no-cache"
```

> Nota: si en el futuro se sirviera el SPA desde Spring Boot, habría que añadir en
> `backend/src/main/java/com/jeplabs/ecommerce/infra/config/WebMvcConfig.java` un manejador de `frontend/dist` con
> `CacheControl.maxAge(365, DAYS).cachePublic()` para `/assets/**` y SPA fallback a `index.html`. Hoy no aplica.

### 2.4 (Opcional) Precarga de la ruta inicial y CSS crítico

- **`<link rel="modulepreload">` / precarga de la primera vista:** si la home o el catálogo sienten el "micro-blanco",
  precargar el chunk de esa ruta. Pero al ser la home y el catálogo la entrada, es más eficiente mantenerlos livianos
  antes que precargar (elegir según medición post-2.2).
- **CSS crítico:** el `index-C1WglxjP.css` (32 kB / 7,4 gzip) es el único render-blocking. Ya es razonable; no
  fragmentarlo salvo que el LCP lo exija.

---

## Hallazgos del build (referencia)

Ejecutado con `pnpm build` (Vite 7.3.3, 467 módulos, ~5,3 s). Totales `dist/assets`: 85 archivos = **1286,7 kB** bruto
(JS 755,3 · CSS 130 · WOFF2 182,6 · WOFF 218,8).

JS no-lazy en la primera visita:

| Chunk | kB | gzip |
|---|---|---|
| `index-Co7DzeqP.js` (entry) | 265,84 | 81,18 |
| `validation-4o9dyszc.js` (zod) | 275,16 | 63,23 |
| `react-vendor-yKs3QDFC.js` | 48,97 | 17,32 |
| **Suma JS inicial** | **589,97** | **161,73** |
| `index-C1WglxjP.css` (render-blocking) | 32,17 | 7,43 |

Chunks lazy: ninguno > 50 kB (mayor: checkout 38 kB, perfil 22 kB, admin product form 16 kB, catálogo shell 14,7 kB).

`manualChunks` actual (`vite.config.ts`): `react-vendor` → OK (49 kB); `validation` (zod) → OK pero **pre-cargado en
HTML inicial** (cuello de botella); `forms` (react-hook-form/@hookform/resolvers) → **queda vacío (0,04 kB)** — el
objeto de split no capturó RHF (embebido en checkout).

Fonts (woff2): bebas 13,8 · dm-sans 14,1/14,1 · instrument-sans 16,9/17,2/17,4 · instrument-serif 21,0 · inter 23,7/24,3/24,5
→ **total woff2 ≈ 183 kB** (los `.woff` ~219 kB solo para navegadores antiguos).

**Servido/caché:** el backend **no** sirve el frontend (solo `/uploads/**`). Deploy = **Netlify estático** (`netlify.toml`,
solo regla SPA). **Cero** `Cache-Control` en el repo → ver [2.3](#23-caché-de-producción-netlify).

**Fuentes en `main.tsx:3-12`:** instrument-sans 400/500/600, instrument-serif 400, inter 400/500/600, dm-sans 400/600,
bebas-neue 400. Todos con `font-display: swap` (emitidos por `@fontsource`), sin `@font-face` manual. Riesgo mínimo de
reflow por Bebas Neue en headings (parcialmente mitigado con `min-height` en ProductCard).

---

## Resumen de archivos a tocar

| Archivo | Cambio | Fase |
|---|---|---|
| `frontend/cypress.config.ts` | subir `defaultCommandTimeout` y `requestTimeout` a 10000 | 1 **(ya aplicado)** |
| `frontend/cypress/e2e/checkout-guest.cy.ts` | timeouts explícitos 10000 | 1 **(ya aplicado)** |
| `frontend/cypress/e2e/product.cy.ts` | timeouts explícitos 10000; posiblemente asegurar navegación antes del wait | 1 **(ya aplicado)** |
| `frontend/cypress/e2e/profile-orders.cy.ts` | timeout explícito 10000 | 1 **(ya aplicado)** |
| `frontend/src/shared/ui/Carousel/Carousel.module.css` | reservar altura / `aspect-ratio` (CLS) | 2.1 |
| `frontend/src/shared/ui/Carousel/Carousel.tsx` | `fetchpriority="high"` en slide 0 + width/height | 2.1 / 2.2 |
| `frontend/src/widgets/layout/CategoriasNav/...` | evitar empuje del hero tras la carga | 2.1 |
| `frontend/vite.config.ts` | retirar/ajustar `manualChunks` (`validation` fuera del path crítico, revisar `forms`) | 2.2 |
| `frontend/index.html` | `preconnect` a `media.spdigital.cl` y dominio de imágenes | 2.2 |
| `netlify.toml` (raíz) | build config + headers de caché | 2.3 |

## Secuencia de ejecución recomendada

1. Re-ejecutar `pnpm test:e2e` con la config ya guardada (Paso 1.1) → confirmar que los 29 pasan.
2. Aplicar 2.1 (CLS) y medir CLS con DevTools.
3. Aplicar 2.2 (peso: retirar `validation` del path crítico, verificar `forms`) y medir requests/MB.
4. Aplicar 2.3 (caché Netlify) y verificar headers.
5. Correr build + tests unitarios + E2E finales.

## Criterios de éxito

- **E2E:** 29/29 passing en 2+ corridas consecutivas.
- **CLS:** < 0,1 en la home (DevTools, throttle sin limitar).
- **Carga inicial:** reducción medida de requests/MB (objetivo: bajar el JS no-lazy de ~590 kB a ≈ 315 kB y eliminar
  del path crítico el peso de zod/RHF).
- **Caché:** assets con hash sirviéndose con `Cache-Control: ... immutable`.
```
