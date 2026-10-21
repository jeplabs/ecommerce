# Arquitectura de doble token (Access + Refresh) en Spring Boot para un e-commerce

## Duda inicial

Para un e-commerce con Spring Boot y JWT, el estándar de la industria no se basa en extender la vida de un único token ni en forzar al usuario a iniciar sesión a cada momento, sino en una arquitectura de doble token (Access Token + Refresh Token). **¿Cómo funciona esa arquitectura, con gran detalle?**

---

## La idea central

Se separan dos responsabilidades que un solo token no puede cumplir bien a la vez:

- **Access Token (AT):** autoriza peticiones a la API. Vive poco (5-15 min) y es *stateless*: el servidor lo valida solo con la firma, sin consultar la BD.
- **Refresh Token (RT):** solo sirve para obtener nuevos AT. Vive mucho (7-30 días) y es *stateful*: se guarda en servidor, así que se puede revocar.

Si roban un AT, el daño dura minutos. Si roban un RT, puedes invalidarlo. El usuario no vuelve a loguearse en semanas.

---

## Flujo completo

1. **Login:** `POST /auth/login` con credenciales. El servidor valida y responde con AT + RT.
2. **Uso normal:** el cliente envía `Authorization: Bearer <AT>` en cada petición. Un filtro de Spring verifica firma, `exp` y claims.
3. **Expiración:** la API responde `401`. El cliente (un interceptor) llama a `POST /auth/refresh` con el RT.
4. **Refresh:** el servidor valida el RT contra la BD, emite un AT nuevo y un RT nuevo (rotación), e invalida el anterior.
5. **Logout:** el servidor marca el RT como revocado. El AT muere solo por expiración.
6. **RT expirado o revocado:** el cliente debe volver a iniciar sesión.

---

## Qué contiene cada token

**Access Token (JWT firmado):** `sub` (id de usuario), `roles`, `iat`, `exp`, `jti`. Nada sensible: un JWT está firmado, no cifrado.

**Refresh Token:** puede ser un JWT o, mejor aún, una cadena aleatoria opaca de 256 bits. Lo importante es que el servidor guarda **solo su hash** (SHA-256) en una tabla:

```
refresh_tokens(id, user_id, token_hash, family_id,
               expires_at, revoked, replaced_by, created_at,
               ip, user_agent)
```

Guardar el hash es como guardar contraseñas: si se filtra la BD, los tokens no sirven.

---

## Rotación y detección de reutilización

Es la parte más importante de la seguridad. Cada vez que se usa un RT:

- Se marca como usado y se emite uno nuevo en la misma `family_id` (una familia = una sesión de login).
- Si llega un RT **ya usado**, alguien lo robó (o el cliente legítimo y el atacante compiten). El servidor revoca **toda la familia** y obliga a re-login.

Así, un RT robado tiene vida útil muy corta en la práctica.

---

## Dónde guardar los tokens

**Web (navegador):**
- **RT:** cookie `HttpOnly; Secure; SameSite=Strict` (o `Lax`), con `Path=/auth/refresh`. JavaScript no puede leerla, lo que bloquea el robo por XSS.
- **AT:** en memoria (variable JS), nunca en `localStorage`. Al recargar la página, se pide uno nuevo con la cookie del RT.
- Con cookies hay que considerar **CSRF**: `SameSite` ayuda y el endpoint de refresh debe aceptar solo POST.

**Móvil:** Keychain (iOS) / Keystore (Android), ambos en almacenamiento seguro.

---

## Implementación en Spring Boot (esquema)

**Dependencias:** `spring-boot-starter-security`, `spring-boot-starter-oauth2-resource-server` (o `jjwt`/`nimbus-jose-jwt`), `spring-boot-starter-data-jpa`.

**Componentes:**
- `JwtService`: genera y valida ATs. Mejor firma asimétrica (RS256/ES256) si hay varios microservicios; HS256 basta en un monolito, con secreto de 256+ bits en variable de entorno o vault.
- `RefreshTokenService`: crea, rota, revoca y detecta reutilización (transaccional).
- `JwtAuthenticationFilter` (extiende `OncePerRequestFilter`): extrae el Bearer, valida y puebla el `SecurityContext`.
- `AuthController`: `/login`, `/refresh`, `/logout`, `/logout-all`.
- `SecurityFilterChain`: sesión `STATELESS`, CSRF deshabilitado para la API con Bearer, `/auth/**` público, resto autenticado.

Pseudocódigo del refresh:

```java
@Transactional
public TokenPair refresh(String rawToken) {
    var stored = repo.findByTokenHash(sha256(rawToken))
        .orElseThrow(InvalidTokenException::new);

    if (stored.isRevoked()) {            // reutilización detectada
        repo.revokeFamily(stored.getFamilyId());
        throw new TokenReuseException();
    }
    if (stored.getExpiresAt().isBefore(Instant.now()))
        throw new ExpiredTokenException();

    stored.setRevoked(true);
    var next = createRefreshToken(stored.getUser(), stored.getFamilyId());
    stored.setReplacedBy(next.id());
    return new TokenPair(jwtService.generateAccess(stored.getUser()), next.raw());
}
```

---

## Revocar el Access Token (si hace falta)

Como el AT es stateless, no se puede invalidar antes de que expire. Opciones:

- **Aceptar la ventana de 5-15 min** (lo más común y suficiente).
- **Denylist en Redis** de `jti` revocados, con TTL igual al tiempo restante del token. Útil para cambios de contraseña, baneos o "cerrar todas las sesiones".
- **`token_version` en el usuario**, incluido como claim. Si no coincide con la BD, se rechaza (cuesta una consulta, aunque se puede cachear).

---

## Consideraciones específicas de e-commerce

- **Roles distintos:** admin/backoffice con AT más corto (5 min) y RT más corto; clientes con sesiones largas para no perder carritos ni conversiones.
- **Operaciones sensibles** (cambiar email, contraseña, métodos de pago): exigir **re-autenticación** aunque el AT sea válido.
- **Multi-dispositivo:** una familia por dispositivo; permite "ver sesiones activas" y cerrar una sola.
- **Carrito de invitados:** se maneja con un identificador aparte, no con JWT. Al hacer login se fusiona con el del usuario.
- **Cambio de contraseña o sospecha de robo:** revocar todas las familias del usuario.
- **Limpieza:** job programado (`@Scheduled`) que borra RTs expirados.
- **Rate limiting** en `/login` y `/refresh` contra fuerza bruta.
- **HTTPS obligatorio** siempre.

---

## Resumen de parámetros recomendados

| | Access Token | Refresh Token |
|---|---|---|
| Duración | 5-15 min | 7-30 días |
| Formato | JWT firmado | Opaco aleatorio |
| Estado | Stateless | Stateful (hash en BD) |
| Web | Memoria | Cookie HttpOnly |
| Revocable | Solo con denylist | Sí, siempre |
| Rotación | No | En cada uso |
