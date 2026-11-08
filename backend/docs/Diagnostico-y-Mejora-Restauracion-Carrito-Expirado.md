# Diagnóstico Técnico y Propuesta de Mejora: Detección y Restauración de Carritos Expirados

Este documento detalla el diagnóstico técnico sobre por qué los carritos de compra que expiran en segundo plano no muestran el aviso de expiración ni la opción de restauración al regresar tras varias horas, y formaliza las recomendaciones de diseño y mejores prácticas tanto para el Backend como para el Frontend.

---

## 1. Contexto y Arquitectura Prevista

La plataforma cuenta con un modelo de **Retención en 2 Etapas (*Soft-Expire*)** documentado en [`Retencion-y-Purga-Fisica-Carrito.md`](./Retencion-y-Purga-Fisica-Carrito.md):
- **Expiración de reserva (30 a 60 min):** El carrito vence para no retener indefinidamente el stock en bodega. El registro pasa a estado `EXPIRADO`, pero las filas en `carritos` y `carrito_items` **se conservan intactas durante 30 días** (`api.carrito.dias-retencion-expirados=30`).
- **Propósito de Negocio y UX:** Si un cliente regresa horas o días después, la plataforma debe detectar el carrito expirado y ofrecerle restaurar sus productos mediante `POST /api/carrito/restaurar` (revalidando precios y stock vigentes).

---

## 2. Diagnóstico del Problema

El frontend depende del flag booleano `expiracion.carritoAnteriorExpirado` (devuelto por `GET /api/carrito`) para decidir si muestra el modal de restauración [`CartExpiredModal`](../../frontend/src/features/cart/components/CartExpiredModal/CartExpiredModal.tsx).

Actualmente, existen dos flujos divergentes según el momento en que el usuario regresa:

```mermaid
flowchart TD
    A["Cliente regresa a la tienda tras inactividad"] --> B{"¿Cuándo regresa?"}
    
    B -->|Caso A: Antes de que el Scheduler marque el carrito| C["Carrito en BD sigue con estado 'ACTIVO' pero expira_at vencido"]
    C --> D["CarritoService.obtenerOCrearCarritoVigente() detecta c.estaExpirado()"]
    D --> E["Marca carrito como EXPIRADO y genera nuevo carrito"]
    E --> F["Retorna carritoAnteriorExpirado = TRUE"]
    F --> G["Frontend muestra Modal de Restauración ✅"]
    
    B -->|Caso B: Horas o días después (Scheduler ya corrió)| H["CarritoScheduler ya cambió el estado a 'EXPIRADO' en BD"]
    H --> I["CarritoService ejecuta findByUsuarioIdAndEstado(ACTIVO)"]
    I --> J["No encuentra nada: cae en .orElseGet()"]
    J --> K["Crea nuevo carrito activo pero retorna carritoAnteriorExpirado = FALSE"]
    K --> L["Frontend recibe carrito vacío en silencio ❌"]
```

### 2.1 Causa raíz en el Backend
En [`CarritoService.java`](../src/main/java/com/jeplabs/ecommerce/domain/carrito/CarritoService.java), líneas 231-244:
```java
private ResultadoCarrito obtenerOCrearCarritoVigente(Usuario usuario) {
    return carritoRepositorio
            .findByUsuarioIdAndEstado(usuario.getId(), EstadoCarrito.ACTIVO)
            .map(c -> {
                if (!c.estaExpirado()) {
                    return new ResultadoCarrito(c, false);
                }
                c.marcarComoExpirado();
                carritoRepositorio.save(c);
                Carrito nuevo = crearNuevoCarrito(usuario);
                return new ResultadoCarrito(nuevo, true);
            })
            .orElseGet(() -> new ResultadoCarrito(crearNuevoCarrito(usuario), false)); // <-- AQUÍ
}
```

Cuando el usuario regresa después de que `CarritoScheduler` ya procesó el carrito:
1. `findByUsuarioIdAndEstado(ACTIVO)` devuelve `Optional.empty()` (porque el carrito anterior ya no está en `ACTIVO`, sino en `EXPIRADO`).
2. Se ejecuta el `.orElseGet()`, el cual crea un nuevo carrito activo y pasa `false` en `carritoAnteriorExpirado`.
3. **Consecuencia:** El usuario experimenta que su carrito "se borró en silencio", a pesar de que el registro y sus ítems siguen existiendo en la base de datos y el endpoint `POST /api/carrito/restaurar` está 100% operativo.

---

### 2.2 Factores Coadyuvantes en el Ciclo de Sesión y Frontend

Además de la condición en el backend, en el comportamiento observado influyen tres factores del ciclo de vida de la aplicación:

1. **Discrepancia entre Expiración de Token JWT vs Expiración de Carrito:**
   - En `application-dev.properties`:
     - Token de Administrador: **10 minutos** (`api.security.access-expiration-admin-seconds=600`).
     - Token de Cliente: **15 minutos** (`api.security.access-expiration-cliente-seconds=900`).
     - Expiración de Carrito: **30 minutos** (`api.carrito.expiracion-minutos=30`).
   - Si el usuario permanece más de 10 minutos en el panel de administración, el Access Token vence primero. Al navegar al área de cliente, el frontend detecta que no hay sesión activa (`isAuthenticated = false`), ejecutando:
     ```ts
     setItems([]);
     setExpiracion(null);
     setSegundosRestantes(null);
     setShowExpiredModal(false);
     ```
     Esto limpia inmediatamente el carrito en memoria antes de que se pueda consultar la API del carrito.

2. **Condición estricta de productos en el carrito (`items.length > 0`):**
   - El temporizador local en `useCartLogic.ts` solo dispara el modal si había productos reservados:
     ```ts
     if (diffSec <= 0) {
         if (items.length > 0) {
             setShowExpiredModal(true);
         }
     }
     ```
   - Si el carrito estaba vacío al momento de expirar, el modal se silencia intencionalmente para no alarmar al usuario cuando no hay nada que restaurar.

3. **Navegación interna SPA sin revalidación automática:**
   - `useCartLogic` sincroniza con el backend en dos momentos: al autenticarse y al cambiar el foco de la pestaña del navegador (`visibilitychange`).
   - No escucha cambios de ruta interna de React Router (por ejemplo, navegar de `/admin/sucursales` a `/`). Por ende, si el carrito expira en el servidor mientras se navega en la misma pestaña, el frontend no invoca `GET /api/carrito` hasta que ocurra una mutación (agregar/quitar ítem), se recargue la página o se cambie de pestaña.

---

## 3. Solución Técnica Propuesta para el Backend

En `CarritoService.java`, cuando no exista un carrito activo, se debe verificar si existe un carrito en estado `EXPIRADO` que contenga productos y que no haya sido purgado ni abandonado:

```java
private ResultadoCarrito obtenerOCrearCarritoVigente(Usuario usuario) {
    return carritoRepositorio
            .findByUsuarioIdAndEstado(usuario.getId(), EstadoCarrito.ACTIVO)
            .map(c -> {
                if (!c.estaExpirado()) {
                    return new ResultadoCarrito(c, false);
                }
                c.marcarComoExpirado();
                carritoRepositorio.save(c);
                Carrito nuevo = crearNuevoCarrito(usuario);
                return new ResultadoCarrito(nuevo, true);
            })
            .orElseGet(() -> {
                Carrito nuevo = crearNuevoCarrito(usuario);
                // Verificar si el usuario tiene un carrito expirado previo con ítems disponibles para restaurar
                boolean tieneCarritoExpiradoConItems = carritoRepositorio
                        .findFirstByUsuarioIdAndEstadoOrderByActualizadoAtDesc(usuario.getId(), EstadoCarrito.EXPIRADO)
                        .map(c -> !c.getItems().isEmpty())
                        .orElse(false);
                return new ResultadoCarrito(nuevo, tieneCarritoExpiradoConItems);
            });
}
```

> [!NOTE]
> Al restaurar exitosamente (`POST /api/carrito/restaurar`), el backend ya marca el carrito viejo como `ABANDONADO` (`carritoExpirado.marcarComoAbandonado()`), lo que garantiza que este flag solo sea `true` una única vez y sea totalmente idempotente.

---

## 4. Mejores Prácticas de E-Commerce (Frontend y UX)

En plataformas líderes de comercio electrónico (Amazon, MercadoLibre, Shopify), la expiración del carrito se aborda de forma escalonada según el tiempo de inactividad:

| Escenario de Inactividad | Comportamiento Recomendado | Componente UX |
|---|---|---|
| **Corta (< 24 horas)** | Notificación inmediata al cliente informando que el inventario fue liberado para otros compradores, con botón para restaurar. | **Modal Emergente** (`CartExpiredModal`). |
| **Media o Larga (> 24 horas o varios días)** | No interrumpir la navegación general con un modal intrusivo. En su lugar, cuando el usuario entra a `/cart` o abre el Drawer del carrito, mostrar un banner o tarjeta destacada: *"Tienes productos guardados de tu visita anterior [Restaurar carrito]"*. | **Banner Persistente en Carrito**. |
| **Sin sesión (Invitado)** | Si el usuario no tiene cuenta, asociar el carrito a una cookie/localStorage (`guestCartId`) o sugerir iniciar sesión para recuperar el carrito previo guardado. | **Prompt de Login en Carrito**. |

---

## 5. Documentos Relacionados
- [`Retencion-y-Purga-Fisica-Carrito.md`](./Retencion-y-Purga-Fisica-Carrito.md): Detalle de estados en PostgreSQL y purga física en 2 pasos.
- [`Uso-Expiracion-Carrito-Frontend.md`](./Uso-Expiracion-Carrito-Frontend.md): Contrato JSON, temporizadores monótonos y consumo de `/api/carrito/restaurar`.
