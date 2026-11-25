# Guía de Implementación Frontend — Gestión de Banners del Home

Esta guía especifica cómo implementar el módulo de **Gestión de Banners y Contenido del Home** en el frontend (`React 19 + TypeScript 6 + Vite 7 + Bulletproof React`), ya integrado con el contrato real implementado en el backend (`/api/banners`).

> **Nota sobre la propuesta original**: El documento en `frontend/docs/proposals/plan-gestion-banners-home.md` se conserva sin cambios como propuesta histórica. Esta guía refleja las rutas, contratos y convenciones reales del repositorio (`frontend/AGENTS.md`).

---

## 1. Contrato REST del Backend (Ya Implementado)

El backend expone un único controlador `BannerController` bajo `/api/banners`:

| Operación | Método y Ruta | Autenticación | Descripción |
| :--- | :--- | :--- | :--- |
| Listar vigentes (Home) | `GET /api/banners?seccion=HERO_CAROUSEL` | **Público** | Devuelve solo banners con `activo=true` y dentro de `[fechaInicio, fechaFin]`, ordenados por `orden ASC, id ASC`. |
| Listar todos (Admin) | `GET /api/banners/admin?seccion=HERO_CAROUSEL` | `ROLE_ADMIN` | Devuelve activos, inactivos, programados y expirados. El parámetro `seccion` es opcional. |
| Obtener por ID | `GET /api/banners/admin/{id}` | `ROLE_ADMIN` | Devuelve un banner específico (`404` si no existe). |
| Crear banner | `POST /api/banners` | `ROLE_ADMIN` | Crea un banner (`201 Created`). Si `orden` se omite/`null`, asigna `max(orden) + 1` en la sección. |
| Actualizar banner | `PUT /api/banners/{id}` | `ROLE_ADMIN` | Actualiza todos los campos (`200 OK`). Enviar `""` o `null` en `mobileUrl`, `linkUrl`, `fechaInicio` o `fechaFin` limpia el campo. |
| Pausar / Reactivar | `PATCH /api/banners/{id}/estado` | `ROLE_ADMIN` | Invierte `activo` (`true <-> false`) sin eliminar el registro (`200 OK`). |
| Reordenar | `PUT /api/banners/reordenar` | `ROLE_ADMIN` | Recibe `{ "bannerIds": [3, 1, 2] }` y reasigna `orden = 1..N` atómicamente (`200 OK`). |
| Eliminar | `DELETE /api/banners/{id}` | `ROLE_ADMIN` | Eliminación física definitiva (`204 No Content`). Para pausar campañas usar `PATCH .../estado`. |

### Secciones soportadas (`SeccionBanner`)
- `HERO_CAROUSEL` (Carrusel principal del Home — fase inicial)
- `GRID_PROMO` (Reservado para futuras grillas promocionales)
- `ANUNCIO_CINTILLO` (Reservado para futuros cintillos/anuncios)

### Ejemplo de Respuesta JSON (`DatosRespuestaBanner`)
```json
{
  "id": 1,
  "seccion": "HERO_CAROUSEL",
  "titulo": "Promoción de verano",
  "desktopUrl": "https://res.cloudinary.com/demo/image/upload/banner-desktop.webp",
  "mobileUrl": "https://res.cloudinary.com/demo/image/upload/banner-mobile.webp",
  "linkUrl": "/categoria/computacion",
  "orden": 1,
  "activo": true,
  "fechaInicio": "2026-11-01T00:00:00",
  "fechaFin": "2026-11-30T23:59:59",
  "createdAt": "2026-11-01T10:15:30",
  "updatedAt": "2026-11-01T10:15:30"
}
```

### Reglas de Validación del Backend (`400 Bad Request`)
- `titulo`: obligatorio, máximo 150 caracteres.
- `desktopUrl`: obligatoria, máximo 500 caracteres, debe iniciar con `http://` o `https://`.
- `mobileUrl`: opcional, máximo 500 caracteres; si se envía, debe iniciar con `http://` o `https://`.
- `linkUrl`: opcional, máximo 500 caracteres; acepta rutas relativas (`/categoria/audio`) o `http://`/`https://`. Rechaza `javascript:`, `data:`, `vbscript:`.
- `fechaFin`: si se envían ambas fechas, debe ser estrictamente posterior a `fechaInicio`.
- `orden`: entero `>= 1`.

---

## 2. Arquitectura en Bulletproof React (`src/features/banners/`)

Crear la feature autocontenida siguiendo el mismo patrón de `src/features/branches/`:

```text
frontend/src/features/banners/
├── api/
│   ├── bannerApi.ts
│   └── bannerApi.test.ts
├── components/
│   ├── AdminBannersView/
│   │   ├── AdminBannersView.tsx
│   │   ├── AdminBannersView.module.css
│   │   ├── AdminBannersView.test.tsx
│   │   └── index.ts
│   ├── AdminBannersTable/
│   │   ├── AdminBannersTable.tsx
│   │   ├── AdminBannersTable.module.css
│   │   └── index.ts
│   ├── BannerModalForm/
│   │   ├── BannerModalForm.tsx
│   │   ├── BannerModalForm.module.css
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── usePublicBanners.ts
│   ├── useAdminBanners.ts
│   └── index.ts
├── services/
│   ├── bannerCloudinaryService.ts
│   └── bannerCloudinaryService.test.ts
├── types/
│   ├── api.ts
│   ├── forms.ts
│   └── index.ts
└── index.ts
```

> **Regla anti-ciclos**: En `src/features/banners/index.ts` exporta solo la API pública (`AdminBannersView`, `usePublicBanners`, `BannerApi`, `BannerSection`). Nunca importes entre archivos hermanos pasando por el barrel `../index.ts`.

---

## 3. Contratos TypeScript y Esquemas Zod (`types/`)

### `types/api.ts`
```ts
import { z } from 'zod';
import { positiveIntSchema } from '@/utils';

export const bannerSectionSchema = z.enum([
    'HERO_CAROUSEL',
    'GRID_PROMO',
    'ANUNCIO_CINTILLO',
]);

export type BannerSection = z.infer<typeof bannerSectionSchema>;

export const bannerApiSchema = z.object({
    id: positiveIntSchema,
    seccion: bannerSectionSchema,
    titulo: z.string(),
    desktopUrl: z.string(),
    mobileUrl: z.string().nullable(),
    linkUrl: z.string().nullable(),
    orden: z.number().int().min(1),
    activo: z.boolean(),
    fechaInicio: z.string().nullable(),
    fechaFin: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const bannerListSchema = z.array(bannerApiSchema);

export type BannerApi = z.infer<typeof bannerApiSchema>;

export interface CreateBannerRequest {
    seccion?: BannerSection;
    titulo: string;
    desktopUrl: string;
    mobileUrl?: string | null;
    linkUrl?: string | null;
    orden?: number | null;
    activo?: boolean;
    fechaInicio?: string | null;
    fechaFin?: string | null;
}

export type UpdateBannerRequest = CreateBannerRequest;
```

### `types/forms.ts`
Validar con `zod` + `react-hook-form` (`@hookform/resolvers/zod`):
- `titulo`: requerido, `max(150)`.
- `desktopUrl`: requerido, URL `http://` o `https://`.
- `mobileUrl`: opcional (`''` o URL `http(s)://`).
- `linkUrl`: opcional (rechazar `javascript:`, `data:`, `vbscript:`).
- `activo`: boolean (default `true`).
- `fechaInicio` / `fechaFin`: strings opcionales (`datetime-local`). Agregar `.refine(...)` verificando que si ambas están presentes, `new Date(fechaFin) > new Date(fechaInicio)`.
- Exportar `type BannerFormValues = z.infer<typeof bannerFormSchema>`.

---

## 4. Capa API (`api/bannerApi.ts`)

Seguir el patrón exacto de `src/features/branches/api/branchApi.ts`:
- Usar `fetch` nativo + `API_URL` de `@/config`.
- Para rutas admin, usar `getAuthHeaders(getToken())` y `notifyUnauthorizedIfNeeded(response.status)` de `@/lib/http-session`.
- Validar todas las respuestas con `parseApi(bannerListSchema, raw)` o `parseApi(bannerApiSchema, raw)` de `@/lib`.
- Lanzar `ApiError(getErrorMessage(raw, fallback), response.status, raw)` cuando `!response.ok`.

---

## 5. Servicio Cloudinary Dedicado (`services/bannerCloudinaryService.ts`)

- Crear un servicio propio dentro de `features/banners/services/` (no importar desde `features/admin/services/cloudinaryService.ts`).
- Leer `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_BANNER_PRESET` (con fallback `'ecommerce_banners'`).
- Documentar en `frontend/.env.example`:
  ```env
  VITE_CLOUDINARY_BANNER_PRESET=ecommerce_banners
  ```
- Validar MIME types (`image/jpeg`, `image/png`, `image/webp`) y peso máximo (`10MB`), con callback `onProgress?: (percent: number) => void`.
- Nota: `netlify.toml` ya incluye `img-src 'self' data: https: blob:` y `connect-src 'self' http: https:`, por lo que no requiere ajustes de CSP.

---

## 6. Hooks y Componentes UI

- **Estilos**: Usar exclusivamente **CSS Modules** (`*.module.css`) con tokens de `src/app/styles/` y componentes base de `@/components/ui/` (`Modal`, `Button`, `Input`, `Table`, etc.). Prohibido Tailwind o librerías UI externas.
- **`usePublicBanners(seccion: BannerSection)`**:
  - Consulta `bannerApi.listarPublicos(seccion)` al montar.
  - Expone `{ banners, isLoading, error }`.
- **`useAdminBanners(seccion: BannerSection)`**:
  - Gestiona listado admin, creación, edición, `toggleEstado`, `moveUp` / `moveDown` (calculando el nuevo arreglo de IDs y llamando a `bannerApi.reordenarAdmin(bannerIds)`), y eliminación física con confirmación.
  - Mostrar notificaciones con `useToast()`.
- **`BannerModalForm`**:
  - Dropzone/selector dual para **Imagen Desktop** (recomendado `1920×600`, obligatorio) e **Imagen Mobile** (recomendado `800×800`, opcional, aclarando que aplica en viewports `<= 768px`).
  - Barra de progreso durante la subida a Cloudinary y vista previa inmediata.
  - Switch `Activo` y campos opcionales `fechaInicio` / `fechaFin` (`type="datetime-local"`).
- **`AdminBannersTable`**:
  - Miniaturas desktop/mobile, título, enlace, badge de vigencia (`Activo`, `Inactivo`, `Programado`, `Expirado`), botones `⬆ Subir` / `⬇ Bajar`, toggle rápido, editar y eliminar (con modal/diálogo de confirmación advirtiendo eliminación definitiva).

---

## 7. Adaptación Obligatoria de `Carousel.tsx`

En `frontend/src/components/ui/Carousel/Carousel.tsx`:
1. Hacer opcionales `mobileSrc` y `link` en `CarouselSlide`:
   ```ts
   export type CarouselSlide = {
       desktopSrc: string;
       mobileSrc?: string | null;
       alt: string;
       link?: string | null;
   };
   ```
2. En `<source media="(max-width: 768px)" srcSet={slide.mobileSrc || slide.desktopSrc} />` usar `desktopSrc` como fallback cuando `mobileSrc` sea `null`.
3. Renderizar el enlace según su tipo:
   - Si `!slide.link`: renderizar solo `<picture>` y overlay (sin `<Link>`).
   - Si `slide.link` inicia con `http://` o `https://`: renderizar `<a href={slide.link} target="_blank" rel="noopener noreferrer" className={styles.slideLink} aria-label={slide.alt}>`.
   - Si es ruta interna: renderizar `<Link to={slide.link} className={styles.slideLink} aria-label={slide.alt}>`.

---

## 8. Integración en Home Público y Panel Admin

### Home Público (`frontend/src/app/routes/home/HomeContent.tsx`)
- Llamar a `usePublicBanners('HERO_CAROUSEL')`.
- Mapear `BannerApi[]` a `CarouselSlide[]`:
  ```ts
  const dynamicSlides: CarouselSlide[] = banners.map((b) => ({
      desktopSrc: b.desktopUrl,
      mobileSrc: b.mobileUrl,
      alt: b.titulo,
      link: b.linkUrl,
  }));
  ```
- **Fallback resiliente**: Si `isLoading`, hubo `error`, o `dynamicSlides.length === 0`, renderizar `HOME_HERO_SLIDES` de `./home-slides` para evitar espacios vacíos o Layout Shift.

### Panel Admin
1. Crear `frontend/src/app/routes/admin/banners.tsx`:
   ```tsx
   import { AdminBannersView } from '@/features/banners';

   export default function AdminBannersRoute() {
       return <AdminBannersView />;
   }
   ```
2. Registrar en `frontend/src/app/router/AppRouter.tsx` con `lazy(() => import('@/app/routes/admin/banners'))` dentro de `<Route element={<AdminLayout />}>`:
   ```tsx
   <Route
       path="/admin/banners"
       element={
           <PrivateRoute requiredRol="ROLE_ADMIN">
               <AdminBannersPage />
           </PrivateRoute>
       }
   />
   ```
3. Actualizar `frontend/src/components/layout/AdminLayout/AdminLayout.tsx`:
   - Agregar `banners: 'Banners'` en `ROUTE_LABELS`.
   - Agregar `<NavLink to="/admin/banners" ...>Banners</NavLink>` en la barra de pestañas admin.

---

## 9. Pruebas y Checklist de Validación

1. **MSW (`src/test/msw/`)**:
   - Crear `fixtures/banners-registry.ts` y registrar handlers en `handlers.ts` para `GET /api/banners`, `GET /api/banners/admin`, `POST /api/banners`, `PUT /api/banners/:id`, `PATCH /api/banners/:id/estado`, `PUT /api/banners/reordenar` y `DELETE /api/banners/:id`.
2. **Vitest**:
   - `bannerCloudinaryService.test.ts` (validación MIME, tamaño 10MB, progreso y errores).
   - `bannerApi.test.ts` (contratos Zod, headers auth, manejo de `401`/`400`).
   - `AdminBannersView.test.tsx` (crear, editar, toggle estado, reordenar, eliminar).
   - Actualizar `src/app/routes/home/home.test.tsx` (mockeando siempre el módulo de origen, nunca el barrel `@/app/providers`).
3. **Verificación obligatoria antes de cerrar**:
   ```bash
   pnpm --dir frontend exec tsc --noEmit
   pnpm --dir frontend build
   pnpm --dir frontend test
   ```
