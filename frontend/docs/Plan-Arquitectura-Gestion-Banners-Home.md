# Plan de Arquitectura y Especificación — Gestión de Banners y Contenido del Home

Este documento detalla la arquitectura, buenas prácticas, requerimientos de backend y plan de implementación paso a paso para el frontend del nuevo módulo de **Gestión de Banners y Contenido del Home** (carrusel principal y futuros componentes visuales).

---

## 1. Contexto y Respuestas Arquitectónicas Fundamentales

### 1.1. Diagnóstico del Estado Actual
Actualmente, el carrusel de la página de inicio en la tienda pública opera con datos cableados estáticamente en el frontend:
- Ubicación: `frontend/src/app/routes/home/home-slides.ts`.
- Contenido: Arreglo constante `HOME_HERO_SLIDES` con URLs fijas alojadas en un CDN externo (`spdigital.cl`), con `desktopSrc`, `mobileSrc`, `alt` y `link`.
- El administrador de la tienda no tiene ningún medio para modificar promociones, pausar campañas, alterar el orden o cambiar enlaces sin solicitar un cambio de código y un nuevo despliegue.

---

### 1.2. Situación en el Backend: ¿Existen tablas o entidades para banners?
**No, en el backend actualmente no existe ninguna entidad, tabla ni endpoint relativo a banners o carruseles.**

Al auditar la estructura de paquetes en `backend/src/main/java/com/jeplabs/ecommerce/domain/` y el histórico de migraciones SQL (`V1__...` a `V6__...`):
- Los dominios existentes son exclusivamente transaccionales y de catálogo: `producto`, `categoria`, `orden`, `carrito`, `usuario`, `direccion`, `sucursal`, `banco`, `envio`, `favorito` y pasarelas de pago (`pago`, `webpay`, `qpaypro`).
- En el dominio de productos existe la tabla `producto_imagenes`, pero su clave foránea apunta estrictamente a `producto_id` para gestionar la galería del catálogo de artículos.
- **Conclusión**: El backend requiere crear una nueva entidad y migración para persistir banners y exponer la API correspondiente tanto pública como administrativa.

---

### 1.3. Almacenamiento en Cloudinary: ¿Reutilizar servicio existente o crear uno nuevo?
**Se debe crear un servicio dedicado (o parametrizado) para banners y contenido:**
- El servicio actual `frontend/src/features/admin/services/cloudinaryService.ts` tiene quemado en su configuración:
  ```ts
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ecommerce_productos';
  ```
- En Cloudinary, los *unsigned upload presets* determinan la carpeta de destino (`folder`) y las transformaciones automáticas de imagen.
- Si se utilizara ese servicio tal cual, las imágenes del carrusel y piezas publicitarias se mezclarían dentro del directorio de **productos de inventario**, rompiendo el orden de los activos digitales.
- Además, los requisitos de un banner son radicalmente distintos a los de una foto de producto:
  - Formatos panorámicos de alta resolución (16:9 o 21:9 para desktop, ej. 1920×600 o 1440×500).
  - Formatos específicos para móviles (4:5 o 1:1, ej. 800×800 o 600×800).
  - Límites de peso adaptados para assets de diseño gráfico (hasta 5–10 MB).
- **Decisión**: Se implementará un servicio específico `bannerCloudinaryService.ts` que apunte a su propio preset (ej. `ecommerce_banners` vía `VITE_CLOUDINARY_BANNER_PRESET`), aislando los assets publicitarios de las imágenes de artículos.

---

### 1.4. Regla de Aislamiento de Features (Bulletproof React): Home vs. Banners
**El diseño modular respeta estrictamente la regla de "no cruzar dependencias entre features":**
- En **Bulletproof React (BPR)**, una feature (`src/features/A`) nunca debe importar directamente desde las entrañas de otra feature (`src/features/B`).
- **El Home no es una feature**: En este repositorio, la página de inicio reside en `src/app/routes/home/` (capa de rutas de la aplicación).
- En BPR, las rutas (`app/routes`) tienen la responsabilidad expresa de **componer** las distintas features necesarias para conformar una pantalla.
- **Estructura limpia resultante**:
  - Se crea la feature autocontenida `src/features/banners/` (dueña de su API, tipos, estado y componentes de gestión).
  - La ruta pública `src/app/routes/home/` consume el hook público de `features/banners` para renderizar el carrusel.
  - La ruta administrativa `src/app/routes/admin/banners.tsx` (o panel equivalente) consume la vista de gestión de `features/banners`.
  - Ninguna otra feature de negocio (`catalog`, `cart`, `checkout`, `profile`, `auth`) depende de `banners`, garantizando desacoplamiento total.

---

## 2. Comparativa Arquitectónica y Alternativa Seleccionada

### Alternativa A: Biblioteca de Medios Genérica (Digital Asset Management)
- **Concepto**: Un explorador de archivos donde el usuario sube imágenes a granel y obtiene URLs.
- **Desventaja**: No resuelve la lógica de negocio del carrusel: orden de diapositivas, estado activo/pausado, enlaces de destino (redirección a categorías o productos) y asociación dual desktop/mobile.

### Alternativa B: Gestor de Banners y Contenido por Secciones (CMS Modular) — RECOMENDADA
- **Concepto**: Un módulo en el admin (`/admin/banners`) estructurado por **secciones visuales**:
  - **Sección 1 (Fase inicial)**: Carrusel Principal (Hero Slider).
  - **Sección 2 (Futuro)**: Banners Promocionales de Grilla.
  - **Sección 3 (Futuro)**: Cintillos / Popups de Anuncios.
- **Ventajas**:
  - Directo e intuitivo: el administrador gestiona el contenido visual de la página tal como lo ve el cliente.
  - Soporta metadatos de marketing: ordenación visual, enlaces de destino, activación/desactivación con un solo clic y fechas de vigencia programada.

---

## 3. Modelo de Datos del Banner

Tanto para la base de datos como para TypeScript, el modelo de datos contempla:

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | `number` / `Long` | Sí | Identificador único |
| `seccion` | `string` / `Enum` | Sí | Ubicación visual (ej. `'HERO_CAROUSEL'`, `'GRID_PROMO'`) |
| `titulo` | `string` | Sí | Nombre descriptivo y texto alternativo (`alt`) accesible |
| `desktopUrl` | `string` | Sí | URL de imagen en Cloudinary para pantallas de escritorio (>= 1024px) |
| `mobileUrl` | `string` | No | URL de imagen en Cloudinary optimizada para pantallas móviles (< 1024px) |
| `linkUrl` | `string` | No | Ruta interna (`/categoria/audio`) o enlace externo de redirección |
| `orden` | `number` | Sí | Posición relativa de presentación (1, 2, 3...) |
| `activo` | `boolean` | Sí | Switch para habilitar/deshabilitar sin eliminar el banner |
| `fechaInicio` | `ISO 8601` | No | Fecha/hora desde la cual el banner se muestra públicamente |
| `fechaFin` | `ISO 8601` | No | Fecha/hora límite tras la cual se oculta automáticamente |
| `createdAt` | `ISO 8601` | Sí | Timestamp de creación |
| `updatedAt` | `ISO 8601` | Sí | Timestamp de última edición |

---

## 4. Requerimientos para el Equipo de Backend

Para soportar este módulo, el backend en Spring Boot debe implementar:

### 4.1. Base de Datos (Migración Flyway)
Crear archivo de migración `V{X}__crear_tabla_banners.sql`:
```sql
CREATE TABLE banners (
    id BIGSERIAL PRIMARY KEY,
    seccion VARCHAR(50) NOT NULL DEFAULT 'HERO_CAROUSEL',
    titulo VARCHAR(150) NOT NULL,
    desktop_url VARCHAR(500) NOT NULL,
    mobile_url VARCHAR(500),
    link_url VARCHAR(500),
    orden INT NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_seccion_activo ON banners (seccion, activo, orden);
```

### 4.2. Dominio y Lógica (`com.jeplabs.ecommerce.domain.banner`)
1. **Entidad JPA `Banner.java`**:
   - Con anotaciones de validación `@NotBlank`, `@Size`, `@Enumerated` o `String` para `seccion`.
   - Control de auditoría con `@CreationTimestamp` y `@UpdateTimestamp`.
2. **Repositorio `BannerRepository.java`**:
   - `findBySeccionAndActivoTrueOrderByOrdenAsc(String seccion)`: para consulta pública rápida.
   - `findBySeccionOrderByOrdenAsc(String seccion)`: para el listado administrativo completo.
3. **Servicio `BannerService.java`**:
   - CRUD completo con validación de URLs y coherencia de fechas (`fechaFin` posterior a `fechaInicio`).
   - Lógica de reordenamiento atómico (`reordenarBanners(List<Long> bannerIds)`).
   - Cambio rápido de estado (`toggleActivo(Long id)`).

### 4.3. Controladores y Endpoints REST
1. **Público (`BannerController.java`)**:
   - `GET /api/banners?seccion=HERO_CAROUSEL`: devuelve la lista de banners activos, vigentes por fecha y ordenados por `orden ASC`.
2. **Administrativo (`AdminBannerController.java`, requiere `ROLE_ADMIN`)**:
   - `GET /api/admin/banners?seccion={seccion}`: listado completo con activos e inactivos.
   - `POST /api/admin/banners`: creación de un nuevo banner.
   - `PUT /api/admin/banners/{id}`: edición de metadatos e imágenes.
   - `PATCH /api/admin/banners/{id}/estado`: activación/pausa rápida.
   - `PUT /api/admin/banners/reordenar`: recibe arreglo de IDs con el nuevo orden.
   - `DELETE /api/admin/banners/{id}`: eliminación física o lógica.

### 4.4. Seguridad (`SecurityConfigurations.java`)
- Agregar `/api/banners/**` a las rutas permitidas con `permitAll()` para consumo anónimo de clientes no autenticados en el Home.

---

## 5. Plan de Implementación para el Frontend

### Fase 1: Infraestructura y Servicio de Carga
1. **Servicio de Cloudinary dedicado**:
   - Crear `frontend/src/features/banners/services/bannerCloudinaryService.ts`.
   - Utilizar variable de entorno `VITE_CLOUDINARY_BANNER_PRESET` (fallback a preset de banners).
   - Validaciones de tipo (`image/webp`, `image/jpeg`, `image/png`) y peso adaptado.
2. **Capa de API y Tipos**:
   - `frontend/src/features/banners/types/index.ts`: interfaces `Banner`, `BannerInput`, `BannerSection`.
   - `frontend/src/features/banners/api/bannersApi.ts`: llamadas a `GET /api/banners`, `GET /api/admin/banners`, `POST`, `PUT`, `PATCH`, `DELETE`, `PUT reordenar`.
3. **Hook React**:
   - `frontend/src/features/banners/hooks/useBanners.ts`: gestión de estado, filtros por sección, mutaciones con optimistic updates o refetch y manejo de errores.

---

### Fase 2: Componentes de UI de Administración
1. **`BannerModalForm`**:
   - Modal con dropzone dual para imagen Desktop e imagen Mobile.
   - Previsualización en vivo antes de guardar.
   - Campos: Título (`alt`), Enlace de redirección, Sección, Switch Activo y Fechas de vigencia opcionales.
2. **`BannerRow` / `BannerCard`**:
   - Fila con miniatura de ambas imágenes (desktop y mobile).
   - Indicador de estado (pill verde `Activo` / gris `Inactivo`).
   - Botones rápidos: **⬆ Subir**, **⬇ Bajar**, **✏️ Editar**, **🗑️ Eliminar**, y toggle switch para activar/pausar de inmediato.
3. **`AdminBannersView`**:
   - Contenedor principal con pestañas por sección (inicialmente "Carrusel Principal - Home").
   - Botón superior "Nuevo Banner".
   - Integración con el sistema de toasts del proyecto para confirmaciones de guardado.

---

### Fase 3: Integración en Rutas y Menú de Admin
1. **Enrutamiento**:
   - Registrar la ruta `/admin/banners` en `frontend/src/app/routes/admin/` protegida por `RequireAuth` con `ROLE_ADMIN`.
2. **Navegación**:
   - Agregar el ítem visual `🖼️ Banners Home` en el menú del panel de administración (`AdminLayout`).

---

### Fase 4: Integración en el Home Público
1. **Consumo reactivo en `HomeContent.tsx`**:
   - Reemplazar la constante estática `HOME_HERO_SLIDES` por la llamada al hook `useBanners('HERO_CAROUSEL')`.
2. **Resiliencia y Fallback**:
   - Si la API está cargando o no devuelve banners activos, utilizar como fallback transparente los slides por defecto de `home-slides.ts` para garantizar que la tienda pública nunca muestre un espacio vacío.

---

### Fase 5: Pruebas y Validación
1. **MSW Handlers**:
   - Agregar endpoints simulados `GET /api/banners` y `/api/admin/banners` en `frontend/src/test/msw/handlers.ts`.
2. **Tests Unitarios**:
   - Pruebas para `bannerCloudinaryService.test.ts`.
   - Pruebas de integración para `AdminBannersView.test.tsx` (creación, edición, eliminación y cambio de orden).
   - Pruebas para el carrusel en el Home con datos dinámicos y fallback.
3. **Verificación de Build**:
   - Compilación exitosa con `pnpm build` sin warnings ni dependencias circulares.
