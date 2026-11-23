# Evaluación de Seguridad Frontend y Guía de Migración JWT a Cookies HttpOnly

**Fecha:** Septiembre 2026  
**Proyecto:** E-Commerce  
**Ubicación:** `frontend/docs/Evaluacion-Seguridad-Frontend.md`  

---

## 1. Resumen Ejecutivo y Diagnóstico

Este documento consolida el análisis de seguridad realizado sobre la capa Frontend de la aplicación E-Commerce, respondiendo a la inquietud sobre el tráfico de credenciales en el navegador (DevTools / Network Tab), detallando las correcciones inmediatas aplicadas en el código y entregando una guía técnica completa para migrar la autenticación JWT desde `localStorage` hacia **Cookies `HttpOnly`**.

---

## 2. Análisis: CryptoJS vs. HTTPS en el Payload de Login

### 2.1. ¿Por qué la contraseña es visible en la pestaña Network (DevTools)?
Cuando se inspecciona la pestaña **Network (Red)** en las herramientas de desarrollador del navegador durante una petición `POST /api/auth/login`, la contraseña aparece en texto plano. 

**Explicación técnica:**
La pestaña Network de las DevTools captura las peticiones HTTP **en la frontera interna del navegador**, antes de que los datos sean entregados a la capa de transporte (TLS/SSL). Quien está viendo la pestaña Network es el propio usuario o alguien con acceso físico o remoto a la máquina desbloqueada.

Cuando la petición sale del navegador hacia internet sobre **HTTPS (TLS 1.2 / 1.3)**:
* Todo el cuerpo HTTP (payload `{ email, password }`), las cabeceras y la URL son cifrados con algoritmos criptográficos robustos (AES-GCM / ChaCha20).
* Atacantes en la misma red Wi-Fi, proveedores de internet (ISP) o enrutadores intermedios solo ven paquetes cifrados ininteligibles.

### 2.2. ¿Por qué encriptar con CryptoJS en Frontend es un Antipatrón?

Cifrar la contraseña con `CryptoJS` en el navegador antes de enviarla presenta varios problemas de seguridad y arquitectura:

1. **Riesgo de Replay Attack (Ataque de Reintento):**
   Si el frontend aplica un hash o algoritmo de cifrado estático a la contraseña, el *string* resultante (el ciphertext) se convierte en la **nueva contraseña de facto**. Si un atacante intercepta ese payload cifrado, no necesita desencriptarlo; simplemente envía ese mismo ciphertext al endpoint `/api/auth/login` y el servidor lo aceptará.
2. **Cualquier script o clave en el cliente es totalmente público:**
   Todo código JavaScript, clave simétrica o sal que se ejecute en el navegador está al alcance de cualquiera inspeccionando los archivos de código fuente cargados.
3. **Interrupción de Gestores de Contraseñas:**
   Alterar o interceptar el envío nativo de formularios puede romper la integración con gestores de contraseñas (1Password, Bitwarden, Chrome Password Manager) y tecnologías de accesibilidad.

### 2.3. ¿Por qué las entidades bancarias envían payloads cifrados?
Las plataformas bancarias aplican **Cifrado a Nivel de Aplicación (End-to-End Application Encryption)** utilizando llaves públicas asimétricas dinámicas (RSA / ECDH) intercambiadas por sesión. Esto se implementa para:
* Cumplir con estrictas normativas bancarias internacionales y PCI-DSS Nivel 1.
* Evitar que proxies corporativos de inspección SSL (*SSL Decryption/Interception*) dentro de redes empresariales registren claves o PINs en logs intermedios de auditoría.

**Conclusión para E-Commerce:**  
Para una aplicación web estándar, la práctica recomendada por OWASP es:
* **HTTPS obligatorio** en todos los entornos.
* **Hashing robusto con sal exclusiva en el servidor Backend** (implementado en este proyecto mediante `BCryptPasswordEncoder` en Spring Security).

---

## 3. Correcciones de Seguridad Aplicadas en el Proyecto

### 3.1. Eliminación de Vulnerabilidad XSS en Vista de Producto

* **Ubicación:** [ProductTabs.tsx](file:///d:/Programación/ecommerce/frontend/src/widgets/product-detail/ProductTabs/ProductTabs.tsx)
* **Hallazgo:** El componente utilizaba `dangerouslySetInnerHTML` para convertir saltos de línea (`\n`) en etiquetas `<br/>`. Si una descripción contenía HTML inyectado (ej. `<script>` o `<img src=x onerror=...>`), este se ejecutaba en el navegador.
* **Solución Aplicada:** Se eliminó `dangerouslySetInnerHTML` reemplazándolo por el renderizado directo seguro de React con soporte de formateo vía CSS (`white-space: pre-wrap` ya definido en [ProductTabs.module.css](file:///d:/Programación/ecommerce/frontend/src/widgets/product-detail/ProductTabs/ProductTabs.module.css)):
  ```tsx
  // Antes (Vulnerable a XSS):
  <div
      className={styles.fullDescription}
      dangerouslySetInnerHTML={{
          __html: (producto.descripcion ?? '').replace(/\n/g, '<br/>'),
      }}
  />

  // Ahora (Seguro contra XSS):
  <div className={styles.fullDescription}>
      {producto.descripcion}
  </div>
  ```

### 3.2. Adición de Encabezados de Seguridad HTTP

* **Ubicación:** [netlify.toml](file:///d:/Programación/ecommerce/netlify.toml)
* **Solución Aplicada:** Se configuraron encabezados HTTP de protección global:
  ```toml
  [[headers]]
    for = "/*"
    [headers.values]
      X-Frame-Options = "DENY"
      X-Content-Type-Options = "nosniff"
      Referrer-Policy = "strict-origin-when-cross-origin"
      Permissions-Policy = "camera=(), microphone=(), geolocation=()"
      Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http: https:;"
  ```

---

## 4. Guía Detallada de Migración: De `localStorage` a Cookies `HttpOnly`

Actualmente, el token JWT se guarda en `localStorage` ([useAuthLogic.ts](file:///d:/Programación/ecommerce/frontend/src/features/auth/model/useAuthLogic.ts#L118)). Aunque es funcional, cualquier script que logre ejecutarse en el dominio (vulnerabilidad XSS en alguna librería externa) puede extraer el token con `localStorage.getItem('token')`.

La solución arquitectónica definitiva es almacenar el JWT en una **Cookie `HttpOnly`**.

---

### 4.1. Cambios requeridos en el Backend (Spring Boot)

#### Step 1: Emisión de la Cookie `HttpOnly` en el Login (`AuthController.java`)

Al procesar la autenticación exitosa, en lugar de responder únicamente con la clave en el JSON, el servidor emite una cabecera `Set-Cookie`:

```java
package com.jeplabs.ecommerce.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<DatosRespuestaLogin> login(
            @RequestBody @Valid DatosAutenticacionUsuario datos,
            HttpServletResponse response) {
        
        // 1. Validar credenciales y generar JWT
        String tokenJwt = tokenService.generarToken(usuario);

        // 2. Crear Cookie HttpOnly
        ResponseCookie cookie = ResponseCookie.from("token", tokenJwt)
                .httpOnly(true)                // <--- Impide lectura desde JavaScript (Protección XSS)
                .secure(true)                  // <--- Requiere HTTPS en producción
                .path("/")                     // <--- Disponible para toda la API
                .maxAge(24 * 60 * 60)          // <--- Expiración (ej. 24 horas)
                .sameSite("Lax")               // <--- Protección CSRF
                .build();

        // 3. Agregar encabezado Set-Cookie a la respuesta
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new DatosRespuestaLogin(usuario.getId(), usuario.getNombre(), usuario.getRol()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        // Expirar la cookie en el cliente
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Expira inmediatamente
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }
}
```

#### Step 2: Extracción del Token desde Cookies en `FiltroSeguridad.java`

Actualizar el filtro de Spring Security para leer la cookie en cada petición entrante:

```java
package com.jeplabs.ecommerce.infra.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class FiltroSeguridad extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolverTokenDesdeCookie(request);

        if (token != null && tokenService.esValido(token)) {
            var usuario = tokenService.getSubject(token);
            var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolverTokenDesdeCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
```

#### Step 3: Configuración de CORS con Credenciales (`SecurityConfigurations.java`)

Asegurar que Spring Security admita el envío de cookies entre orígenes (`allowCredentials`):

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("https://tu-ecommerce.com", "http://localhost:5173"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true); // <--- OBLIGATORIO para enviar y recibir cookies HttpOnly

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

### 4.2. Cambios requeridos en el Frontend (React / TypeScript)

#### Step 1: Habilitar `credentials: 'include'` en las Peticiones HTTP

Para que el navegador envíe automáticamente la cookie `HttpOnly` en cada llamada a la API, se debe agregar `credentials: 'include'` en los clientes de consulta (`fetch`):

```ts
// Ejemplo en authApi.ts / profileApi.ts / cartApi.ts
export async function listUsuarios(): Promise<UserApi[]> {
    const response = await fetch(`${API_URL}/api/auth/usuarios`, {
        method: 'GET',
        credentials: 'include', // <--- Envía la cookie HttpOnly automáticamente
    });
    return handleAuthenticatedJson(response, userListSchema);
}
```

#### Step 2: Remover lectura/escritura de `localStorage` en `useAuthLogic.ts`

```ts
// Al hacer login:
const login = useCallback(async (email: string, password: string) => {
    // La cookie "token" la establece automáticamente el servidor mediante Set-Cookie
    const data = await authApi.login(email, password);

    setIsAuthenticated(true);
    setUserRol(data.rol);
    // Ya NO hacemos: localStorage.setItem('token', data.token);
    return { success: true, rol: data.rol };
}, []);

// Al verificar sesión al cargar la app:
useEffect(() => {
    // Hacemos una petición GET /api/usuarios/perfil con credentials: 'include'
    profileApi.getPerfil()
        .then(user => {
            setIsAuthenticated(true);
            setUserRol(user.rol);
        })
        .catch(() => {
            setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
}, []);
```

---

## 5. Resumen de la Comparativa de Almacenamiento

| Criterio | `localStorage` (Actual) | Cookies `HttpOnly` (Recomendado) |
| :--- | :--- | :--- |
| **Acceso desde JS (`document.cookie` / `localStorage`)** | Sí (Vulnerable a exfiltración XSS) | **No** (Inmune a lectura por XSS) |
| **Protección contra Robo de Sesión** | Baja | **Alta** |
| **Gestión Automática por Navegador** | Manual (`headers: Authorization`) | **Automática** (`credentials: 'include'`) |
| **Protección CSRF** | Nativa (No envía token en cross-site) | Requiere `SameSite=Lax` / `Strict` |

---
*Documento generado como parte del informe de evaluación e implementación de mejoras de seguridad del frontend.*

