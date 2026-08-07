# Documentación — Frontend JEPLabs

Guías complementarias al [README](../README.md) principal.

| Documento | Descripción |
|-----------|-------------|
| [architecture-fsd.md](./architecture-fsd.md) | Arquitectura Feature-Sliced Design, capas, entities, mapeo legacy y convenciones del código |
| [pnpm.md](./pnpm.md) | Instalación de pnpm, migración desde npm, scripts y troubleshooting |
| [eslint-warnings.md](./eslint-warnings.md) | Inventario de warnings ESLint (React Hooks), impacto en rendimiento y registro de avances |
| [payment-gateways.md](./payment-gateways.md) | Pasarelas de pago: demo (Stripe, Webpay, Mercado Pago) e integración real |
| [pruebas-webpay-plus.md](./pruebas-webpay-plus.md) | Guía para probar Webpay Plus real desde el frontend: tarjetas de prueba y flujo |
| [retirar-stripe-mercadopago.md](./retirar-stripe-mercadopago.md) | Guía operativa para retirar Stripe y Mercado Pago del frontend: checklist, archivos y cobertura |
| [testing.md](./testing.md) | Testing: stack, buenas prácticas, plan de cobertura por fases, fixtures |

## Convención

- **`README.md`** (raíz de `frontend/`) — punto de entrada: stack, inicio rápido, arquitectura resumida.
- **`docs/`** — referencia detallada y guías operativas que no van en el README.

Para documentación del monorepo completo (backend, despliegue, etc.), ver el [README](../../README.md) en la raíz del repositorio.
