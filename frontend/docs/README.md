# Documentación Técnica — Frontend JEPLabs

Este directorio contiene las guías de arquitectura, estándares de ingeniería, especificaciones técnicas y el registro histórico del frontend.

---

## Metodología de Organización Documental

Para mantener la documentación limpia, predecible y evitar la obsolescencia técnica, los documentos se organizan según su **ciclo de vida**:

```text
frontend/docs/
├── README.md           # Índice maestro y estándar metodológico
├── guides/             # 1. Documentación Activa (Sistema actual en producción)
├── proposals/          # 2. Propuestas Técnicas y RFCs (Backlog futuro / Pendientes)
└── archive/            # 3. Archivo Histórico (Planes ya implementados y bitácoras)
```

### Reglas para Nuevos Documentos
1. **Guías Vivas (`guides/`)**: Si el documento describe cómo funciona el sistema actual, cómo operar una herramienta o estándares de código vigentes, debe guardarse en `guides/`.
2. **Propuestas y RFCs (`proposals/`)**: Si el documento es un diseño previo, investigación o plan de una funcionalidad que aún no se ha programado, debe guardarse en `proposals/`.
3. **Paso a Archivo (`archive/`)**: Cuando una propuesta de `proposals/` se implementa y despliega al 100%, su plan se mueve a `archive/` para preservar el contexto histórico sin confundir al equipo sobre el estado del código actual.

---

## 1. Guías Activas y Vigentes (`guides/`)

Documentos que reflejan el comportamiento real de la aplicación en el código base actual:

| Documento | Descripción |
|---|---|
| [arquitectura-jwt-doble-token.md](./guides/arquitectura-jwt-doble-token.md) | Gestión de autenticación: Access Token JWT en memoria, Refresh Token en cookie `HttpOnly` y refresco automático transparente. |
| [testing.md](./guides/testing.md) | Estrategia de testing en dos capas: pruebas unitarias/integración (Vitest, RTL, MSW) y E2E (Cypress). |
| [expiracion-carrito-checkout.md](./guides/expiracion-carrito-checkout.md) | Comportamiento del ciclo de vida del carrito, expiración deslizante y restauración ante HTTP `410 GONE`. |
| [sucursales-retiro-tienda.md](./guides/sucursales-retiro-tienda.md) | Integración de retiro en tienda, selección consciente en checkout y administración de sucursales. |
| [recuperacion-ordenes-checkout.md](./guides/recuperacion-ordenes-checkout.md) | Estrategia de resiliencia y recuperación de órdenes pendientes tras retornos de pasarelas (Webpay / QPayPro). |
| [evaluacion-seguridad.md](./guides/evaluacion-seguridad.md) | Auditoría de seguridad frontend, mitigación de vulnerabilidades XSS y cabeceras CSP. |
| [evaluacion-rendimiento.md](./guides/evaluacion-rendimiento.md) | Optimización de métricas Core Web Vitals (LCP, CLS), fuentes autoalojadas y división de chunks con Vite. |
| [testing-accesibilidad-axe.md](./guides/testing-accesibilidad-axe.md) | Pruebas de accesibilidad automatizadas con `vitest-axe` (`axe-core`), tipado TypeScript y hoja de ruta centrada en el viaje del usuario. |
| [pnpm.md](./guides/pnpm.md) | Guía del gestor de paquetes `pnpm`: instalación, configuración y resolución de dependencias. |

---

## 2. Propuestas Técnicas y Backlog (`proposals/`)

Diseños técnicos, RFCs y tareas planificadas pendientes de ejecución:

| Documento | Estado | Descripción |
|---|---|---|
| [especificacion-gestion-banners-home.md](./proposals/especificacion-gestion-banners-home.md) | Completado (Frontend y Backend Operativos) | Especificación técnica e integración completa del módulo de banners: API REST, Cloudinary, panel administrativo (`/admin/banners`), carrusel dinámico en Home y suite de accesibilidad WCAG 2.1 AA. |
| [plan-gestion-banners-home.md](./proposals/plan-gestion-banners-home.md) | Propuesta Histórica | Diseño arquitectónico conceptual previo a la creación del backend de banners. |
| [buscador-global-catalogo-multicampo.md](./proposals/buscador-global-catalogo-multicampo.md) | Completado (Frontend y Backend Operativos) | Especificación e implementación de búsqueda global multicampo, normalización diacrítica, ranking por relevancia y expansión dinámica de sinónimos. |
| [guia-frontend-buscador-multicampo.md](./proposals/guia-frontend-buscador-multicampo.md) | Completado (Integración Frontend 100%) | Guía de integración del buscador multicampo y módulo administrativo `/admin/sinonimos` (`/api/admin/busqueda/sinonimos`), invalidación de caché y pruebas WCAG 2.1 AA. |
| [plan-admin-categorias-arbol.md](./proposals/plan-admin-categorias-arbol.md) | Completado (Frontend y Backend Operativos) | Gestión del árbol de categorías en el panel de administración con Tree-Table colapsable, límite de 5 niveles, diagnóstico inline de integridad `409` y enlace directo de reasignación de productos. |
| [guia-frontend-categorias-arbol.md](./proposals/guia-frontend-categorias-arbol.md) | Completado (Alineación Frontend Implementada) | Guía de alineación técnica entre el endpoint `DELETE /api/categorias/{id}` y las 6 mejoras de resiliencia (`fetchWithAuth`, `ApiError`, UX `409`/`404`, caché y MSW) aplicadas en el frontend. |
| [retirar-stripe-mercadopago.md](./proposals/retirar-stripe-mercadopago.md) | Pendiente | Checklist operativo para la retirada definitiva de componentes simulados, schemas y llamadas legacy de Stripe y Mercado Pago. |
| [plan-rendimiento-e2e.md](./proposals/plan-rendimiento-e2e.md) | Propuesta | Mejoras y optimizaciones planificadas para los tiempos de ejecución de las pruebas E2E con Cypress. |
| [propuesta-backend-favoritos.md](./proposals/propuesta-backend-favoritos.md) | Propuesta / RFC | Solicitud al equipo de backend para la resolución dinámica de imágenes de productos en `/api/favoritos`. |
| [eslint-warnings.md](./proposals/eslint-warnings.md) | Deuda Técnica | Inventario y seguimiento de advertencias de linter pendientes de corrección. |

---

## 3. Archivo Histórico (`archive/`)

Planes de trabajo completados, diagnósticos resueltos y documentación de etapas previas:

| Documento | Tipo | Motivo de Archivo |
|---|---|---|
| [migracion-bulletproof-react.md](./archive/migracion-bulletproof-react.md) | Plan de Migración | Migración de 4 fases desde FSD hacia Bulletproof React completada con éxito. |
| [recomendaciones-equipo-bulletproof.md](./archive/recomendaciones-equipo-bulletproof.md) | Guía de Transición | Recomendaciones provisionales durante la migración; las carpetas legacy mencionadas ya fueron eliminadas. |
| [architecture-fsd-legacy.md](./archive/architecture-fsd-legacy.md) | Arquitectura Legacy | Especificación histórica de Feature-Sliced Design (`pages`, `widgets`, `entities`, `shared`). |
| [plan-pasarelas-webpay-qpaypro.md](./archive/plan-pasarelas-webpay-qpaypro.md) | Plan de Integración | Hoja de ruta para integrar Webpay Plus y QPayPro; pasarelas ya implementadas y operativas. |
| [plan-webpay-frontend.md](./archive/plan-webpay-frontend.md) | Plan Frontend | Especificación de retornos y confirmaciones de Transbank Webpay Plus; implementado. |
| [plan-admin-dashboard.md](./archive/plan-admin-dashboard.md) | Plan Frontend | Plan inicial del panel de control de administración; implementado. |
| [plan-checkout-pickup.md](./archive/plan-checkout-pickup.md) | Plan Frontend | Plan para el selector de sucursales en checkout; implementado. |
| [diagnostico-orden-pendiente-pasarela.md](./archive/diagnostico-orden-pendiente-pasarela.md) | Diagnóstico | Análisis del caso de borde de fallo en pasarela que dio origen a la guía de recuperación activa. |
| [propuesta-polling-qpaypro.md](./archive/propuesta-polling-qpaypro.md) | Diagnóstico | Propuesta para el polling de pagos en Guatemala; implementado en `useCheckoutLogic`. |
| [pruebas-webpay-plus.md](./archive/pruebas-webpay-plus.md) | Pruebas | Tarjetas de prueba y registros de validación inicial de Webpay Plus. |
| [payment-gateways-legacy.md](./archive/payment-gateways-legacy.md) | Guía Legacy | Primera versión de pasarelas simuladas previa a la integración real con Transbank y QPayPro. |
