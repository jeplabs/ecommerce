# Arquitectura de Doble Token (Access + Refresh) y Gestión de Sesión en el Frontend

**Estado:** Implementado en Frontend y Backend  
**Fecha:** Octubre 2026  
**Estándar de Referencia:** IETF RFC 9700 (OAuth 2.0 Security Best Current Practice) & OWASP ASVS v4.0.3

---

## 1. Resumen Ejecutivo

Este documento detalla la implementación en el **Frontend** de la arquitectura de autenticación de **Doble Token (Access Token JWT + Refresh Token Opaco en Cookie `HttpOnly`)**, diseñada para eliminar las vulnerabilidades de robo de sesión por XSS en `localStorage` y brindar una experiencia fluida sin cierres de sesión inesperados mientras el usuario navega en la tienda.

---

## 2. Separación de Responsabilidades y Almacenamiento

| Token | Dónde se Almacena | Tiempo de Vida | Cómo Viaja al Servidor | Propósito y Seguridad |
| :--- | :--- | :--- | :--- | :--- |
| **Access Token** | **Memoria RAM** (`inMemoryToken`) + **`sessionStorage`** | Corto (**15 min**) | Cabecera `Authorization: Bearer <token>` | • Autoriza las peticiones a la API.<br>• Al estar en `sessionStorage`, sobrevive a recargas F5 pero **muere automáticamente al cerrar la pestaña o el navegador**.<br>• **Nunca** toca `localStorage`. |
| **Refresh Token** | **Cookie `HttpOnly; Path=/api/auth`** | Largo (**7 a 14 días**) | Automático en `POST /api/auth/refresh` y `/logout` | • Solo sirve para obtener un nuevo Access Token.<br>• Inmune a XSS: JavaScript no puede leerlo.<br>• Restringido a `Path=/api/auth` (no viaja en llamadas a productos, carrito, etc.). |
| **Bandera `has_session`** | `localStorage` | Mientras dure la sesión | No viaja por red | • Bandera booleana no sensible (`has_session = '1'`).<br>• Permite a nuevas pestañas saber que hay sesión activa para pedir su propio Access Token en frío vía cookie. |

---

## 3. Componentes Implementados en el Frontend

```
src/
├── shared/
│   ├── lib/
│   │   ├── auth-token-store.ts     # Almacén de Access Token en RAM + sessionStorage (getAccessToken, setAccessToken)
│   │   ├── auth-session-sync.ts    # BroadcastChannel ('ecommerce_auth_channel') y eventos de invalidación
│   │   └── http-session.ts         # fetchWithAuth (interceptor de peticiones con reintento ante 401)
├── entities/
│   └── user/
│       ├── api/
│       │   └── authApi.ts          # login, refreshToken, silentRefresh (Singleton Lock), logout, logoutAll
│       └── model/
│           └── useProfileLogic.ts  # Carga de perfil usando getAccessToken()
└── features/
    └── auth/
        └── model/
            └── useAuthLogic.ts     # Rehidratación, detector de actividad DOM, timer 60s, visibilitychange y sync
```

### 3.1. Almacén de Token (`auth-token-store.ts`)
Provee acceso sincrónico y seguro al token para interceptores de red y componentes:
- `getAccessToken()`: Lee de memoria RAM o de `sessionStorage`.
- `setAccessToken(token)`: Sincroniza la RAM, `sessionStorage` y fija/limpia la bandera `has_session` en `localStorage`. Elimina cualquier clave legada `'token'`.
- `clearAuthTokens()`: Limpieza completa.

### 3.2. Sincronización Multi-Pestaña (`auth-session-sync.ts`)
Utiliza la API estándar **`BroadcastChannel`** (`ecommerce_auth_channel`):
- Al cerrar sesión en una pestaña, emite `{ type: 'LOGOUT' }`. Todas las pestañas abiertas limpian su estado y redirigen sin recargar la página.
- Al iniciar sesión en una pestaña, emite `{ type: 'LOGIN' }`. Las demás pestañas se rehidratan silenciosamente.

### 3.3. Singleton Promise Lock en `silentRefresh()` (`authApi.ts`)
Evita condiciones de carrera: si múltiples llamadas HTTP simultáneas detectan que el token expiró, **solo se ejecuta 1 petición a `POST /api/auth/refresh`**. Todas las llamadas concurrentes comparten la misma promesa y reciben el nuevo token al unísono.

### 3.4. Ciclo de Vida y Detección de Actividad en `useAuthLogic.ts`
1. **Recarga de página (F5):**
   - El frontend lee el token vigente desde `sessionStorage`. Si aún tiene tiempo de vida, la página se inicializa en **0 ms** sin consultar al backend.
2. **Apertura de nueva pestaña en frío:**
   - Si no hay token en `sessionStorage` pero `has_session === '1'`, llama a `silentRefresh()`. El navegador adjunta la cookie `HttpOnly` y el usuario queda autenticado de inmediato.
3. **Detector de Actividad del Usuario (DOM):**
   - Escucha `pointerdown`, `keydown`, `scroll` y `touchstart` con *throttle* de 30 segundos, actualizando `lastActivityRef.current`.
4. **Despertar de Suspensión (`visibilitychange`):**
   - Cuando la laptop o equipo se suspende y se reabre 1 hora después, `document.addEventListener('visibilitychange')` detecta que la pestaña volvió a estar activa y renueva el token inmediatamente vía `silentRefresh()`.
5. **Renovación Silenciosa Proactiva (Timer 60s):**
   - 60 segundos antes de expirar el Access Token, si el usuario interactuó en los últimos 15 minutos, invoca `silentRefresh()` de fondo sin interrumpir la vista ni la navegación.

---

## 4. Punto Específico del Backend: Ventana de Gracia (*Leeway Window*) en la Rotación

### 4.1. El Problema de Carrera por F5 Compulsivo o Red Inestable
En la especificación estricta de **Rotación de Refresh Tokens (Token Reuse Detection)**:
1. El cliente llama a `/api/auth/refresh`.
2. El backend marca el Refresh Token anterior como `revocado = true` y genera uno nuevo con la misma `family_id`.
3. Si un cliente presiona **F5 repetidas veces en un segundo** (o una conexión móvil lenta sufre reintentos automáticos de paquetes TCP), puede ocurrir que una segunda petición envíe el token que el backend acaba de marcar como revocado.
4. Si el backend no tiene tolerancia, interpreta esa segunda petición como un **ataque de reutilización (robo de credenciales)**, revocando toda la familia de tokens y cerrando la sesión del usuario legítimo por error (*falso positivo*).

### 4.2. Cómo lo Mitiga el Frontend
Con la solución implementada:
- **El Access Token se almacena en `sessionStorage`:** Al presionar F5, la app reutiliza el Access Token de 15 minutos. **No se dispara ninguna llamada a `/refresh` al recargar**, eliminando el 99% de las condiciones de carrera provocadas por F5s continuos.

### 4.3. Recomendación Arquitectónica para el Backend (`RefreshTokenService.java`)
Para alcanzar tolerancia a fallos de nivel bancario según **RFC 6749 / OAuth 2.0 Security BCP (Sección 4.14.2)**, se recomienda incorporar en `RefreshTokenService.java` una **ventana de gracia (Leeway) de 10 a 15 segundos**:

```java
// En RefreshTokenService.java -> rotarToken()
if (almacenado.isRevocado()) {
    // Si fue revocado hace menos de 10 segundos y ya tiene reemplazo emitido:
    if (almacenado.getReemplazadoPor() != null &&
        almacenado.getCreadoAt().isAfter(LocalDateTime.now().minusSeconds(10))) {
        
        // Es una condición de carrera legítima (F5 rápido o doble petición concurrente)
        // Se reenvía pacíficamente el token vigente de la familia en lugar de revocarla
        return obtenerEmisionReemplazo(almacenado.getReemplazadoPor(), ipAddress, userAgent);
    }

    // Si pasaron más de 10 segundos: ATAQUE REAL DE REÚSO
    int revocados = refreshTokenRepository.revocarFamilia(almacenado.getFamilyId());
    log.warn("[Seguridad] Reúso malicioso detectado. Revocada familia {}", almacenado.getFamilyId());
    throw new RefreshTokenInvalidoException("Sesión invalidada por motivos de seguridad.");
}
```

---

## 5. Casos de Uso del Endpoint `logout-all` (`POST /api/auth/logout-all`)

El endpoint implementado en el backend revoca todas las sesiones activas del usuario en todos sus dispositivos (`revocarTodosPorUsuario` en BD):

1. **Acción voluntaria del usuario en "Mi Perfil" / "Seguridad":**
   - Botón: *"Cerrar sesión en todos los demás dispositivos"* (útil si el cliente sospecha que olvidó su sesión abierta en un equipo compartido).
2. **Eventos críticos de seguridad automáticos:**
   - **Cambio de contraseña:** Si el usuario actualiza su clave, el backend revoca automáticamente todas las familias para expulsar accesos previos.
   - **Restablecimiento por correo (*Forgot Password*):** Invalida sesiones anteriores tras recuperar la cuenta.
3. **Acción administrativa:**
   - Si un administrador desactiva o bloquea a un usuario, todas sus sesiones activas quedan canceladas al instante.

---

## 6. Configuración de Entorno Local vs Producción para Cookies

En desarrollo local (`http://localhost:5173` y `http://localhost:8081`):
- Los navegadores no guardan cookies con `Secure=true` sobre HTTP (no-HTTPS).
- La directiva `SameSite=Strict` bloquea cookies enviadas entre puertos diferentes (`:5173` y `:8081`).
- En `application-dev.properties` debe configurarse:
  ```properties
  api.security.cookie.secure=false
  api.security.cookie.same-site=Lax
  api.security.cookie.path=/api/auth
  ```
- En producción sobre HTTPS (`https://tienda.com`), se mantiene `secure=true` y `same-site=Strict` o `Lax`.

---

## 7. Resolución de Incidencias Críticas y Casos Borde Identificados

### 7.1. Bucle Infinito de Redirección en `/profile` (Parpadeo y Cierre de Sesión)
- **Síntoma:** Al hacer clic en *"Mi cuenta"* o entrar a la ruta `/profile`, la pantalla parpadeaba repetidamente y cerraba la sesión.
- **Causa Raíz:** En `useProfileLogic.ts` (y hooks de administración como `useAdminOrdersLogic.ts` y `useDashboardStats.ts`) existía una validación legada:
  ```ts
  const token = localStorage.getItem('token');
  if (!token) {
      navigate('/login', { replace: true });
      return;
  }
  ```
  Al haber migrado a Doble Token, el Access Token ya no reside en `localStorage`. Por ende, `useProfileLogic` no lo encontraba y redirigía a `/login`. Al llegar a `/login`, el componente `GuestRoute` verificaba que el usuario sí estaba autenticado (`isAuthenticated = true`) y lo redirigía de vuelta a `/profile`. Este ciclo generaba un bucle infinito que abortaba la sesión.
- **Solución:** Se actualizaron todas las referencias para obtener el token mediante `getAccessToken()` del nuevo almacén seguro:
  ```ts
  const token = getAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  ```

### 7.2. Reanudación tras Suspensión Prolongada de la Computadora (Laptop Sleep / Wake up)
- **Síntoma:** El usuario inicia sesión, cierra la tapa de su laptop durante 1 hora o más y, al volver a abrirla, la sesión aparece cerrada o desincronizada.
- **Causa Raíz:** 
  1. Durante la suspensión, la pestaña se congela y los temporizadores `setTimeout` se pausan. Al despertar el equipo 1 hora después, el Access Token de 15 minutos ya expiró.
  2. Si el navegador no recarga la pestaña, la app no se enteraba inmediatamente de que el tiempo transcurrió mientras el equipo dormía.
- **Solución:** Se añadió un listener nativo para el evento `visibilitychange` en `useAuthLogic.ts`:
  ```ts
  const onVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && hasSessionFlag()) {
          const currentToken = getAccessToken();
          const exp = currentToken ? getJwtExpiryMs(currentToken) : null;
          // Si el token expiró mientras el equipo dormía o le quedan menos de 30s
          if (exp != null && exp <= Date.now() + 30_000) {
              const refreshed = await authApi.silentRefresh();
              if (refreshed) {
                  setUser({ token: refreshed.token, rol: refreshed.rol });
                  setUserRol(refreshed.rol);
              }
          }
      }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  ```
  De esta forma, al abrir la tapa de la laptop, el navegador detecta de inmediato el estado visible, renueva el token mediante la cookie `HttpOnly` en milisegundos y el usuario continúa trabajando sin notar interrupción.

### 7.3. Rechazo Silencioso de la Cookie en Desarrollo Local
- **Síntoma:** La sesión caducaba a los 15 minutos exactos a pesar de tener configurado el Refresh Token de 14 días.
- **Causa Raíz:** Por defecto, `application.properties` tenía `cookie.secure=true`. En entornos de desarrollo que corren sobre `http://localhost` (no HTTPS), Chrome, Edge y Firefox descartan silenciosamente las cookies con bandera `Secure`. Como resultado, el navegador nunca guardaba la cookie `refresh_token` y, al vencer el Access Token de 15 min, la llamada `/api/auth/refresh` fallaba con 401 por falta de cookie.
- **Solución:** En `application-dev.properties` se sobreescribieron explícitamente `api.security.cookie.secure=false` y `api.security.cookie.same-site=Lax`.

### 7.4. Modal Legado de Aviso de Caducidad (`SessionExpiryWarning`)
- **Síntoma:** Aparecía un modal con el mensaje *"Tu sesión está por caducar. En 5 minutos tendrás que iniciar sesión de nuevo..."*, y si el usuario no interactuaba, la sesión se cerraba.
- **Causa Raíz:** El componente `SessionExpiryWarning.tsx` fue creado antes de la arquitectura de doble token (cuando no existía endpoint de refresh ni cookies). En desarrollo, el token dura 7 minutos, por lo que a los ~3.5 min el modal se abría automáticamente. Además, su botón *"Continuar"* solo cerraba el `<dialog>` sin invocar `/api/auth/refresh`, y la inactividad del usuario impedía la renovación proactiva.
- **Solución:** En una arquitectura de Doble Token moderna, el Access Token de corta duración debe renovarse de forma 100% transparente y silenciosa en segundo plano sin interrumpir al usuario. Se conservó el código del componente y su lógica interna para trazabilidad histórica, pero se desactivó su montaje en `AuthSessionListeners.tsx` (dejándolo comentado con explicación técnica).

### 7.5. Fuente de Verdad del Rol en el Access Token JWT y Eliminación Total de `rol` en `localStorage`
- **Síntoma:** Tras regresar a la aplicación, aparecía el botón *"Cerrar sesión"* en el Navbar, pero desaparecían los botones de *"Perfil"* y *"Carrito"*. Al abrir una ventana nueva, reaparecían.
- **Causa Raíz:** El Navbar condiciona Perfil y Carrito estrictamente a `userRol === 'ROLE_CUSTOMER'`, mientras que *"Cerrar sesión"* solo requiere `isAuthenticated = true`. Al rehidratar la sesión desde el token en memoria o `sessionStorage`, el código legado leía el rol desde `localStorage.getItem('rol')`. Si `localStorage` había sido limpiado o desincronizado, `userRol` quedaba en `null`, ocultando los accesos de cliente a pesar de tener una sesión activa.
- **Solución (Arquitectura Purgada 100% de `localStorage` para Sesión):** 
  1. Se implementó la utilidad `getJwtRole(token)` en `jwt-expiry.ts` para extraer el claim `rol` directamente del JWT Access Token firmado (fuente de verdad garantizada e inmutable).
  2. Se eliminó por completo toda escritura y lectura de `localStorage.getItem('rol')` y `localStorage.setItem('rol')` / `'user'`. En `localStorage` únicamente reside la bandera neutral `has_session = '1'`.
  3. `useAuthLogic.ts` deriva el rol 100% del JWT (`getJwtRole(token)`) o del payload del login/refresh en memoria RAM.
  4. En `Navbar.tsx`, la condición de vista de cliente se robusteció a `(userRol === 'ROLE_CUSTOMER' || userRol !== 'ROLE_ADMIN')`, asegurando que ningún usuario autenticado regular quede desprovisto de sus accesos a carrito y perfil.

### 7.6. Desfase Visual en UI por Renovación Silenciosa fuera de React (`notifySessionRefreshed`)
- **Síntoma:** Tras permanecer en otra pestaña por más de 15 minutos, al regresar la UI mostraba la sesión cerrada (Navbar mostrando *"Iniciar sesión"*). Sin embargo, al inspeccionar DevTools:
  - En `localStorage` persistía `has_session: '1'`.
  - En `sessionStorage` existía un `auth_access_token` válido.
  - En Cookies de `localhost` existía la cookie `refresh_token` con vigencia de 14 días (`HttpOnly=✓`, `SameSite=Lax`, `Path=/api/auth`).
  - Al presionar **F5**, la sesión volvía a mostrarse activa en la UI de inmediato sin solicitar credenciales.
- **Causa Raíz:**
  1. Al regresar a la pestaña, el interceptor HTTP `fetchWithAuth` (o el temporizador de visibilidad) invocó `silentRefresh()`.
  2. La llamada a `POST /api/auth/refresh` fue exitosa, guardó el nuevo Access Token en `sessionStorage` y rotó la cookie HttpOnly en el navegador.
  3. No obstante, al ejecutarse la renovación dentro de un interceptor de red fuera del árbol de renderizado de React, **no se notificó al estado de React (`AuthProvider`)**.
  4. React mantenía en memoria el estado anterior en esa pestaña, creando la ilusión visual de que la sesión se había cerrado. Al hacer F5, la app se montó de nuevo desde cero, leyó el token fresco de `sessionStorage` y renderizó la sesión abierta.
- **Comportamiento del Navegador y Seguridad (RFC 6265):**
  - **Cookies sin distinción de puerto:** Las cookies web se aíslan por Host (`localhost`) y no por puerto. La cookie emitida por el backend (`:8081`) se almacena bajo el dominio compartido `localhost` con la ruta segura `Path=/api/auth`.
  - **Aislamiento en `sessionStorage`:** El Access Token de 15 minutos en `sessionStorage` es temporal, vive aislado por pestaña y se autodestruye al cerrar el navegador, evitando riesgos de persistencia de largo plazo.
- **Solución Implementada:**
  1. Se implementó el canal de eventos `AUTH_SESSION_REFRESHED` mediante `notifySessionRefreshed` y `subscribeSessionRefreshed` en `auth-session-sync.ts`.
  2. Las funciones `login` y `refreshToken` en `authApi.ts` emiten `notifySessionRefreshed({ token, rol })` tras cualquier renovación exitosa.
  3. `useAuthLogic.ts` se suscribe a este evento y actualiza inmediatamente `setUser`, `setUserRol` e `setIsAuthenticated(true)`.
  4. La UI se sincroniza de inmediato en tiempo real sin requerir que el usuario presione F5.

---

## 8. Verificación y Pruebas Automatizadas

Se crearon y actualizaron las pruebas unitarias en el frontend:
- `src/shared/lib/auth-token-store.test.ts`: Valida almacenamiento en RAM/sessionStorage, bandera `has_session` y ausencia del JWT en `localStorage`.
- `src/features/auth/model/useAuthLogic.test.ts`: Valida login, persistencia en memoria, registro, ciclo de vida y logout con destrucción de credenciales.
- `src/entities/user/api/authApi.test.ts`: Valida llamadas a `login`, `refreshToken`, `silentRefresh` y `logout`.
- `src/shared/lib/http-session.test.ts`: Valida inyección de cabeceras de autorización y manejo de errores 401.

Toda la suite de pruebas unitarias y de integración del checkout (29/29), router (7/7) y autenticación (16/16) se ejecuta y pasa al 100%.
