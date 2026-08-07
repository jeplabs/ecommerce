# Plan: Asistente conversacional (chatbot RAG) integrado al e-commerce

## Contexto y decisión

Objetivo: un chatbot que ayude realmente al cliente — responde sobre **productos del catálogo** y sobre **políticas** (pago, envío, devoluciones), hace **recomendaciones** y, en fases posteriores, usa búsqueda web (Tavily) como complemento.

Antecedentes del equipo: ya existe un agente RAG académico funcional (LangChain + LangGraph + ChromaDB + SQLite + Python + Cohere + Streamlit) entrenado sobre PDFs de políticas. Se reutiliza el stack **sin Streamlit** (el frontend ya es React + TS). El equipo además tiene experiencia previa en dos patrones de integración de ML:
1. **Modelos como microservicio FastAPI consumidos por Spring** (proxy HTTP).
2. **Modelos ONNX embebidos directamente en Spring** (sin microservicio).

Estado actual del proyecto:

- Backend: Spring Boot 4 + Java 21 + JPA + Flyway + **PostgreSQL** (monolito desplegado en un host propio).
- Frontend: React 19 + TypeScript + Vite (Netlify).
- La información de políticas existe en `backend/docs` (markdown) y reglas de negocio; el catálogo vive estructurado en PostgreSQL (`producto`, `categoria`).
- Existe un plan de recomendaciones (`Plan-Recomendaciones-Productos.md`) que el chatbot podrá consumir como herramienta.

## Regla de oro: catálogo por tools, políticas por RAG

El error más común es hacer RAG sobre todo. Hay dos mundos distintos:

1. **Catálogo (estructurado, en PostgreSQL): el agente NO hace RAG.** Llama **tools** que consultan la DB en vivo:
   - `buscar_productos(query, categoria, precioMin, precioMax)` → search del catálogo.
   - `obtener_producto(id)` → detalle (precio, stock, imágenes, categoría).
   - `recomendar(usuarioId)` / `similares(productoId)` → reutiliza el motor de recomendaciones.
   - Beneficio: nunca hay stock/precio desactualizado ni alucinaciones sobre datos estructurados.

2. **Políticas (documentos): sí, RAG.** Se ingieren los documentos (los `.md` de `backend/docs`, PDFs, FAQ, términos y condiciones) → chunking → embeddings → ChromaDB (o pgvector) → retrieval → **Cohere Rerank** → respuesta con **citas** ("Según nuestras políticas de envío…"). El agente responde solo desde lo recuperado y declina cuando no hay respuesta.

## Arquitectura objetivo

```
React (widget de chat flotante)
   │  POST /api/chat  → SSE (tokens en vivo)
   ▼
Spring Boot (proxy + auth JWT + historial + rate limit + limpieza)
   │  HTTP interno de streaming (SSE/chunked)
   ▼
FastAPI sidecar (LangGraph agent)   [o Spring AI, ver comparativa]
   ├── tools de catálogo  → PostgreSQL (vía repo/SQL)
   ├── tools de recomendación → /api/recomendaciones (mismo motor del plan de recs)
   ├── RAG de políticas  → ChromaDB (docs) + Cohere Rerank
   ├── (Fase 3) tool de web → Tavily (con citas obligatorias)
   └── modelo: Cohere Command R (tool calling)
```

## Contrato SSE (streaming del chat)

### Decisión de diseño

- **Un solo `POST /api/chat` que devuelve `text/event-stream`.** Es el contrato más simple (sin cola de trabajos ni segundo endpoint) y suficiente para el volumen de un e-commerce pequeño.
- El frontend consume con `fetch` + `ReadableStream` (EventSource no soporta POST). Reconexión manual con `Last-Event-ID` y cabecera `retry: 3000`.
- *Alternativa si se prefiere reconexión automática de EventSource*: `POST` → `202 {conversacionId, mensajeId}` y luego `GET /api/chat/{id}/messages/{mensajeId}/stream`. Coste: dos endpoints y una cola ligera en Spring. Documentada como variante, no recomendada para el MVP.

### Endpoint

```
POST /api/chat
Content-Type: application/json
Authorization: Bearer <jwt>            // opcional; si no hay JWT se usa sesión anónima
Cookie: _ses=<uuid>                    // sesión anónima (misma cookie del plan de recs)

{
  "conversacionId": 12,                // opcional: null/omitir para nueva conversación
  "mensaje": "¿Cuánto cuesta el producto X?"
}
```

Respuesta `200 text/event-stream`:

```
retry: 3000

event: meta
data: {"conversacionId":12,"mensajeId":34,"titulo":"Nueva conversación"}

event: delta
data: {"texto":"El producto X cuesta "}

event: delta
data: {"texto":"$49.990"}

event: delta
data: {"texto":"."}

event: sources
data: {"fuentes":[{"titulo":"Política de envío","url":"/docs/envio","tipo":"DOC","relevancia":0.91}]}

event: done
data: {"mensajeId":34,"tokens":180,"duracionMs":1420}
```

- `delta`: se emite por fragmento (palabra o chunk). El cliente concatena.
- `sources`: citas/fuentes para mostrar como enlaces o acordeón.
- `done`: fin normal de la conversación; incluye métricas para telemetría.
- Heartbeat: comentario `: ping` cada 15 s para evitar timeouts de proxies.
- Timeout del `SseEmitter` de Spring: 60 s de inactividad.

### Errores

- Errores de validación/auth/rate limit → **HTTP puro** (400, 401, 429) sin stream.
- Fallo del agente a mitad del stream → `event: error` y cierre:

```
event: error
data: {"codigo":"AGENT_TIMEOUT","mensaje":"El asistente no está disponible ahora. Intenta de nuevo o escríbenos."}
```

| Código | HTTP | Cuándo |
|---|---|---|
| `UNAUTHORIZED` | 401 | JWT inválido (si es requerido) |
| `VALIDATION` | 400 | mensaje vacío o demasiado largo |
| `RATE_LIMITED` | 429 | excede el rate limit por minuto |
| `AGENT_UNAVAILABLE` | 200+error | sidecar caído (degradación amable) |
| `AGENT_TIMEOUT` | 200+error | excedió el timeout de razonamiento |
| `CONTEXT_TOO_LONG` | 200+error | conversación excede el máximo (se sugiere nuevo chat) |

### Otros endpoints

- `GET /api/chat` — historial del usuario/sesión (lista de conversaciones, autenticado).
- `GET /api/chat/{conversacionId}` — detalle de una conversación (mensajes + fuentes).
- `DELETE /api/chat/{conversacionId}` — borrar conversación.

## Historial, esquema de migración y limpieza

### Migración Flyway `V22__create_chat.sql`

```sql
-- Conversaciones de chat (una por "hilo")
CREATE TABLE chat_conversacion (
    id             BIGSERIAL PRIMARY KEY,
    usuario_id     BIGINT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    sesion_id      UUID NULL,                     -- anónimos (misma lógica del plan de recs)
    titulo         VARCHAR(120) NULL,             -- primera pregunta resumida
    estado         VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',  -- ACTIVA | ARCHIVADA
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_conversacion_usuario ON chat_conversacion(usuario_id, actualizado_en DESC);
CREATE INDEX idx_chat_conversacion_sesion  ON chat_conversacion(sesion_id, actualizado_en DESC);

-- Mensajes de cada conversación (historial completo, para contexto y auditoría)
CREATE TABLE chat_mensaje (
    id              BIGSERIAL PRIMARY KEY,
    conversacion_id BIGINT NOT NULL REFERENCES chat_conversacion(id) ON DELETE CASCADE,
    rol             VARCHAR(10) NOT NULL,          -- USER | AGENT
    contenido       TEXT NOT NULL,
    fuentes         JSONB NULL,                    -- citas/sources devueltas por el agente
    tool_calls      JSONB NULL,                    -- auditoría: qué tools llamó el agente
    tokens          INT NULL,                      -- costo del turno
    duracion_ms     INT NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_mensaje_conversacion ON chat_mensaje(conversacion_id, creado_en);
```

### Configuración (`application.properties` + `.example`)

```
api.chat.retencion-dias=30            # borrar mensajes más viejos que esto
api.chat.inactividad-dias=60          # archivar conversaciones sin actividad
api.chat.max-mensajes=40              # máx. mensajes por conversación (archivar y abrir nueva)
api.chat.ventana-contexto-mensajes=20 # últimos N turnos enviados al agente
api.chat.rate-limit-mensajes-minuto=10
api.chat.agent-url=http://localhost:8100
api.chat.agent-timeout-ms=30000
```

### Limpieza (job `@Scheduled`, igual que el de carrito)

```java
@Scheduled(cron = "0 15 4 * * *")   // 04:15 UTC diario
public void limpiarHistorial() {
    // 1. DELETE chat_mensaje WHERE creado_en < now() - retencion-dias
    // 2. DELETE chat_conversacion WHERE estado='ACTIVA'
    //      AND actualizado_en < now() - inactividad-dias
    //    (los mensajes caen por CASCADE)
    // 3. UPDATE chat_conversacion SET estado='ARCHIVADA'
    //      WHERE (SELECT count(*) FROM chat_mensaje ...) > max-mensajes
    // 4. DELETE chat_mensaje WHERE conversacion_id IN (
    //      SELECT id FROM chat_conversacion WHERE estado='ARCHIVADA' ) -- compactar
}
```

- **Ventana de contexto**: al llamar al agente, Spring envía los últimos `ventana-contexto-mensajes` turnos completos. Si la conversación es muy larga, se envía además un **resumen** (generado por el agente) en lugar del historial completo → controla costo y calidad.
- **Anónimos**: mismos `sesion_id` del plan de recomendaciones; usuarios logueados ven su historial con `GET /api/chat`.

## Comparativa: FastAPI sidecar vs Spring AI (para decidir en equipo)

El equipo ya ha hecho **ambos patrones** en proyectos previos (FastAPI consumido por Spring, y ONNX embebido en Spring). Esto no es un tema de capacidad, sino de qué encaja mejor con este proyecto.

### Las dos opciones

- **Opción A — Sidecar Python (FastAPI + LangGraph)**: el agente vive en un servicio Python aparte; Spring lo consume por HTTP interno.
- **Opción B — Spring AI dentro del backend**: el agente se implementa en Java/Spring con Spring AI (ChatClient + tool calling + RAG abstractions). No hay segundo deployable.

### Comparativa por dimensión

| Dimensión | A: FastAPI sidecar | B: Spring AI en Spring |
|---|---|---|
| **Reutiliza el agente académico** | Sí, casi tal cual (LangGraph/Chroma/Cohere) | No; se reescribe en Java |
| **Orquestación de agentes (multipaso)** | LangGraph: madura, grafos, memory, human-in-the-loop | Spring AI: creciente; bien para chat simple, más manual para grafos complejos |
| **Curva de aprendizaje del equipo** | Baja (ya lo usan) | Media-alta (Spring AI es relativamente nuevo) |
| **Latencia** | +1 hop HTTP interno (~5–20 ms; despreciable) | Mínima (mismo proceso) |
| **Deploy / infraestructura** | 1 servicio + 2 runtimes (JVM + Python) | 1 solo artefacto (JAR) |
| **Mantenimiento operativo** | Más piezas: dependencias Python, venv/imagen, versión de LangChain | Menos piezas móviles; ecosistema Java de agentes más chico |
| **Modelos pequeños (embeddings/rerank) locales** | Fácil en Python (sentence-transformers, ONNX Runtime) | También posible (ONNX Runtime Java, ya lo probaron) — ver nota |
| **Observabilidad y evals** | LangSmith: de serie con LangGraph (traces, datasets, evals) | Spring AI observability + construir evals propios |
| **Testing** | Tests Python del agente + tests de integración Spring con `MockWebServer` | Una sola suite de tests (Spring) |
| **Reutiliza auth JWT / infra de Spring** | Vía proxy (Spring valida JWT, sesión y rate limit antes de llamar al agente) | Directamente en el mismo proceso |
| **Community / docs** | Ecosistema enorme | Ecosistema creciente |
| **Riesgo de churn de dependencias** | LangChain/LangGraph cambian rápido (pinning de versiones) | Menor ritmo de cambio |
| **Integración con el plan de recomendaciones** | Igual en ambos (el agente llama `GET /api/recomendaciones` via HTTP) | |

### Nota sobre la tercera opción que ya probaron (ONNX en Spring)

- **ONNX embebido sirve para modelos pequeños** (embeddings de texto, reranker). Es **ortogonal** a la decisión A/B: se puede usar en cualquiera de los dos mundos (Python con ONNX Runtime, o Java con ONNX Runtime — como ya hicieron).
- Para el **LLM** (el que razona), ONNX no aplica salvo que se quiera **auto-hospedar un modelo open source** (Mistral/Llama vía `llama.cpp`, vLLM u ONNX). Es una tercera vía real: cero dependencia de API (Cohere), privacidad total y costo de inferencia fijo, a cambio de hardware (GPU recomendada), tuning y calidad a validar. Se documenta como **variante futura**, no para el MVP: Cohere API es más rápida de poner en pie y con mejor calidad garantizada.
- **Posible arquitectura híbrida recomendable**: LLM por Cohere API + embeddings/rerank locales (ONNX, en donde sea más cómodo) para no pagar por cada embedding y bajar latencia.

### Cómo decidir en equipo (spike de 1 semana)

1. **Día 1–2**: lado Spring — implementar `POST /api/chat` de eco con `SseEmitter` y las tablas de migración. Da igual la opción, este tramo es común.
2. **Día 3**: rama A — portar el agente académico a FastAPI sin Streamlit, tools de catálogo, y proxy SSE.
3. **Día 4**: rama B — mismo contrato con Spring AI (ChatClient + Cohere + una tool de catálogo + RAG básico con pgvector).
4. **Día 5**: comparar en la demo: latencia percibida, esfuerzo, mantenibilidad, streaming, evals. Decidir con los criterios de la tabla de abajo.

### Criterios de evaluación de la implementación (referencia para decidir)

| Criterio | Meta aceptable |
|---|---|
| Latencia primer token | < 1.5 s |
| Latencia respuesta completa | < 8 s (promedio) |
| Streaming continuo (sin cortes) | 100% de conversaciones largas |
| Evals (groundedness + catálogo) | ≥ 90% de respuestas correctas en el dataset |
| Alucinación de precio/stock | 0 (catálogo solo por tools) |
| Tiempo de un cambio de prompt/rag | < 1 h en dev |
| Nuevo deploy del agente | < 5 min (rollback incluido) |
| Costo por conversación promedio | presupuesto definido (ver Costos) |
| Fallback ante caída del agente | respuesta amable + contacto humano |

## Secuencia de un turno de chat

```
Cliente                  Spring Boot                          Sidecar agente
  │ POST /api/chat          │                                     │
  ├────────────────────────►│ valida JWT/sesión, rate limit       │
  │                         │ guarda msg USER (PG)                │
  │                         │ llama agente (últimos N turnos)     │
  │                         ├────────────────────────────────────►│
  │                         │   streaming de tokens (SSE)         │
  │                         │◄────────────────────────────────────┤
  │                         │ guarda msg AGENT + fuentes + tools  │
  │   SSE: meta/delta/sources/done                                │
  │◄────────────────────────┤                                     │
  │                         │ job de limpieza diario (retención)  │
```

## Frontend (React)

- Widget flotante tipo chat (esquina inferior derecha), Feature-FSD `widgets/chat/...`.
- Consume el **SSE del backend** con `fetch` + `ReadableStream`; renderiza tokens en streaming; reconexión con `Last-Event-ID` + `retry`.
- **Sanitiza el HTML/markdown** de la respuesta (no confiar en el render crudo del modelo).
- Botón de "nuevo chat", indicador de "escribiendo…", estado de error y fallback ("escríbenos a soporte").
- Desacoplado del agente: solo habla con el contrato de Spring.

## Seguridad y guardrails

1. **Tools de solo lectura** para el MVP: nada de modificar precios/stock/órdenes. No exponer endpoints de admin al agente.
2. **Prompt injection**: system prompt con identidad y límites; el agente ignora instrucciones fuera de alcance; no revela prompts ni secrets.
3. **Datos sensibles**: el chat jamás debe pedir/almacenar datos de tarjeta (se redirige al checkout). No loguear PII innecesaria.
4. **Rate limiting** en el proxy Spring (por usuario/sesión/IP) para controlar costo y abuso.
5. **Keys** (Cohere, Tavily) en secrets del host / variables de entorno — nunca en el repo (patrón `application-*.properties.example`).

## Evaluación y evals

- **LangSmith** (o Spring AI observability, según opción) para tracing de cada conversación: tool calls, retrieval, tokens, duración.
- **Dataset de evaluación** (~50–100 preguntas): políticas ("¿Cuál es el plazo de envío?", "¿Cómo pago por transferencia?", "¿Puedo cancelar mi pedido?") y catálogo ("¿Tienen zapatillas running?", "¿Cuánto cuesta el producto X?"). Con respuestas de referencia.
- Métricas: **groundedness** (¿responde solo con fuentes?), answer relevance, correcta invocación de tools, ausencia de alucinaciones.
- **Gate por fase**: no se publica sin pasar los evals y un test manual de casos difíciles (fuera de alcance, inyección de prompt, información no encontrada → declinar).

## Fases con criterio de salida

### Fase 0 — Fundaciones (1 semana)
- Sidecar FastAPI con `/health` y agente mínimo de eco (sin RAG aún) — o rama Spring AI del spike.
- Proxy Spring `POST /api/chat` con SSE, auth JWT, rate limit; tablas de historial (V22) + job de limpieza.
- Widget de chat flotante con streaming SSE.
- **Salida**: chat end-to-end (React → Spring → agente → React) en dev, con historial persistido y limpieza funcionando.

### Fase 1 — Asistente de lectura (catálogo + políticas) (2 semanas)
- Tools de catálogo (buscar/obtener producto, categorías) contra PostgreSQL.
- Ingesta de documentos de políticas (`.md` de backend/docs + PDFs + FAQ) → Chroma + Cohere Rerank + citas.
- System prompt de identidad cordial y guardrails; respuestas con fuentes.
- Evals + dataset de políticas y catálogo.
- **Salida**: respuestas correctas y con citas en los dos dominios; declina lo que no sabe; evals en verde.

### Fase 2 — Personalización y recomendaciones (1–2 semanas)
- Tools que reutilizan el motor de recomendaciones: `recomendar(usuarioId)`, `similares(productoId)`, contexto de favoritos y vistos recientes.
- El agente entrega recomendaciones explicadas ("Según lo que viste, te sugiero…").
- **Salida**: recomendaciones conversacionales; evals con casos de recomendación.

### Fase 3 — Complementos (opcional, escalonado)
- **Tavily** (búsqueda web) como fuente secundaria SOLO para información externa en tiempo real (estado de envíos de courier, etc.), con citas obligatorias y evals que detecten info no fiable. NO para políticas ni catálogo.
- Acciones controladas con confirmación (ej. consultar estado de pedido del usuario autenticado).
- Análisis: qué preguntan los clientes → mejorar FAQ y políticas.
- Variante futura: auto-hospedaje del LLM (llama.cpp/vLLM) para reducir dependencia de API.

## Despliegue

- **Dev**: sidecar Python corriendo en local junto a Spring (mismo `application-dev`).
- **Prod**: servicio Python en el mismo host que Spring (docker-compose o systemd), accesible solo por red interna (Spring hace proxy). Alternativa managed: LangGraph Platform (menos ops, dependencia del vendor — evaluar).
- **CI/CD**: pipeline para el sidecar (lint + tests + evals) y para Spring (tests + integración con `MockWebServer`).

## Costos aproximados (ecommerce pequeño)

- Cohere Command R (chat con tools), embed v4, Rerank: orden de decenas de $/mes según volumen; controlable con rate limit, ventana de contexto y límite de mensajes por conversación.
- Tavily: free tier suficiente para probar; plan de pago bajo si se adopta.
- ChromaDB: gratis (self-hosted). LangSmith: free tier para dev.
- Si se auto-hospeda el LLM (variante futura): costo de hardware fijo en vez de por-token.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Alucinaciones en catálogo/precios | Catálogo SOLO por tools (DB en vivo), nunca RAG. Evals de groundedness. |
| Alucinaciones en políticas | RAG con citas + Rerank + declinar cuando no hay respuesta. |
| Prompt injection | System prompt con límites, tools whitelisted, sin acciones de escritura. |
| Costo descontrolado | Rate limit, ventana de contexto, límite de mensajes por conversación. |
| Datos de políticas desactualizados | Re-ingesta al cambiar docs (job manual o al commit); versionar fuente en metadata. |
| Tavily trae info incorrecta | Solo fase 3, con citas y evals; no usar para catálogo/políticas. |
| Sidecar caído | Fallback amable + "hablar con un humano"; `/health` y alertas. |
| Historial crece | Job de retención + archivo de conversaciones largas. |
| Churn de versiones de LangChain | Pinning de dependencias, evals de regresión, contenedor inmutables. |

## Qué NO hacer

- No exponer el agente Python públicamente (siempre detrás del proxy Spring con auth).
- No hacer RAG del catálogo ni de datos estructurados.
- No dejar que el chatbot ejecute acciones sin confirmación (ni al principio, acciones de escritura).
- No renderizar el HTML del modelo sin sanitizar.
- No publicar sin evals ni sin fallback humano.
- No acumular historial indefinidamente.
- No mezclar embeddings de modelos distintos en el mismo índice.
