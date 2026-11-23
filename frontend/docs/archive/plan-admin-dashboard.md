# Plan: Dashboard Admin — Rediseño con Analytics y Gráficos

## Estado actual

La vista `/admin` es un componente mínimo con 4 botones apilados verticalmente: Usuarios, Productos, Pedidos y Cerrar sesión. No muestra estadísticas, gráficos ni resumen de datos.

### Decisiones de diseño
- **No se modifica el backend** → se calculan stats en frontend llamando endpoints existentes
- **Se mantiene CSS Modules + design system actual** (tokens.css, dark theme)

---

## 1. Navegación — Tabs y Breadcrumb

### Tabs: visibles solo en vistas principales

**Mejor práctica:** Los tabs se muestran en las vistas "landing" de cada sección, pero se ocultan en sub-rutas (edición, creación). Esto reduce clutter y da más espacio a formularios y tablas detalladas.

| Ruta | Tabs visibles | Breadcrumb |
|---|---|---|
| `/admin` | Sí | No |
| `/admin/users` | Sí | No |
| `/admin/products` | Sí | No |
| `/admin/orders` | Sí | No |
| `/admin/products/new` | No | Sí: `Admin / Productos / Nuevo` |
| `/admin/products/edit/:id` | No | Sí: `Admin / Productos / Editar` |
| `/admin/users/:id/edit` | No | Sí: `Admin / Usuarios / Editar` |

**Implementación:** En `AdminLayout.tsx`, se verifica la ruta actual. Si contiene `/new`, `/edit`, o un ID de sub-ruta, se ocultan los tabs y se muestra el breadcrumb.

```tsx
const location = useLocation();
const isSubRoute = /\/(new|edit|\d+\/edit)/.test(location.pathname);

{!isSubRoute && (
    <nav className={styles.tabs}>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/users">Usuarios</NavLink>
        <NavLink to="/admin/products">Productos</NavLink>
        <NavLink to="/admin/orders">Pedidos</NavLink>
        <button onClick={logout}>Cerrar sesión</button>
    </nav>
)}

{isSubRoute && <Breadcrumb />}
```

**Breadcrumb:** Se genera automáticamente desde la URL actual. Componente propio en `src/shared/ui/Breadcrumb/` o inline en AdminLayout.

---

## 2. Librerías de gráficos — Comparativa

### Opción A: **Recharts** (Recomendada)
- **Bundle:** ~35KB gzipped
- **Tipo:** Declarativo, SVG-based, construido sobre D3
- **Gráficos:** Bar, Line, Area, Pie, Radar, Scatter, Treemap, Sankey
- **Ventajas:** Simple API, React-native, muy buena documentación, comunidad grande
- **Desventaja:** Menos tipos de gráfico que Nivo
- **Ejemplos:** Shopify admin, dashboards SaaS estándar
- `npm install recharts`

### Opción B: **Chart.js + react-chartjs-2**
- **Bundle:** ~20KB gzipped (el más liviano)
- **Tipo:** Canvas-based (no SVG)
- **Gráficos:** Bar, Line, Pie, Doughnut, Radar, Scatter, Bubble, Polar
- **Ventajas:** Extremadamente ligero, renders canvas (mejor performance con muchos datos)
- **Desventaja:** Canvas no es tan flexible como SVG para estilos custom con CSS Modules
- `npm install chart.js react-chartjs-2`

### Opción C: **Nivo**
- **Bundle:** ~80KB gzipped
- **Tipo:** Declarativo, SVG/Canvas, construido sobre D3
- **Gráficos:** 30+ tipos incluyendo heatmaps, treemaps, choropleth, radar, sunburst
- **Ventajas:** Catálogo más extenso, animaciones fluidas, themes built-in
- **Desventaja:** Más pesado, API más compleja
- **Ideal si:** Se necesita heatmaps o visualizaciones avanzadas
- `npm install @nivo/core @nivo/bar @nivo/pie @nivo/line`

### Opción D: **Victory**
- **Bundle:** ~60KB gzipped
- **Tipo:** Declarativo, SVG, construido sobre D3
- **Ventajas:** Muy customizable, SSR, animaciones
- **Desventaja:** Learning curve más pronunciada
- `npm install victory`

### Opción E: **Sin librería** (solo CSS Modules)
- Stat cards + tablas + indicadores de color
- Más control visual, menos dependencias
- **Desventaja:** Sin gráficos de barras/líneas/pie — solo números y badges

### Recomendación: **Recharts**
Es el estándar de facto para dashboards React en 2026. Liviano, declarativo, y el project no tiene ninguna librería de UI externa — Recharts es la más no-opinada (no fuerza diseño propio). Canvas de Chart.js no integra tan bien con CSS Modules para estilos custom.

---

## 3. KPIs y Analytics — Lo que se puede calcular SIN backend

| KPI | Fuente | Cálculo |
|---|---|---|
| Total usuarios | `GET /api/auth/usuarios` | `.length` |
| Usuarios activos | `GET /api/auth/usuarios` | `filter(u => u.activo).length` |
| Productos disponibles | `GET /api/productos/admin?estado=DISPONIBLE` | `totalElements` |
| Productos ocultos | `GET /api/productos/admin?estado=OCULTO` | `totalElements` |
| Productos descontinuados | `GET /api/productos/admin?estado=DESCONTINUADO` | `totalElements` |
| Órdenes totales | `GET /api/ordenes/admin?page=0&size=1` | `totalElements` |
| Órdenes por estado | `GET /api/ordenes/admin?size=1&estado=X` × 6 | `totalElements` de cada |
| Últimas órdenes | `GET /api/ordenes/admin?page=0&size=10` | `content` |
| Ingresos totales | `GET /api/ordenes/admin?page=0&size=100` | Sumar `total` (aproximado) |
| Ticket promedio | Misma query | `sumaTotales / cantidad` |
| Órdenes por día | `GET /api/ordenes/admin?page=0&size=50` | Agrupar por `creadoAt` |
| Métodos de pago | Misma query de órdenes | Agrupar por `formaPago` |
| Servicios de envío | Misma query de órdenes | Agrupar por `servicioEnvio` |
| Top productos | Misma query + `items[]` | Agregar `subtotal` por `nombreProducto` |

### KPIs que NO se pueden calcular sin backend nuevo
- Revenue Per Visitor, Conversion Rate, Cart Abandonment, CAC, CLV, ROAS, churn, NPS, Inventory Turnover, Return Rate

---

## 4. Dashboard — Layout completo

### Fila 1: Stat Cards (4 cards en grid 2×2 desktop, 1 col mobile)

| Card | Valor | Color | Icono |
|---|---|---|---|
| Total Usuarios | count | `var(--indigo)` | 👤 |
| Usuarios Activos | count | `#22c55e` | ✅ |
| Productos Disponibles | count | `var(--violet)` | 📦 |
| Órdenes Pendientes | count | `#fbbf24` | 🛒 |

### Fila 2: Gráficos principales (2 columnas desktop, 1 col mobile)

#### Gráfico A: Órdenes por estado (BarChart vertical)
- **Por qué:** Muestra la salud del pipeline de órdenes. El admin necesita ver cuántas órdenes hay en cada etapa para identificar cuellos de botella.
- **Datos:** 6 estados (PENDIENTE, CONFIRMADA, EN_PROCESO, ENVIADA, ENTREGADA, CANCELADA)
- **Colores:** Cada estado con su color del design system
- **Fuente:** 1 llamada `GET /api/ordenes/admin?page=0&size=200` + agrupación client-side por `estado`

#### Gráfico B: Órdenes por día (AreaChart o BarChart)
- **Por qué:** Muestra la tendencia de ventas en los últimos 14 días. Es el gráfico más importante para ver si las ventas suben o bajan.
- **Datos:** Eje X = fecha, Eje Y = cantidad de órdenes
- **Fuente:** Misma llamada del gráfico A, agrupar por día (`creadoAt`)

### Fila 3: Gráficos secundarios (2 o 3 columnas desktop, 1 col mobile)

#### Gráfico C: Distribución de productos (Donut/PieChart)
- **Por qué:** Vista rápida de la salud del catálogo — cuántos productos están disponibles vs ocultos vs descontinuados.
- **Datos:** 3 segmentos (DISPONIBLE, OCULTO, DESCONTINUADO)
- **Fuente:** 3 llamadas `GET /api/productos/admin?estado=X`

#### Gráfico D: Métodos de pago (BarChart horizontal o PieChart)
- **Por qué:** Entender las preferencias de pago de los clientes — cuántos pagan en línea vs contraentrega.
- **Datos:** EN_LINEA vs CONTRA_ENTREGA
- **Fuente:** Misma query de órdenes, agrupar por `formaPago`

#### Gráfico E: Servicios de envío (BarChart horizontal)
- **Por qué:** Ver qué servicios de envío se usan más (Guatex, RETIRO, Express, etc.). Útil para negociar tarifas.
- **Datos:** Count por `servicioEnvio`
- **Fuente:** Misma query de órdenes, agrupar por `servicioEnvio`

### Fila 4: Tabla de últimas órdenes

Tabla compacta con las 5-8 órdenes más recientes:
- ID, Servicio envío, Total, Estado (pill), Fecha
- Link "Ver todas →" a `/admin/orders`

### Fila 5: Accesos rápidos

3 cards de navegación:
- 👥 Gestionar Usuarios → `/admin/users`
- 📦 Gestionar Productos → `/admin/products`
- 🛒 Gestionar Pedidos → `/admin/orders`

---

## 5. Archivos a crear

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/features/admin/ui/StatCard/StatCard.tsx` | Componente | Card de estadística reutilizable |
| `src/features/admin/ui/StatCard/StatCard.module.css` | Estilos | Estilos del StatCard |
| `src/features/admin/ui/OrdersByStatusChart/OrdersByStatusChart.tsx` | Componente | BarChart de órdenes por estado |
| `src/features/admin/ui/OrdersByStatusChart/OrdersByStatusChart.module.css` | Estilos | Estilos |
| `src/features/admin/ui/OrdersByDayChart/OrdersByDayChart.tsx` | Componente | AreaChart/BarChart de órdenes por día |
| `src/features/admin/ui/OrdersByDayChart/OrdersByDayChart.module.css` | Estilos | Estilos |
| `src/features/admin/ui/ProductDistributionChart/ProductDistributionChart.tsx` | Componente | Donut de productos |
| `src/features/admin/ui/ProductDistributionChart/ProductDistributionChart.module.css` | Estilos | Estilos |
| `src/features/admin/ui/PaymentMethodChart/PaymentMethodChart.tsx` | Componente | Métodos de pago |
| `src/features/admin/ui/PaymentMethodChart/PaymentMethodChart.module.css` | Estilos | Estilos |
| `src/features/admin/ui/ShippingServiceChart/ShippingServiceChart.tsx` | Componente | Servicios de envío |
| `src/features/admin/ui/ShippingServiceChart/ShippingServiceChart.module.css` | Estilos | Estilos |
| `src/features/admin/ui/RecentOrdersTable/RecentOrdersTable.tsx` | Componente | Tabla de últimas órdenes |
| `src/features/admin/ui/RecentOrdersTable/RecentOrdersTable.module.css` | Estilos | Estilos |
| `src/features/admin/model/useDashboardStats.ts` | Hook | Fetch de todas las estadísticas |
| `src/features/admin/model/useOrdersByStatus.ts` | Hook | Órdenes agrupadas por estado |
| `src/features/admin/model/useOrdersByDay.ts` | Hook | Órdenes agrupadas por día |
| `src/features/admin/model/useProductDistribution.ts` | Hook | Productos por estado |
| `src/shared/ui/Breadcrumb/Breadcrumb.tsx` | Componente | Breadcrumb para sub-rutas admin |

---

## 6. Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/widgets/layout/AdminLayout/AdminLayout.tsx` | Agregar tabs condicionales + breadcrumb |
| `src/widgets/layout/AdminLayout/AdminLayout.module.css` | Estilos de tabs y breadcrumb |
| `src/widgets/admin/AdminDashboardView.tsx` | Reemplazar completamente |
| `src/widgets/admin/AdminDashboardView.module.css` | Reemplazar completamente |
| `src/pages/admin/dashboard/ui/AdminDashboardPage.tsx` | Simplificar (quitar onNavigate) |
| `src/widgets/admin/AdminUsersListView.tsx` | Quitar "← Volver al panel" |
| `src/widgets/admin/AdminOrdersView.tsx` | Quitar "← Volver al panel" |
| `src/widgets/admin/AdminProductListView.tsx` | Quitar "← Volver al panel" (si tiene) |

---

## 7. Dependencias a instalar

```bash
npm install recharts          # Gráficos (obligatorio)
npm install lucide-react      # Íconos SVG profesionales (recomendado)
```

---

## 8. Orden de implementación

1. **Instalar dependencias** (recharts + lucide-react)
2. **AdminLayout con tabs condicionales + breadcrumb** — base de navegación
3. **StatCard** — componente reutilizable
4. **useDashboardStats hook** — fetching centralizado de datos
5. **useOrdersByStatus / useOrdersByDay / useProductDistribution** — hooks de datos
6. **Gráficos** — OrdersByStatusChart, OrdersByDayChart, ProductDistributionChart, PaymentMethodChart, ShippingServiceChart
7. **RecentOrdersTable** — tabla resumen
8. **AdminDashboardView** — componer todo
9. **Limpiar "← Volver al panel"** de vistas existentes
10. **Typecheck + tests**

---

## 9. Preguntas pendientes

1. **Librería:** ¿Se confirma Recharts? (Se mantiene documentación de Chart.js, Nivo, Victory para referencia)
2. **Gráficos:** ¿Se implementan los 5 gráficos propuestos (órdenes por estado, órdenes por día, productos, métodos de pago, servicios de envío)?
3. **Íconos:** ¿Se instala lucide-react o se usan emojis/texto?
