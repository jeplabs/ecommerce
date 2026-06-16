# 🛒 JepLabs E-Commerce — Plataforma Tecnológica Completa

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-brightgreen?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=for-the-badge&logo=postgresql&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-green?style=for-the-badge&logo=springsecurity&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-red?style=for-the-badge&logo=flyway&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.4.3-blue?style=for-the-badge&logo=zod&logoColor=white)
![CSS Modules](https://img.shields.io/badge/CSS%20Modules-2.1.1-purple?style=for-the-badge&logo=css-modules&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.1-purple?style=for-the-badge&logo=vite&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9.6.4-red?style=for-the-badge&logo=pnpm&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge)

Plataforma de comercio electrónico (E-Commerce) tecnológica de alto rendimiento, desarrollada de manera colaborativa aplicando buenas prácticas de desarrollo en equipo, arquitectura modular y la metodología Scrum. 

Este proyecto se divide en un **Backend** REST robusto en Spring Boot y un **Frontend** moderno tipo Single Page Application (SPA) en React, orquestados mediante un diseño limpio y una base de datos PostgreSQL automatizada con Flyway.

---

## 👥 Equipo y Roles

| Nombre | Rol | Foco Principal |
|:---|:---|:---|
| **Edwin** | Backend Lead | Arquitectura de persistencia, lógica de negocio y seguridad |
| **Javier** | Backend Support + Scrum Master | Coordinación de sprints, gestión de calidad y soporte técnico |
| **Pablo** | Frontend Lead (React) | Interfaz de usuario, integración de API, routing y diseño modular |

---

## 🚀 Funcionalidades Clave

### 🔐 Seguridad y Gestión de Cuentas
*   **Autenticación JWT:** Emisión y validación de tokens JSON Web Tokens firmados de forma segura.
*   **Bloqueo Temporal de Cuentas:** Registro y control de intentos fallidos de inicio de sesión (`LoginAttemptService`) para mitigar ataques de fuerza bruta.
*   **Recuperación de Contraseña por Correo (SMTP):** Flujo seguro de recuperación mediante tokens con tiempo de expiración definido (`PasswordResetToken`).
*   **Roles y Permisos:** Control de acceso granular a nivel de API con anotaciones `@PreAuthorize` utilizando `ROLE_CUSTOMER` y `ROLE_ADMIN`.
*   **Perfil y Claves:** Edición de perfil de usuario y cambio de contraseña securizado mediante la validación previa de la contraseña actual.

### 📦 Catálogo de Productos y Categorías
*   **Jerarquía de Categorías:** Árbol infinito y estructurado de categorías padres e hijas con URLs amigables basadas en slugs únicos.
*   **Búsqueda y Paginación:** Búsqueda flexible de productos por nombre, SKU y categoría, con soporte nativo de paginación de Spring Data.
*   **Generador Automático de SKUs:** Creación estandarizada de SKUs concatenando propiedades de marca, modelo, capacidad, color y categoría.
*   **Gestión Multimedia:** Subida múltiple de imágenes, establecimiento de imagen principal y eliminación de recursos.
*   **Ciclo de Vida del Producto (Estados):** Control del estado mediante transiciones lógicas:
    *   `DISPONIBLE`: Visible para clientes y comprable.
    *   `SIN_STOCK`: Visible pero bloqueado para compra.
    *   `OCULTO`: No visible para clientes ni comprable.
    *   `DESCONTINUADO`: Estado final permanente (borrado lógico que preserva el historial comercial).
*   **Historial de Precios:** Auditoría automatizada de los cambios de valor a lo largo del tiempo.

### 🛒 Carrito de Compras Activo
*   **Persistencia en Base de Datos:** Carrito sincronizado por usuario autenticado. Se crea o recupera de manera automática al interactuar.
*   **Control del Carrito:** Agregar ítems, modificar cantidades unitarias con validación de stock, eliminar productos y vaciado total.
*   **Expiración Programada:** Configuración del ciclo de vida del carrito en minutos. Un planificador en segundo plano (`Scheduler`) limpia los carritos inactivos y notifica según los parámetros del sistema.

### 📍 Direcciones y Envíos
*   **Direcciones de Clientes:** Mapeo de múltiples ubicaciones de envío por usuario, marcando una como principal con borrado lógico.
*   **Opciones de Despacho:** Servicios de envío (incluyendo *Retiro en tienda*) con tarifas calculadas dinámicamente en base al subtotal del carrito y umbrales de envío gratuito configurables.

### 🧾 Procesamiento de Órdenes (Pedidos)
*   **Checkout Integral:** Conversión directa del carrito activo en una orden de compra, bloqueando el costo de envío, dirección y tasa de IVA del 12% (`IvaCalculator`).
*   **Control de Estados del Pedido:** Flujo formal de la orden mediante los siguientes estados:
    `PENDIENTE` ➔ `CONFIRMADA` ➔ `EN_PROCESO` ➔ `ENVIADA` ➔ `ENTREGADA` o `CANCELADA`.
*   **Cancelación del Cliente:** El cliente puede cancelar su propia orden de manera autónoma únicamente si se encuentra en estado `PENDIENTE` o `CONFIRMADA`.

---

## 🏗️ Arquitectura del Proyecto

### ⚙️ Backend (Capa de Dominio)

El backend de Spring Boot implementa una arquitectura limpia estructurada por dominios lógicos dentro del paquete `com.jeplabs.ecommerce.domain`:

*   **`usuario`:** Entidades de `Usuario`, control de roles (`Rol`), intentos de login e histórico de tokens de restablecimiento de contraseñas.
*   **`categoria`:** Modelado del árbol de categorías jerárquico y generación de slugs.
*   **`producto`:** Gestión del catálogo, relación multimedia (`ProductoImagen`), estados y el histórico de precios (`PrecioHistorial`).
*   **`carrito`:** Lógica del carrito de compras activo y sus líneas de detalle (`CarritoItem`), incluyendo el scheduler de expiración.
*   **`direccion`:** Gestión de múltiples locaciones de entrega y control de residencia del cliente.
*   **`envio`:** Configuración de servicios de entrega, tarifas base e in-store pickup (`ServicioEnvio`).
*   **`orden`:** Control del pedido (`Orden`), líneas de compra (`OrdenItem`), impuestos e integración con el estado de despacho.

### 💻 Frontend (Feature-Sliced Design)

La interfaz React está organizada bajo el patrón arquitectónico **Feature-Sliced Design (FSD)** que impone dependencias estrictas unidireccionales (de arriba hacia abajo):

1.  **`app`:** Inicialización de la SPA, enrutador global y hojas de estilo base (`styles/tokens.css`, `index.css`).
2.  **`pages`:** Composición de las vistas según las rutas del navegador.
3.  **`widgets`:** Componentes grandes y auto-contenidos que estructuran la página (Navbar, layout de tienda, paneles de administración).
4.  **`features`:** Lógica interactiva orientada al usuario (Login/Registro, añadir al carrito, checkout form, filtros).
5.  **`entities`:** Lógica de negocio y modelos tipados compartidos con la API de Spring (User, Product, Cart, Order, Address).
6.  **`shared`:** Código agnóstico al dominio (Design system, cliente HTTP base, funciones de utilidad).

*Para más información sobre la arquitectura del frontend, consulta [frontend/README.md](file:///C:/Users/javie/OneDrive/Escritorio/Nuevo%20Orden/Proyectos/Jeplabs/ecommerce/frontend/README.md).*

---

## 📡 Endpoints del Sistema

### 🔐 Autenticación y Registro (`/api/auth`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registro de nuevos usuarios | Público |
| `POST` | `/api/auth/login` | Login de usuario (retorna Token JWT y datos) | Público |
| `POST` | `/api/auth/forgot-password` | Solicitar token de restablecimiento por correo | Público |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña utilizando token de correo | Público |
| `GET` | `/api/auth/usuarios` | Listar la totalidad de usuarios registrados | 🔒 Admin |
| `GET` | `/api/auth/usuarios/{id}` | Buscar un usuario específico por su ID | 🔒 Admin |
| `PATCH` | `/api/auth/usuarios/{id}/rol` | Actualizar el rol del usuario (ADMIN / CUSTOMER) | 🔒 Admin |
| `PATCH` | `/api/auth/usuarios/{id}/estado` | Activar o desactivar cuenta (previene autodestrucción) | 🔒 Admin |

### 👤 Perfil del Cliente (`/api/usuarios`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/usuarios/perfil` | Ver detalles del perfil del usuario autenticado | 🔒 JWT |
| `PATCH` | `/api/usuarios/perfil` | Modificar datos del perfil (campos parciales) | 🔒 JWT |
| `PATCH` | `/api/usuarios/perfil/password` | Cambiar contraseña requiriendo la clave actual | 🔒 JWT |

### 📍 Gestión de Direcciones (`/api/direcciones`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/direcciones` | Obtener las direcciones registradas del usuario | 🔒 JWT |
| `POST` | `/api/direcciones` | Crear una nueva dirección de despacho | 🔒 JWT |
| `PATCH` | `/api/direcciones/{id}` | Actualizar datos de una dirección propia | 🔒 JWT |
| `PATCH` | `/api/direcciones/{id}/principal` | Establecer una dirección como principal de envío | 🔒 JWT |
| `DELETE` | `/api/direcciones/{id}` | Eliminar lógicamente una dirección propia | 🔒 JWT |
| `GET` | `/api/direcciones/usuario/{usuarioId}` | Listar direcciones de un usuario específico | 🔒 Admin |

### 📂 Categorías del Catálogo (`/api/categorias`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categorias` | Obtener árbol completo de categorías y subcategorías | Público |
| `GET` | `/api/categorias/{id}` | Buscar una categoría específica por ID | Público |
| `GET` | `/api/categorias/slug/{slug}` | Buscar una categoría específica por su slug | Público |
| `POST` | `/api/categorias` | Crear una categoría (raíz o subcategoría) | 🔒 Admin |
| `PATCH` | `/api/categorias/{id}` | Actualizar datos de una categoría | 🔒 Admin |

### 📦 Catálogo de Productos (`/api/productos`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Listar productos filtrados (nombre/categoría) y paginados | Público |
| `GET` | `/api/productos/{id}` | Buscar un producto específico por ID | Público |
| `GET` | `/api/productos/sku/{sku}` | Buscar un producto por su SKU | Público |
| `GET` | `/api/productos/slug/{slug}` | Buscar un producto por su slug | Público |
| `GET` | `/api/productos/{id}/imagenes` | Listar las imágenes asociadas al producto | Público |
| `GET` | `/api/productos/{id}/categorias` | Obtener las categorías vinculadas al producto | Público |
| `GET` | `/api/productos/admin/{id}` | Ver detalles extendidos del producto (vista admin) | 🔒 Admin |
| `GET` | `/api/productos/admin` | Listar todos los productos sin omitir estados | 🔒 Admin |
| `POST` | `/api/productos` | Crear un producto con generación automática de SKU | 🔒 Admin |
| `PATCH` | `/api/productos/{id}` | Actualizar parcialmente campos del producto | 🔒 Admin |
| `PATCH` | `/api/productos/{id}/precio` | Actualizar precio de venta (registra histórico) | 🔒 Admin |
| `PATCH` | `/api/productos/{id}/estado` | Cambiar estado manualmente (`DISPONIBLE`, `OCULTO`…) | 🔒 Admin |
| `DELETE` | `/api/productos/{id}` | Descontinuar producto permanentemente (borrado lógico) | 🔒 Admin |
| `POST` | `/api/productos/{id}/imagenes` | Añadir nuevas imágenes al producto | 🔒 Admin |
| `PATCH` | `/api/productos/{id}/imagenes/{imagenId}/principal` | Definir la imagen principal del producto | 🔒 Admin |
| `DELETE` | `/api/productos/{id}/imagenes/{imagenId}` | Eliminar una imagen asociada al producto | 🔒 Admin |
| `POST` | `/api/productos/{id}/categorias` | Añadir categorías a un producto | 🔒 Admin |
| `DELETE` | `/api/productos/{id}/categorias` | Desvincular categorías de un producto | 🔒 Admin |
| `PUT` | `/api/productos/{id}/categorias` | Reemplazar el listado total de categorías del producto | 🔒 Admin |

### 🛒 Carrito de Compras (`/api/carrito`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/carrito` | Obtener o inicializar el carrito activo del usuario | 🔒 JWT |
| `POST` | `/api/carrito/items` | Agregar un producto al carrito de compras | 🔒 JWT |
| `PATCH` | `/api/carrito/items/{itemId}` | Actualizar la cantidad solicitada de un producto | 🔒 JWT |
| `DELETE` | `/api/carrito/items/{itemId}` | Quitar un producto específico del carrito | 🔒 JWT |
| `DELETE` | `/api/carrito` | Vaciar en su totalidad el carrito activo | 🔒 JWT |
| `PATCH` | `/api/carrito/abandonar` | Forzar el abandono y limpieza del carrito | 🔒 JWT |

### 🚚 Servicios de Envío (`/api/envio`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/envio/opciones` | Listar opciones de despacho calculadas según subtotal | Público |
| `POST` | `/api/envio` | Crear un nuevo servicio de despacho | 🔒 Admin |
| `PATCH` | `/api/envio/{id}` | Actualizar la configuración de un servicio de despacho | 🔒 Admin |
| `DELETE` | `/api/envio/{id}` | Desactivar un servicio de despacho (borrado lógico) | 🔒 Admin |
| `PATCH` | `/api/envio/{id}/activar` | Reactivar un servicio de despacho | 🔒 Admin |

### 🧾 Procesamiento de Pedidos (`/api/ordenes`)

| Método | Ruta | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ordenes` | Listar el historial de órdenes del cliente (paginado) | 🔒 JWT |
| `GET` | `/api/ordenes/{id}` | Obtener detalle de una orden propia por su ID | 🔒 JWT |
| `POST` | `/api/ordenes` | Crear una orden de compra a partir del carrito activo | 🔒 JWT |
| `PATCH` | `/api/ordenes/{id}/cancelar` | Cancelar orden propia (solo si está pendiente/confirmada) | 🔒 JWT |
| `GET` | `/api/ordenes/admin` | Listar todas las órdenes registradas en el sistema | 🔒 Admin |
| `GET` | `/api/ordenes/admin/{id}` | Buscar y ver cualquier orden de compra por ID | 🔒 Admin |
| `PATCH` | `/api/ordenes/admin/{id}/estado` | Cambiar el estado de la orden en el flujo logístico | 🔒 Admin |

---

## 🗄️ Base de Datos e Historial de Migraciones

La base de datos PostgreSQL se gestiona con **Flyway**, ejecutando migraciones ordenadas secuencialmente al arrancar la aplicación de Spring Boot. Los scripts de base de datos se localizan en `backend/src/main/resources/db/migration/`:

1.  `V1__create_usuarios.sql`: Creación de la tabla de usuarios con soporte de seguridad y roles.
2.  `V2__add_apellido_pais_usuarios.sql`: Ampliación del perfil del usuario (apellido y país de residencia).
3.  `V3__add_login_attempts.sql`: Registro numérico de intentos de inicio de sesión para bloqueos.
4.  `V4__add_ultimo_intento_fallido.sql`: Marca temporal del último error de contraseña.
5.  `V5__create_productos_categorias.sql`: Estructura del catálogo (categorías recursivas, productos, imágenes y tabla pivote).
6.  `V6__add_estado_producto.sql`: Columna de control de estados comerciales del producto.
7.  `V7__create_direcciones.sql`: Creación de la tabla de direcciones vinculadas a usuarios con borrado lógico.
8.  `V8__create_carrito.sql`: Estructura del carrito activo y líneas de carrito vinculadas al producto.
9.  `V9__add_carrito_expiracion.sql`: Configuración horaria de abandono del carrito de compras.
10. `V10__create_ordenes.sql`: Estructura transaccional de órdenes, líneas de orden, estado, IVA y costos de envío fijados.
11. `V11__create_servicios_envio.sql`: Gestión de tarifas bases de envío por subtotal y free-shipping threshold.
12. `V12__add_retiro_tienda_servicio_envio.sql`: Configuración para soportar el retiro presencial en bodega sin recargo.
13. `V13__create_password_reset_tokens.sql`: Historial de tokens de seguridad enviados por correo para recuperación de accesos.

---

## ⚙️ Configuración y Ejecución del Entorno

### Requisitos Previos

Asegúrate de contar con lo siguiente instalado en tu entorno local:
*   [Java Development Kit (JDK) 21](https://openjdk.org/projects/jdk/21/)
*   [PostgreSQL Database Server](https://www.postgresql.org/)
*   [Node.js](https://nodejs.org/) (versión 18 LTS o superior)
*   [pnpm](https://pnpm.io/) (versión 9.6.4 o superior)
*   Git

---

### Configuración del Backend

1.  Dirígete a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Copia el archivo de ejemplo de variables de entorno y renómbralo a `application-dev.properties`:
    ```bash
    cp src/main/resources/application-dev.properties.example src/main/resources/application-dev.properties
    ```
3.  Edita `src/main/resources/application-dev.properties` rellenando tus credenciales locales:
    ```properties
    # Configuración de Base de Datos PostgreSQL
    spring.datasource.url=jdbc:postgresql://localhost:5432/TU_DB_NAME
    spring.datasource.username=TU_POSTGRES_USER
    spring.datasource.password=TU_POSTGRES_PASSWORD

    # Seguridad JWT
    api.security.secret=UN_STRING_ALEATORIO_Y_SEGURO_PARA_FIRMA_JWT
    api.security.expiration=7200
    api.security.reset-token-expiracion-minutos=30

    # Configuración de Servidor de Correo SMTP (Gmail u otro)
    spring.mail.host=smtp.gmail.com
    spring.mail.port=587
    spring.mail.username=tu_correo@gmail.com
    spring.mail.password=tu_contraseña_de_aplicacion_gmail
    spring.mail.properties.mail.smtp.auth=true
    spring.mail.properties.mail.smtp.starttls.enable=true

    # Parámetros del Carrito
    api.carrito.expiracion-minutos=12
    api.carrito.notificacion-minutos-antes=5
    api.carrito.scheduler-intervalo=PT3M

    # Configuración del Negocio
    api.impuestos.iva=0.12
    api.envio.monto-minimo-gratis=500.00
    ```

---

### Configuración del Frontend

1.  Dirígete a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Crea un archivo local de entorno de Vite `.env.local` en la raíz de la carpeta `frontend/`:
    ```env
    # URL de conexión con la API REST del backend local
    VITE_API_URL=http://localhost:8080
    ```

---

### Comandos de Arranque

#### 1. Iniciar el Backend (Terminal 1)
```bash
cd backend
./mvnw spring-boot:run
```
*La base de datos se migrará automáticamente gracias a Flyway y el servidor comenzará a escuchar en el puerto `8080`.*
*Puedes consultar la documentación interactiva OpenAPI en Swagger UI: `http://localhost:8080/swagger-ui/index.html`*

#### 2. Iniciar el Frontend (Terminal 2)
```bash
cd frontend
pnpm install
pnpm run dev
```
*El servidor de desarrollo de Vite levantará la interfaz del e-commerce por defecto en `http://localhost:5173`.*

---

## 🤝 Gestión del Proyecto y Flujo de Trabajo

El desarrollo de este proyecto se realiza de manera coordinada bajo el marco ágil **Scrum**:

*   **Jira:** Gestión centralizada del Product Backlog, Sprints activos y tableros Kanban.
*   **Git & GitHub Flow:** 
    *   La rama `main` contiene el código base estable y desplegado.
    *   Toda nueva funcionalidad o corrección se trabaja en ramas descriptivas (`feature/nombre-de-tarea` o `bugfix/nombre-de-tarea`).
    *   Se requiere abrir un Pull Request (PR) y ser revisado/aprobado por otro integrante del equipo antes de su fusión con `main`.
*   **Definition of Done (DoD):** Cada User Story se da por terminada únicamente tras cumplir con:
    *   Correcto tipado TypeScript e integración de validación con Zod en el frontend.
    *   Validaciones de DTOs con `@Valid` y manejo de excepciones controladas en el backend.
    *   Fusión sin conflictos y pruebas manuales exitosas.
