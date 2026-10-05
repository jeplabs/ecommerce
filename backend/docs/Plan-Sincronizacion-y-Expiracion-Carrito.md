# Documentación de Arquitectura: Sincronización, Expiración y Renovación del Carrito de Compras

---

## 1. Diagnóstico del Problema Actual

En la arquitectura actual de la aplicación:
- **Backend (Spring Boot + PostgreSQL)**: El carrito de compras cuenta con un tiempo de vida útil (TTL) gestionado en el servidor o base de datos (p. ej., columna `expires_at` en PostgreSQL o Redis en el futuro).
- **Frontend (React / Vite)**: Mantiene el estado del carrito en memoria mediante `React Context` y hooks (`useCartLogic`). El frontend no tiene conocimiento de la fecha o tiempo exacto de vencimiento del servidor a menos que intente realizar una petición HTTP.

### Consecuencias UX/Técnicas:
1. **Desincronización Silenciosa**: Si un cliente deja la pestaña abierta durante un período prolongado (p. ej. 30 minutos), el carrito expira en la base de datos del backend, pero la pantalla del frontend continúa mostrando los productos seleccionados.
2. **Fallo Tardío en Checkout**: El frontend solo descubre que el carrito expiró cuando el usuario intenta navegar al paso de pago o confirmar la orden. En ese momento, la API del backend responde con un error de "Carrito no encontrado" o "Expirado", obligando al cliente a reiniciar su flujo de compra de manera frustrante.

---

## 2. Aclaración Fundamental sobre Webhooks

> [!IMPORTANT]
> **Los Webhooks NO sirven para notificar al navegador del cliente.**  
> Los Webhooks son llamadas HTTP asíncronas *server-to-server* (por ejemplo, Stripe notificando al backend del e-commerce sobre la confirmación de un pago). No existe un mecanismo nativo para que un servidor emita un Webhook directamente hacia la ventana del navegador de un usuario final sin una conexión abierta previa.
> 
> Para comunicar eventos desde el servidor hacia el navegador en tiempo real o reactivo se utilizan tecnologías como **Server-Sent Events (SSE)**, **WebSockets**, o patrones basados en **HTTP REST / Polling**.

---

## 3. Consideración del Tech Stack Backend (Spring Boot + PostgreSQL DB vs. Redis)

> [!NOTE]
> **El backend actual opera con Spring Boot y PostgreSQL DB** (con Redis contemplado a futuro como capa de caché/memoria).  
> **Esta distinción NO altera la arquitectura ni los patrones propuestos.** La estrategia REST y el contrato de API son 100% idénticos en ambos casos:

* **Gestión en PostgreSQL (Stack Actual)**:
  * La tabla `carrito` posee una columna `expires_at TIMESTAMP`.
  * En cada consulta `GET /api/cart`, Spring Boot filtra registros vigentes (`WHERE expires_at > NOW()`).
  * Una tarea programada `@Scheduled` en Spring Boot limpia o marca como expirados los carritos obsoletos periódicamente.
  * Al renovar el carrito, Spring Boot ejecuta: `UPDATE carrito SET expires_at = NOW() + INTERVAL '30 minutes' WHERE id = :cartId`.
* **Gestión en Redis (Futura Optimización)**:
  * El carrito se almacena como clave con TTL nativo (`EXPIRE cart:id 1800`).
  * La respuesta JSON hacia el frontend (`expiresAt`, `ttlSeconds`) es **exactamente la misma**.

---

## 4. Análisis Exhaustivo de Opciones y Patrones Evaluados

A continuación se detallan las 5 opciones arquitectónicas evaluadas para resolver el problema de expiración del carrito, junto con sus pros, contras y viabilidad en e-commerce.

### Opción 1: Timestamp de Expiración en la Respuesta (Client-Driven TTL) ⭐ *(Recomendado)*
* **Mecanismo**: Cada vez que el cliente obtiene o modifica su carrito (vía `GET /api/cart`, `POST /api/cart/items`, etc.), el backend (Spring Boot) retorna la fecha/hora exacta de vencimiento (`expiresAt`) o el tiempo de vida restante (`ttlSeconds`). El frontend almacena este valor en su estado global e inicia un temporizador local (`setTimeout` / `setInterval`).
* **Pros**:
  * **Cero overhead de servidor**: Opera sobre las peticiones HTTP REST estándar existentes. No exige servidores especiales de sockets ni mantener conexiones abiertas.
  * **Experiencia de Usuario (UX) Superior**: Permite mostrar contadores en tiempo real (p. ej., *"Tu reserva expira en 14:59 min"*) o emitir alertas precisas al usuario en el segundo exacto en que vence el carrito.
  * Estándar en la industria e-commerce (aerolíneas, ticketeras, retail).
* **Contras**:
  * Si el carrito es eliminado manualmente en la BD antes del tiempo previsto por una tarea administrativa, el frontend solo lo sabrá en la siguiente interacción HTTP o re-validación.

---

### Opción 2: Re-validación al Enfocar Pestaña o Cambiar de Ruta (Visibility & Route Guard) ⭐ *(Recomendado)*
* **Mecanismo**: El frontend escucha eventos nativos del navegador como `visibilitychange` (cuando el usuario vuelve a la pestaña del navegador tras haber estado en otra aplicación o pestaña) y las transiciones entre los pasos del checkout (de Paso 1 a Paso 2). En esos instantes, invoca automáticamente `refreshCart()`.
* **Pros**:
  * **Implementación sencilla**: Se añade con pocas líneas de código en el `CartProvider` (`document.addEventListener('visibilitychange', ...)`).
  * Evita que el usuario llene datos o formularios de envío si su carrito ya venció en PostgreSQL mientras la pestaña estaba inactiva.
* **Contras**:
  * Solo detecta la expiración cuando el usuario interactúa o regresa a la pestaña; no emite avisos si el usuario se queda mirando pasivamente la pantalla fija sin interactuar.

---

### Opción 3: Polling / Heartbeat
* **Mecanismo**: El frontend envía peticiones HTTP de verificación (`GET /api/cart/status` o `GET /api/cart`) a intervalos regulares de tiempo (p. ej., cada 2 o 5 minutos) mientras la aplicación está abierta.
* **Pros**:
  * Fácil de conceptualizar e implementar.
* **Contras**:
  * **Genera tráfico innecesario**: Consume recursos del servidor y consultas a PostgreSQL con peticiones repetitivas.
  * Si la petición de polling renueva automáticamente `expires_at` en la BD, el carrito nunca expirararía mientras la pestaña continúe abierta, reteniendo inventario indefinidamente.

---

### Opción 4: Server-Sent Events (SSE)
* **Mecanismo**: El navegador establece un canal de comunicación HTTP unidireccional persistente mediante la API nativa `EventSource('/api/cart/events')`. Cuando un evento de expiración ocurre en el backend (vía tarea `@Scheduled` en Spring Boot o Redis Pub/Sub), el servidor transmite el evento `cart_expired` al navegador.
* **Pros**:
  * Comunicación en tiempo real basada en eventos del servidor.
  * Más liviano que WebSockets ya que utiliza el protocolo HTTP/1.1 o HTTP/2 estándar.
  * Reconexión automática nativa manejada por el navegador.
* **Contras**:
  * Requiere mantener conexiones HTTP abiertas por cada cliente activo en el servidor Spring Boot.

---

### Opción 5: WebSockets (Socket.io / WS Nativo)
* **Mecanismo**: Conexión TCP permanente y bidireccional entre el navegador y el servidor.
* **Pros**:
  * Comunicación bidireccional instantánea.
  * Útil si la plataforma cuenta con chat de soporte en vivo, subastas o actualizaciones de inventario multiusuario en tiempo real.
* **Contras**:
  * **Alta complejidad de infraestructura**: Alto consumo de memoria RAM en servidor, necesidad de manejadores de `sticky sessions` y balanceadores de carga.
  * **Sobredimensionado** si el único objetivo es gestionar la caducidad del carrito.

---

## 5. Cuadro Comparativo de Opciones

| Opción | Complejidad Backend | Impacto en Servidor | Experiencia de Usuario (UX) | Calificación / Recomendación |
| :--- | :--- | :--- | :--- | :--- |
| **1. Timestamp de Expiración (Client-Driven TTL)** | Muy Baja | Nulo | Excelente (Contador y alerta previa) | ⭐ **Alta (Recomendada)** |
| **2. Re-validación al Enfocar / Navegar** | Nula | Nulo | Muy Buena (Previene errores al checkout) | ⭐ **Alta (Recomendada)** |
| **3. Polling / Heartbeat** | Baja | Medio / Alto | Buena | ⚠️ **No recomendada** |
| **4. Server-Sent Events (SSE)** | Media | Medio | Excelente (Tiempo real estricto) | 🔷 **Media (Opcional)** |
| **5. WebSockets** | Alta | Alto | Excelente | 🛑 **Baja (Sobredimensionada)** |

---

## 6. Propuesta Recomendada: Enfoque Híbrido (Opción 1 + Opción 2)

La **Mejor Práctica de E-Commerce** combina la **Opción 1 (Timestamp de Expiración)** con la **Opción 2 (Re-validación por Enfoque y Ruta)**. Esto garantiza una UX óptima sin sobrecargar la base de datos ni el servidor.

### 6.1 Especificación de la API Backend (Contrato JSON)
En la respuesta de los endpoints del carrito (`GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`), Spring Boot incluirá el objeto `expiration`:

```json
{
  "id": "cart_89123",
  "items": [
    {
      "id": 101,
      "productId": 5,
      "quantity": 2,
      "price": 45.00
    }
  ],
  "summary": {
    "cartTotal": 90.00
  },
  "expiration": {
    "expiresAt": "2026-10-04T23:15:00Z",
    "ttlSeconds": 1800
  }
}
```

### 6.2 Lógica de Ejecución en Frontend (`CartProvider` / `useCartLogic`)

1. **Gestión Local del TTL**:
   * Al recibir `expiresAt` o `ttlSeconds`, el frontend programa un temporizador interno (`setTimeout`).
   * Al cumplirse el tiempo, ejecuta la lógica de notificación amigable explicada en la Sección 6.3.

2. **Re-validación al Enfocar Pestaña y Cambiar de Paso**:
   * Escuchar `visibilitychange`: Cuando `document.hidden` pase a `false` (el usuario vuelve a la pestaña), invocar `refreshCart()`.
   * Si Spring Boot responde con error `404 Cart Not Found` o `Carrito Expirado`, notificar al usuario antes de que intente ingresar direcciones o datos de pago.

---

### 6.3 Opciones y Mejores Prácticas de UI/UX para Informar al Usuario

> [!CAUTION]
> **Regla de UX Fundamental**: **NUNCA limpiar la interfaz de usuario en silencio ni vaciar el carrito sin aviso.**  
> Si el carrito desaparece de forma repentina sin explicación, el cliente asume que la tienda falló, lo que genera alta frustración y pérdida de ventas.

A continuación se presentan las mejores alternativas de diseño UI/UX para notificar la expiración del carrito:

#### Alternativa UX 1: Modal Informativo con Acción de "Restablecer / Re-agregar Productos" ⭐ *(La más amigable)*
* **Comportamiento**: Al vencer el temporizador, aparece un modal con diseño limpio:
  > **"Tu reserva de carrito ha expirado por inactividad"**  
  > *Los productos que tenías guardados fueron liberados para otros compradores.*  
  >  
  > **[ Intentar re-agregar mis productos ]**  **[ Ver catálogo ]**
* **Ventaja**: Si el usuario hace clic en *"Intentar re-agregar mis productos"*, el frontend envía al backend la lista de productos que tenía antes de expirar. Si aún hay stock disponible en PostgreSQL, se crea un nuevo carrito en 1 solo clic sin que el cliente tenga que buscar producto por producto otra vez.

#### Alternativa UX 2: Conversión a "Guardados para Después" (Saved for Later)
* **Comportamiento**: En lugar de borrar la lista por completo, los productos pasan de la sección activa a una sección secundaria llamada *"Productos de tu carrito expirado"*.
* **Ventaja**: El usuario ve exactamente qué items tenía y puede presionar **"Volver a agregar"** individualmente o en bloque.

#### Alternativa UX 3: Pre-Alertas Progresivas con Badge de Estado (Countdown UX)
* **Fase Verde ($> 5$ min)**: Texto sutil en el drawer/resumen: *"Reserva garantizada por 15:00 min"*.
* **Fase Ámbar ($< 5$ min)**: Badge amarillo con mensaje: *"Tu reserva vence pronto (04:30 min)"*.
* **Fase Roja ($< 2$ min)**: Badge rojo parpadeante + botón flotante *"¿Necesitas más tiempo? [Extender 15 min]"*.

---

## 7. Estrategia y Análisis de Renovación del Carrito ("Renovar Carrito")

Es **totalmente posible y factible** implementar un mecanismo donde el cliente pueda renovar o extender el tiempo de vida de su carrito antes de que caduque.

A continuación se analizan las 3 estrategias de renovación utilizables en e-commerce:

### Estrategia A: Botón Manual de Renovación ("¿Necesitas más tiempo?") ⭐ *(Muy recomendado para reservas de stock)*
* **Funcionamiento**: Cuando al temporizador le quedan menos de 2 o 3 minutos para vencer (Fase Roja), se despliega una notificación flotante o modal:
  > *"Tu reserva expirará en 01:59. ¿Necesitas más tiempo para completar tu compra?"*  
  > Botón: **[Extender tiempo]**
* **Implementación Backend (Spring Boot + PostgreSQL)**:
  * Endpoint `POST /api/cart/renew`.
  * Spring Boot ejecuta: `UPDATE carrito SET expires_at = NOW() + INTERVAL '30 minutes' WHERE id = :cartId`.
  * Retorna el nuevo JSON con `expiresAt` actualizado.
* **Ventajas**:
  * Otorga control directo al comprador.
  * Evita que usuarios inactivos o bots retengan productos indefinidamente (requiere interacción humana).

### Estrategia B: Renovación Automática por Actividad (Sliding Expiration) ⭐ *(Estándar Retail)*
* **Funcionamiento**: Sin necesidad de presionar un botón explícito, cada vez que el cliente interactúa con la tienda (agrega o elimina un producto, cambia cantidades, actualiza notas o selecciona opciones de envío), Spring Boot renueva automáticamente la columna `expires_at` en PostgreSQL.
* **Ventajas**:
  * Totalmente transparente para el usuario mientras esté comprando activamente.
  * Solo expira si el cliente abandona el equipo o deja la pestaña inactiva durante más de 30 minutos.

### Estrategia C: Renovación Sujeta a Disponibilidad (Inventory-Aware Renewal)
* **Funcionamiento**: Al hacer clic en "Extender tiempo", Spring Boot valida en PostgreSQL que los productos mantengan inventario disponible antes de autorizar la extensión. Si hay alta demanda o el stock se ha agotado, notifica al usuario.

---

### Recomendación para la Renovación del Carrito

La combinación ideal para este proyecto es:
1. **Sliding Expiration (Automático)**: Renovar automáticamente la fecha `expires_at` en PostgreSQL mientras el cliente interactúe con las APIs del carrito y checkout.
2. **Botón Manual ("Extender tiempo")**: Si el temporizador baja de 2 minutos sin interacción previa, presentar el modal flotante con el botón de extensión.

---

## 8. Plan de Implementación Paso a Paso

### Fase 1: Backend (Spring Boot + PostgreSQL)
1. Agregar columna `expires_at TIMESTAMP` a la entidad `Carrito` y actualizar DTOs de `/api/cart` para incluir la propiedad `expiration` (`expiresAt`, `ttlSeconds`).
2. Configurar tarea programada `@Scheduled` en Spring Boot para limpieza periódica de registros expirados en PostgreSQL.
3. Implementar endpoint `POST /api/cart/renew` para extensión manual de `expires_at`.
4. Asegurar que las mutaciones del carrito renueven automáticamente `expires_at` (Sliding Expiration).

### Fase 2: Frontend (React)
1. Actualizar `useCartLogic` y `CartContext` para almacenar `expiresAt` e iniciar un temporizador interno.
2. Agregar listeners de `visibilitychange` para re-validar con `refreshCart()` al re-enfocar la pestaña.
3. Crear componentes de UI (Modal de expiración con botón "Re-agregar productos" y Pre-alerta con botón "Extender tiempo").
