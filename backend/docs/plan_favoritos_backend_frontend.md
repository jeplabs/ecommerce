# Plan de Implementación: Favoritos (Backend y Frontend)

## Descripción del Objetivo
Actualmente, el frontend cuenta con una funcionalidad de favoritos que permite a los usuarios autenticados guardar productos. Sin embargo, esta información persiste únicamente en el `localStorage` del navegador del usuario. 
El objetivo de este plan es crear una infraestructura completa en el backend para almacenar los favoritos en la base de datos (PostgreSQL/H2) y refactorizar el frontend para que consuma esta nueva API, permitiendo a los usuarios mantener sus favoritos sincronizados en cualquier dispositivo en el que inicien sesión.

## ⚠️ Revisión Requerida
- **Esquema de Base de Datos:** Se creará una tabla puente `favoritos` entre `usuarios` y `productos`.
- **Contrato API:** El backend devolverá el mismo formato exacto que el frontend usa actualmente (`FavoriteProduct`) para minimizar los cambios en la UI.

## ❓ Preguntas Abiertas
1. **Migración de datos locales:** El frontend actual guarda favoritos en el navegador. ¿Deseas que implementemos un mecanismo de sincronización para subir esos favoritos locales al backend la próxima vez que el usuario inicie sesión, o simplemente limpiamos el `localStorage` y empezamos de cero con la base de datos?
2. **Invitados (Guest):** El código actual rechaza la acción de favoritos si el usuario no está autenticado (redirige al login). ¿Mantenemos este comportamiento o te gustaría permitir favoritos locales para invitados que se asocien a la cuenta al registrarse?

---

## Cambios Propuestos

### 1. Base de Datos (Backend)
Se añadirá un script de migración en Flyway para crear la tabla que registrará qué usuario marcó qué producto.

#### [NUEVO] `backend/src/main/resources/db/migration/V23__create_favoritos.sql`
```sql
CREATE TABLE favoritos (
    usuario_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, producto_id),
    CONSTRAINT fk_favoritos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_favoritos_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
```

### 2. Capa de Dominio y API (Backend)
Se crearán las entidades, repositorio, DTOs, servicio y controlador para la API REST.

#### [NUEVO] `com.jeplabs.ecommerce.domain.favorito.Favorito` (Entidad)
Clase con `@Entity` y clave primaria compuesta (o un `id` autogenerado), mapeando `@ManyToOne` hacia `Usuario` y `Producto`, además de su `createdAt`.

#### [NUEVO] `com.jeplabs.ecommerce.domain.favorito.FavoritoRepository`
Repositorio con los métodos:
- `List<Favorito> findByUsuarioIdOrderByCreadoAtDesc(Long usuarioId)`
- `boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId)`
- `void deleteByUsuarioIdAndProductoId(Long usuarioId, Long productoId)`

#### [NUEVO] `com.jeplabs.ecommerce.domain.favorito.DatosRespuestaFavorito` (DTO)
Estructura diseñada específicamente para acoplarse con la interfaz `FavoriteProduct` del frontend:
```java
public record DatosRespuestaFavorito(
    Long productId,
    String slug,
    String nombre,
    BigDecimal precioVenta,
    String moneda,
    String imagenUrl,
    LocalDateTime guardadoAt
) {}
```

#### [NUEVO] `com.jeplabs.ecommerce.controller.FavoritoController`
Endpoints protegidos (requieren autenticación):
- `GET /api/favoritos`: Devuelve la lista de favoritos del usuario autenticado.
- `POST /api/favoritos/{productId}`: Agrega el producto a favoritos.
- `DELETE /api/favoritos/{productId}`: Elimina el producto de favoritos.

---

### 3. Capa de Integración API (Frontend)
Crearemos el cliente para comunicarse con los nuevos endpoints de Spring Boot.

#### [NUEVO] `frontend/src/features/favorites/api/favoritesApi.ts`
Implementará llamadas tipo `fetch` utilizando el cliente/utilidades estándar del proyecto (`API_URL`, `getAuthHeaders`, `parseApi`):
- `fetchFavorites()`
- `addFavorite(productId: number)`
- `removeFavorite(productId: number)`

### 4. Lógica de UI y Estado (Frontend)
Se modificará el hook actual de estado global para que dependa del backend en vez del storage.

#### [MODIFICAR] `frontend/src/features/favorites/model/useFavoritesLogic.ts`
- Modificaremos `reloadFavorites` para que invoque `favoritesApi.fetchFavorites()`.
- Modificaremos `toggleFavorite` para invocar `addFavorite` / `removeFavorite` en la API (con actualizaciones optimistas si se desea mayor reactividad).
- Reemplazaremos la dependencia del evento local `window.addEventListener('storage', ...)` por recargas controladas de la caché o Contexto.

#### [MODIFICAR/ELIMINAR] `frontend/src/features/favorites/lib/favorites-storage.ts`
- Se eliminará la lógica de escritura y lectura de `localStorage` ya que ahora la fuente de verdad será la base de datos (o se convertirá en un utilitario de migración si decides sincronizar).

---

## Plan de Verificación

### Pruebas Automatizadas (Backend)
- Se ejecutarán las pruebas unitarias y de integración de Maven: `.\mvnw.cmd clean test -q` para verificar que la inclusión de la entidad y las migraciones de Flyway no rompan el contexto de Spring en H2.
- Se verificará la inyección correcta del JWT en `FavoritoController`.

### Pruebas Manuales (Frontend + Backend)
1. Iniciar sesión en el e-commerce.
2. Navegar al detalle de un producto y hacer clic en el botón de Favorito.
3. Verificar que el corazón cambia de estado visualmente.
4. Navegar a `/profile/favorites` y corroborar que el producto aparece renderizado y persistido correctamente.
5. Cerrar sesión, abrir en otra ventana/navegador, iniciar sesión y confirmar que los favoritos siguen allí.
6. Presionar "Quitar" desde la vista de favoritos y verificar que el producto desaparece.
