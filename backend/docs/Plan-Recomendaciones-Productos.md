# Plan: Recomendaciones de productos

## Contexto

Objetivo: recomendar al cliente productos relacionados con lo que ha visto, sus favoritos y, en general, su comportamiento en la tienda.

Estado actual que condiciona el plan:

- Backend: Spring Boot 4 + Java 21 + JPA + Flyway + **PostgreSQL** (con pgvector como opción natural, sin infra nueva).
- Hoy **no se captura comportamiento del usuario**: no existen "vistas", "favoritos" ni "clicks". Solo hay transaccionales: `Orden`/`OrdenItem` (compras) y `Carrito`/`CarritoItem`.
- Catálogo pequeño/mediano. Equipo pequeño. Latencia objetivo de widgets: 100–200 ms p95.

Conclusión principal: el modelo es la parte fácil; lo crítico es **capturar eventos de comportamiento primero** y resolver el **cold start**. La progresión profesional 2026 es un embudo *retrieve → rank → rerank* que aquí se simplifica según la madurez de los datos.

## Principios rectores

1. **Precomputar y cachear, nunca calcular el ranking en el request.** Las recomendaciones cambian en horas, no en segundos.
2. **Datos antes que modelo.** Sin registro de eventos, los modelos predictivos no tienen de dónde aprender.
3. **Resolver el cold start desde el día 1** (usuarios nuevos y productos nuevos), es el error #1 de los equipos.
4. **Reglas de negocio separadas del algoritmo**: stock, estado activo, no repetir lo comprado, diversidad → se aplican SIEMPRE al final (rerank), sean heurísticas o ML.
5. **Explicar el porqué**: "Porque viste X" sube el CTR y la confianza.
6. **Medir con A/B** desde el inicio, no solo con intuición.
7. **Evolución incremental**: cada fase mejora la anterior sin romperla, y produce valor de forma autónoma.

## Arquitectura general (objetivo)

```
Frontend (widgets: producto, carrito, home)
        │  POST /api/eventos (fire & forget)
        ▼
Backend Spring ──► PostgreSQL
        │              ▲
        │              │ batch (diario/semanal)
        ▼              │
Servicio de recom. ──► jobs de entrenamiento
 (Caffeine cache)      (SQL / Python: ALS, embeddings)
        │
        ▼
Serving API: GET /api/recomendaciones (tipos: similares, personalizadas, trending)
```

Embudo en su versión mínima:

1. **Retrieve**: 2–3 fuentes en paralelo (co-compra, contenido/similitud, trending) → fusionar y deduplicar.
2. **Rank**: orden por score de la fuente (más adelante un modelo). 
3. **Rerank**: reglas de negocio (stock, activo, ya comprado, diversidad) + explicación.
4. **Feedback**: cada impresión y clic del widget se loguea (vuelve a la tabla de eventos).

---

## Fase 0 — Captura de eventos de comportamiento (crítico, ~1 semana)

Sin esto no hay fases 2–4. Incluye además dos features de negocio con valor inmediato: "favoritos" y "vistos recientemente".

### 0.1 Entidad `Favorito` (feature de negocio)

| Campo | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| usuario_id | FK usuario | |
| producto_id | FK producto | unique(usuario_id, producto_id) |
| creado_en | timestamp | |

Endpoints: `GET /api/favoritos`, `POST /api/favoritos/{productoId}`, `DELETE /api/favoritos/{productoId}` (requiere auth). Añadir botón corazón en la card del producto y la página de detalle.

### 0.2 Tabla de eventos de análisis (analítica, no relacional)

| Campo | Tipo | Notas |
|---|---|---|
| id | bigserial PK | |
| usuario_id | bigint NULL | FK usuario; NULL = anónimo |
| sesion_id | uuid NOT NULL | cookie/header anónimo |
| producto_id | bigint FK | |
| tipo | varchar | `VISTO`, `FAVORITO`, `QUITADO_FAVORITO`, `AGREGADO_CARRITO`, `COMPRADO`, `IMPRESION`, `CLICK_RECOMENDACION` |
| contexto | varchar NULL | url / widget de origen |
| creado_en | timestamptz | index (usuario_id, tipo), (producto_id), (creado_en) |

- Migración Flyway nueva (`V{next}__crear_eventos_comportamiento.sql`).
- Endpoint `POST /api/eventos` **sin autenticación**, fire-and-forget (el frontend no espera respuesta). El backend resuelve `usuario_id` si hay JWT, y genera/persiste `sesion_id` (cookie `_ses` de 30 días) para anónimos.
- El frontend dispara eventos en: vista de detalle (`VISTO`), toggle favorito, añadir al carrito, impresión de widget (`IMPRESION` con ids) y clic (`CLICK_RECOMENDACION` con origen). La mitad de estos eventos requiere tocar `ProductoDetail`, `ProductCard` y `CartDrawer` — mantenerlos **desacoplados** (util `trackEvent()` en shared).

### 0.3 Widget "Vistos recientemente" (valor inmediato)

Con los eventos `VISTO` se sirve gratis: `GET /api/productos/vistos-recientes` → últimos 8 distintos del usuario/sesión. Casi cero esfuerzo, buen ROI y además entrena al usuario a "tocar" el botón corazón (feedback explícito).

**Criterio de salida**: se registran eventos de producción, el widget de vistos recientes funciona, y hay tests del nuevo endpoint de eventos.

---

## Fase 1 — Heurísticas en SQL (sin ML, ~1–2 semanas)

Aprovecha datos que YA existen. Es la base sobre la que se apoyan las fases siguientes.

### 1.1 "Quienes compraron esto también compraron" (co-compra)

SQL sobre `OrdenItem` agrupando por `Orden.id` (solo órdenes `CONFIRMADA`), contando co-ocurrencias por par de productos y normalizando por popularidad (evitar que los más vendidos dominen):

```sql
SELECT oi1.producto_id AS origen, oi2.producto_id AS destino,
       COUNT(*) / POWER(COUNT(DISTINCT oi1.producto_id || oi2.producto_id), 0.5) AS score
FROM orden_item oi1
JOIN orden o ON oi1.orden_id = o.id
JOIN orden_item oi2 ON oi2.orden_id = o.id AND oi2.producto_id <> oi1.producto_id
WHERE o.estado = 'CONFIRMADA'
GROUP BY oi1.producto_id, oi2.producto_id
```

Puede alimentarse también de `CarritoItem` (más volumen, más ruido) y de eventos `AGREGADO_CARRITO` cuando existan. Resultado: tabla `co_compra(origen, destino, score)`.

### 1.2 "Similares a lo que viste" (contenido)

Score basado en **jerarquía de categoría compartida** (usar ancestros, no solo la hoja) + precio dentro de rango ±50% + overlap de atributos/tags del producto. Los productos tienen categorías jerárquicas (`Categoria.subcategorias`), lo cual permite escalar la similitud de "misma subcategoría" a "misma familia".

### 1.3 Trending (fallback cold start)

Más vendidos / más vistos de los últimos 7–30 días con normalización. Es lo que ve un usuario sin historial.

### 1.4 API de serving

- `GET /api/productos/{id}/similares` → 1.2 (siempre disponible, incluso sin historial).
- `GET /api/productos/{id}/tambien-compraron` → 1.1 (requiere historial; fallback a similares).
- `GET /api/recomendaciones` (autenticado o con sesión) → personalizada: mezcla ponderada de los productos por los que el usuario mostró interés + trending para rellenar. Con etiqueta de razón (`SIMILAR_A_LO_QUE_VIDO`, `TENDENCIA`, `QUIENES_COMPRARON_TAMBIEN_COMPRARON`).
- `GET /api/recomendaciones/trending`.

Todos aplican el **rerank** común: solo productos `EstadoProducto.ACTIVO`, con stock, sin los ya comprados (excepto configuración de recurrentes), deduplicados, y diversidad (máx. 2–3 por categoría en los primeros puestos).

### 1.5 Cache

Caffeine en el backend con TTL: similares/co-compra (por producto) 1–6 h; trending 30 min; personalizada 15–30 min. Las tablas precomputadas de 1.1 se recalcula con un `@Scheduled` diario.

**Criterio de salida**: los 3 widgets (producto, home, carrito) en producción con razón visible, latencia p95 < 200 ms, y A/B (con/sin recomendaciones) midiendo CTR y conversión.

---

## Fase 2 — Filtrado colaborativo item-item (comportamiento, ~1 semana)

Cuando haya volumen de interacciones (umbral orientativo: miles de eventos y decenas de usuarios con ≥3 interacciones).

- Matriz usuario→item con pesos (COMPRADO=5, AGREGADO_CARRITO=3, FAVORITO=2, VISTO=1, decayendo con el tiempo).
- Similitud de coseno entre items → tabla `similar_items(producto_id, similar_id, score)` top-K por item.
- Se implementa con una query de agregación (Python o SQL) en un job nocturno; sirve "usuarios como tú" sin entrenar redes.
- Refina la fuente "personalizada" de la Fase 1: añade items similares a los interactuados por el usuario, ponderados por la similitud.

**Criterio de salida**: la fuente CF alimenta la mezcla de la Fase 1, con A/B mostrando mejora de CTR frente a la versión solo-heurística.

---

## Fase 3 — Embeddings + pgvector (ML, 2–3 semanas, donde entra tu background de DS)

### 3.0 Preparar pgvector

Migración Flyway: `CREATE EXTENSION IF NOT EXISTS vector;` y tablas de embeddings.

### 3.1 Ruta A — Semántica de contenido (texto)

Embeddings del producto (nombre + descripción + categoría + marca). Recomendado: modelo multilingüe local `intfloat/multilingual-e5-small` (buen costo/calidad en español, corre en CPU con ONNX) o `text-embedding-3-small` si se prefiere API managed. Índice HNSW sobre pgvector con `vector_cosine_ops`.

- Ventaja clave: "más como esto" funciona **desde el día 1** para productos nuevos sin interacciones (resuelve cold start de items).
- Job diario que re-embebe productos nuevos/modificados (a diferencia de los embeddings de interacción, estos no requieren historial).

### 3.2 Ruta B — ALS / matrix factorization (interacciones)

Con el histórico de eventos de la Fase 0:

- Job offline (Docker + Python, librería `implicit`) que entrena ALS sobre la matriz usuario→item con pesos.
- Escribe **item embeddings** en pgvector (índice HNSW) y **user embeddings** en una tabla por usuario.
- Serving: user vector → ANN (10–30 ms) → candidatos. Retrain diario/semanal; el índice HNSW se reconstruye tras cada corrida.
- Cold start de usuario: sin embedding → caer a la mezcla de la Fase 1/2 (nunca romper el request).

### 3.3 Mezcla final (retrieve multi-fuente)

En el serving se consultan en paralelo: (1) CF/ALS item-item, (2) semántica de contenido, (3) co-compra, (4) trending. Se fusionan con RRF (Reciprocal Rank Fusion) o pesos, se deduplican y se re-rankean con las reglas de negocio. Una fuente no debe poder "matar" el endpoint: si algo falla, se degrada a la Fase 1.

**Criterio de salida**: las fuentes vectoriales reemplazan/moderan a las heurísticas según mejore CTR en A/B; latencia p95 < 200 ms; alertas de drift y freshness del índice.

---

## Fase 4 — Ranker (opcional, a 12–24 meses)

Si el volumen lo justifica (>=100k eventos y decenas de miles de usuarios): embudo completo con **LightGBM/XGBoost** como ranker sobre las features user×item (historial, recencia, categoría, precio, cross-features tipo "interacciones previas con esta marca"), feature store simple (mismas queries para train y serve → sin skew), y reevaluación con nDCG + A/B. Es el estado del arte, pero para la escala actual es overkill y debe entrar solo cuando los datos lo pidan.

---

## Frontend (transversal a Fases 1–3)

- **Página de producto**: "Productos similares" (1.2/3.1) + "Quienes compraron esto también compraron" (1.1).
- **Home**: "Recomendado para ti" (personalizada; fallback trending si no hay historial).
- **Carrito**: "Quizás también te interese" (basado en items del carrito, co-compra).
- **Explicabilidad**: cada tarjeta muestra su razón ("Porque viste X", "Quienes compraron Y también compraron", "Tendencia").
- **Eventos**: `trackEvent()` desacoplado en shared; IMPRESION + CLICK_RECOMENDACION para el feedback loop.
- Todos los widgets son componentes Feature-FSD (`widgets/recommendations/...`), con skeletons y estado de error (fallback a trending o nada).

## Evaluación y A/B

- **Offline** (por fase): precision@k y recall@k sobre hold-out; nDCG cuando exista ranker. Umbral mínimo antes de lanzar cada fuente.
- **Online**: A/B simple 50/50 (por usuario o sesión). Métricas: CTR del widget, tasa de conversión, ticket promedio (AOV) e ingresos por sesión. Dashboard con comparación de variantes.
- **Monitoreo**: latencia p95/p99 por endpoint, % de respuestas con fallback (cold start), freshness del índice, tasa de eventos descartados.

## Estimación (1–2 devs)

| Fase | Tiempo | Entrega |
|---|---|---|
| 0. Eventos + favoritos + vistos | 1 semana | base de datos y tracking |
| 1. Heurísticas + API + widgets | 1–2 semanas | recomendaciones en producción |
| 2. CF item-item | 1 semana | mejora de personalización |
| 3. pgvector + ALS + semántica | 2–3 semanas | fuentes ML con ANN |
| 4. Ranker (opcional) | 2–4 semanas | solo si el volumen lo justifica |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Poco volumen de interacciones → CF/ALS mediocre | No forzar fases 2–3 hasta superar umbrales; la Fase 1 ya da valor. |
| Cold start descuidado | Trending + semántica de contenido desde el día 1; exploración 5–10%. |
| Descripciones pobres → embeddings malos | Mejorar calidad de datos de catálogo antes de invertir en embeddings. |
| Dos mundos (Python + Spring) | Orquestar jobs en Docker + scheduler; contratos claros sobre tablas. |
| Latencia / degradación | Precomputar, cachear, y degradar a heurísticas si una fuente falla. |
| Privacidad (datos anónimos y de sesión) | Solo lo necesario, retención acotada, documentar en política de datos. |

## Qué NO hacer

- Recomendar productos sin stock o inactivos.
- Volver a recomendar lo ya comprado (salvo config de recurrentes).
- Calcular el ranking dentro del request.
- Lanzar una fuente ML sin A/B que la respalde.
- Ignorar a los usuarios anónimos (suelen ser la mayoría del tráfico) — por eso existe `sesion_id`.
- Mezclar embeddings de modelos distintos en el mismo índice (inconsistencia silenciosa).
