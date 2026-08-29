# Resumen de Implementación — Favoritos (Backend)

## Objetivo
Implementar la persistencia de productos favoritos en la base de datos, reemplazando el almacenamiento local del navegador (`localStorage`) como fuente de verdad. Solo usuarios autenticados pueden gestionar favoritos.

---

## Archivos Creados

### Base de Datos
| Archivo | Descripción |
|---|---|
| `src/main/resources/db/migration/V23__create_favoritos.sql` | Migración Flyway. Crea la tabla `favoritos` con clave primaria compuesta `(usuario_id, producto_id)`, foreign keys hacia `usuarios` y `productos` con `ON DELETE CASCADE`, y columna `creado_at`. |

### Dominio (`com.jeplabs.ecommerce.domain.favorito`)
| Archivo | Descripción |
|---|---|
| `FavoritoId.java` | Clase `@Embeddable` que representa la clave primaria compuesta (`usuarioId`, `productoId`). |
| `Favorito.java` | Entidad JPA. Usa `@EmbeddedId` con `@MapsId` hacia `Usuario` y `Producto`. Registra `creadoAt` automáticamente al construirse. |
| `FavoritoRepository.java` | Repositorio Spring Data JPA con consultas derivadas: listar por usuario, verificar existencia y eliminar por usuario+producto. |
| `FavoritoService.java` | Servicio transaccional con la lógica de negocio: listar, verificar, agregar (idempotente) y eliminar favoritos. |
| `DatosRespuestaFavorito.java` | DTO de respuesta diseñado para acoplarse directamente con la interfaz `FavoriteProduct` del frontend. Incluye precio de venta actual, moneda e imagen principal del producto. |

### Controlador (`com.jeplabs.ecommerce.controller`)
| Archivo | Descripción |
|---|---|
| `FavoritoController.java` | Controlador REST con documentación Swagger/OpenAPI. Todos los endpoints requieren autenticación JWT (cubierto por `anyRequest().authenticated()` en `SecurityConfigurations`). |

---

## Endpoints REST

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/api/favoritos` | Lista todos los favoritos del usuario autenticado, ordenados por fecha descendente | `200` — `List<DatosRespuestaFavorito>` |
| `GET` | `/api/favoritos/{productoId}/existe` | Verifica si un producto está en los favoritos del usuario | `200` — `true` / `false` |
| `POST` | `/api/favoritos/{productoId}` | Agrega un producto a favoritos. Si ya existe, devuelve el existente sin duplicar (idempotente) | `200` — `DatosRespuestaFavorito` |
| `DELETE` | `/api/favoritos/{productoId}` | Elimina un producto de los favoritos del usuario | `204 No Content` |

---

## Estructura del DTO de Respuesta

```json
{
    "productId": 1,
    "slug": "laptop-dell-ultrabook",
    "nombre": "Dell Ultrabook Pro Plus 14",
    "precioVenta": 899990,
    "moneda": "CLP",
    "imagenUrl": "/uploads/productos/dell-ultrabook.jpg",
    "guardadoAt": "2026-08-28T23:05:00"
}
```

Este formato es compatible directamente con la interfaz `FavoriteProduct` que ya usa el frontend.

---

## Esquema de Base de Datos

```sql
CREATE TABLE favoritos (
    usuario_id  BIGINT    NOT NULL,
    producto_id BIGINT    NOT NULL,
    creado_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, producto_id),
    FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
```

> **Nota:** `ON DELETE CASCADE` garantiza que si se elimina un usuario o un producto, sus registros de favoritos se limpian automáticamente.

---

## Verificación
- **Tests ejecutados:** `.\mvnw.cmd clean test -q` → **48 tests, 0 fallos, 0 errores** (`exit code 0`).
- **Repositorios detectados:** Spring Data encontró **16 JPA repository interfaces** (antes 15), confirmando el registro correcto de `FavoritoRepository`.
- **Sin cambios en el frontend:** El código del frontend no fue modificado. Cuando se desee conectar, se reemplazarán las llamadas a `localStorage` en `favorites-storage.ts` por llamadas `fetch` a los endpoints documentados arriba.
