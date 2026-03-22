# 🛒 JepLabs E-commerce

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-brightgreen?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=for-the-badge&logo=postgresql&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-green?style=for-the-badge&logo=springsecurity&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-red?style=for-the-badge&logo=flyway&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge)

API REST de e-commerce tecnológico desarrollada de forma colaborativa con el objetivo de aplicar buenas prácticas de desarrollo en equipo, metodología Scrum y tecnologías modernas del ecosistema Java.

---

## 👥 Equipo

| Nombre | Rol |
|--------|-----|
| Edwin | Backend (principal) |
| Javier | Backend (soporte) + Scrum Master |
| Pablo | Frontend (React) |

---

## 🧰 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Lenguaje | Java 21 |
| Framework | Spring Boot 4.0.0 |
| Seguridad | Spring Security + JWT |
| Base de datos | PostgreSQL |
| Migraciones | Flyway |
| Documentación API | SpringDoc + Redocly |
| Frontend | React (repositorio separado) |
| Gestión de proyecto | Jira + Scrum |
| Control de versiones | Git + GitHub |

---

## 🏗️ Arquitectura del Proyecto

El backend sigue una arquitectura en capas organizada por dominio:

```
com.jeplabs.ecommerce
└── domain
    ├── categoria
    │   ├── Categoria
    │   ├── CategoriaRepository
    │   ├── CategoriaService
    │   ├── DatosCrearCategoria
    │   └── DatosRespuestaCategoria
    ├── producto
    │   ├── Producto
    │   ├── ProductoImagen
    │   ├── PrecioHistorial
    │   ├── ProductoRepository
    │   ├── ProductoImagenRepository
    │   ├── PrecioHistorialRepository
    │   ├── ProductoService
    │   ├── DatosCrearProducto
    │   ├── DatosActualizarProducto
    │   ├── DatosAgregarImagenes
    │   ├── DatosPrecio
    │   ├── DatosRespuestaProducto
    │   ├── DatosRespuestaProductoAdmin
    │   └── DatosRespuestaImagen
    └── usuario
        ├── Usuario
        ├── Rol
        ├── UsuarioRepository
        ├── AutenticacionService
        ├── LoginAttemptService
        ├── DatosLogin
        ├── DatosRegistro
        ├── DatosActualizarPerfil
        ├── DatosActualizarRol
        ├── DatosRespuestaToken
        └── DatosRespuestaUsuario
```

---

## 📡 Endpoints Disponibles

### 🔐 Autenticación
*Registro, login y gestión de usuarios*

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | Público |
| `POST` | `/api/auth/login` | Iniciar sesión | Público |
| `GET` | `/api/auth/usuarios` | Listar todos los usuarios | 🔒 Admin |
| `GET` | `/api/auth/usuarios/{id}` | Buscar usuario por ID | 🔒 Admin |
| `PATCH` | `/api/auth/usuarios/{id}/rol` | Cambiar rol de usuario | 🔒 Admin |

---

### 👤 Perfil
*Datos del usuario autenticado — requiere token JWT*

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/usuarios/perfil` | Ver perfil | 🔒 JWT |
| `PATCH` | `/api/usuarios/perfil` | Actualizar perfil | 🔒 JWT |

---

### 📂 Categorías
*Gestión del árbol jerárquico de categorías*

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/categorias` | Listar todas las categorías | Público |
| `GET` | `/api/categorias/{id}` | Buscar categoría por ID | Público |
| `GET` | `/api/categorias/slug/{slug}` | Buscar categoría por slug | Público |
| `POST` | `/api/categorias` | Crear categoría | 🔒 Admin |
| `PATCH` | `/api/categorias/{id}` | Actualizar categoría | 🔒 Admin |

---

### 📦 Productos
*Catálogo público y gestión admin de productos*

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/productos` | Listar productos | Público |
| `GET` | `/api/productos/{id}` | Buscar producto por ID | Público |
| `GET` | `/api/productos/slug/{slug}` | Buscar producto por slug | Público |
| `GET` | `/api/productos/sku/{sku}` | Buscar producto por SKU | Público |
| `GET` | `/api/productos/{id}/imagenes` | Listar imágenes del producto | Público |
| `GET` | `/api/productos/admin/{id}` | Buscar producto por ID (vista admin) | 🔒 Admin |
| `POST` | `/api/productos` | Crear producto | 🔒 Admin |
| `POST` | `/api/productos/{id}/imagenes` | Agregar imágenes al producto | 🔒 Admin |
| `PATCH` | `/api/productos/{id}` | Actualizar producto | 🔒 Admin |
| `PATCH` | `/api/productos/{id}/precio` | Actualizar precio | 🔒 Admin |
| `PATCH` | `/api/productos/{id}/imagenes/{imagenId}/principal` | Definir imagen principal | 🔒 Admin |
| `DELETE` | `/api/productos/{id}` | Desactivar producto | 🔒 Admin |
| `DELETE` | `/api/productos/{id}/imagenes/{imagenId}` | Eliminar imagen | 🔒 Admin |

---

## 🗺️ Roadmap

### ✅ Listo
- Autenticación con JWT
- Gestión de usuarios y roles
- CRUD de categorías
- CRUD completo de productos (con historial de precios e imágenes)
- Perfil de usuario autenticado
- Documentación API con SpringDoc

### 🔄 En Curso (Sprint Actual)
- Backend: eliminación de productos (soft delete)
- Frontend: formulario de edición de producto
- Frontend: vista de eliminación de productos

### 📋 Backlog
- Gestión de usuarios (admin): listar, desactivar
- Filtro de productos por categoría y búsqueda por nombre
- **Carrito de compras:** agregar, eliminar, modificar cantidades, ver total
- **Órdenes:** crear desde carrito, ver órdenes propias, gestión admin
- **Pagos:** integración con Webpay / Stripe, confirmación automática, reembolsos

---

## ⚙️ Cómo ejecutar el proyecto

### Requisitos

- Java 21
- Maven
- PostgreSQL

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/jeplabs/ecommerce.git
cd ecommerce

# 2. Configurar las variables de entorno
# Crear un archivo .env o configurar application-dev.properties con:
# - URL de la base de datos PostgreSQL
# - Credenciales de la base de datos
# - Secreto JWT

# 3. Ejecutar
./mvnw spring-boot:run
```

> Las migraciones de base de datos se ejecutan automáticamente con **Flyway** al iniciar la aplicación.

---

## 📁 Gestión del Proyecto

El proyecto se gestiona con metodología **Scrum** usando **Jira**:

- Sprints con user stories definidas por rol (usuario / admin)
- Definition of Done por historia
- Subtareas separadas por capa (Backend / Frontend)
- Board activo con columnas: Por Hacer → En Curso → Listo

---

## 🤝 Contribuciones

Este es un proyecto de portafolio colaborativo. Las contribuciones internas del equipo se gestionan mediante ramas por funcionalidad y pull requests revisados antes del merge a `main`.
