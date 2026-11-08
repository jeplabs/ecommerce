# Guía de Configuración Multi-País (Guatemala y Chile) e Integración de Moneda en Frontend

Este documento detalla cómo operar el e-commerce en **Guatemala (`gt`)** y **Chile (`cl`)** desde un único código fuente, cómo están estructuradas las semillas modulares en `db/seed` (`V3` a `V7`), cómo alternar entre perfiles y precios (`GTQ` / `CLP`), y qué ajustes debe realizar el equipo de Frontend para reflejar dinámicamente la moneda, impuestos y métodos de pago de cada país.

---

## 1. Perfiles de Entorno y País en el Backend

Spring Boot utiliza **perfiles compuestos** (`entorno` + `país`) configurados en `spring.profiles.active`:

| Archivo | Propósito | ¿Dónde se usa? |
|---|---|---|
| `src/main/resources/application.properties` | Configuración base común. Define `spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev,gt}` | Desarrollo y Producción |
| `src/main/resources/application-dev.properties` | Infraestructura local (BD `localhost`, SMTP de pruebas, `db/seed` activo) | Solo Desarrollo (`dev`) |
| `src/main/resources/application-gt.properties` | Reglas de negocio de **Guatemala**: `GTQ`, `Q`, `es-GT`, `2` decimales, IVA `12%` (`0.12`), envío gratis desde `Q500.00` | Desarrollo (`dev,gt`) y Producción (`prod,gt`) |
| `src/main/resources/application-cl.properties` | Reglas de negocio de **Chile**: `CLP`, `$`, `es-CL`, `0` decimales, IVA `19%` (`0.19`), envío gratis desde `$50.000` | Desarrollo (`dev,cl`) y Producción (`prod,cl`) |

### ¿Cómo cambiar de país al ejecutar el Backend?

- **Por defecto en desarrollo (Guatemala)**:
  ```powershell
  .\mvnw.cmd spring-boot:run
  ```
- **Ejecutar en desarrollo con configuración de Chile**:
  ```powershell
  $env:SPRING_PROFILES_ACTIVE="dev,cl"; .\mvnw.cmd spring-boot:run
  ```
- **Ejecutar en producción (Guatemala o Chile)**:
  ```bash
  # Servidor Guatemala
  SPRING_PROFILES_ACTIVE=prod,gt java -jar ecommerce.jar

  # Servidor Chile
  SPRING_PROFILES_ACTIVE=prod,cl java -jar ecommerce.jar
  ```

---

## 2. Contrato del Endpoint Público `GET /api/config`

El endpoint `GET /api/config` es **público** (no requiere token JWT) y devuelve la configuración activa del país en el que corre el backend.

### Respuesta cuando está activo el perfil `gt` (Guatemala)
```json
{
  "moneda": {
    "codigo": "GTQ",
    "simbolo": "Q",
    "nombre": "Quetzal",
    "locale": "es-GT",
    "decimales": 2
  },
  "montoMinimoEnvioGratis": 500.00,
  "storageProvider": "cloudinary",
  "paisCodigo": "GT",
  "paisNombre": "Guatemala",
  "porcentajeIva": 0.12
}
```

### Respuesta cuando está activo el perfil `cl` (Chile)
```json
{
  "moneda": {
    "codigo": "CLP",
    "simbolo": "$",
    "nombre": "Peso Chileno",
    "locale": "es-CL",
    "decimales": 0
  },
  "montoMinimoEnvioGratis": 50000,
  "storageProvider": "cloudinary",
  "paisCodigo": "CL",
  "paisNombre": "Chile",
  "porcentajeIva": 0.19
}
```

---

## 3. Guía para el Equipo de Frontend: Cómo Conectar la Moneda Dinámica

Actualmente el frontend muestra `$` o `MXN` porque tiene 5 lugares con moneda fija (*hardcoded*) y no consulta `GET /api/config`. Para corregirlo:

### Paso 3.1: Actualizar `frontend/src/shared/lib/format.ts`

Reemplazar el formato fijo `'es-MX'` / `'MXN'` por una configuración que se inicializa al arrancar la aplicación desde `GET /api/config` (con fallback a Guatemala `GTQ` / `Q`):

```ts
export { formatOrderStatus as formatEstadoOrden } from '@/entities/order';

export interface CurrencyConfig {
    codigo: string;
    simbolo: string;
    nombre: string;
    locale: string;
    decimales: number;
}

let activeCurrency: CurrencyConfig = {
    codigo: import.meta.env.VITE_CURRENCY_CODE || 'GTQ',
    simbolo: import.meta.env.VITE_CURRENCY_SYMBOL || 'Q',
    nombre: import.meta.env.VITE_CURRENCY_NAME || 'Quetzal',
    locale: import.meta.env.VITE_CURRENCY_LOCALE || 'es-GT',
    decimales: Number(import.meta.env.VITE_CURRENCY_DECIMALS ?? 2),
};

export function setCurrencyConfig(config: Partial<CurrencyConfig>): void {
    activeCurrency = { ...activeCurrency, ...config };
}

export function getCurrencyConfig(): CurrencyConfig {
    return activeCurrency;
}

export function formatCurrency(value: number | string | null | undefined): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    if (Number.isNaN(num)) return '—';
    const formattedNumber = new Intl.NumberFormat(activeCurrency.locale, {
        minimumFractionDigits: activeCurrency.decimales,
        maximumFractionDigits: activeCurrency.decimales,
    }).format(num);
    return `${activeCurrency.simbolo}${formattedNumber}`;
}
```

### Paso 3.2: Cargar `GET /api/config` al iniciar la aplicación

En `AppProviders.tsx` (o en un `ConfigProvider`), consultar `${API_URL}/api/config` una vez al montar la app y llamar a `setCurrencyConfig(data.moneda)`:

```ts
useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    fetch(`${API_URL}/api/config`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            if (data?.moneda) {
                setCurrencyConfig(data.moneda);
            }
        })
        .catch(() => {
            // Mantiene el fallback local si el servidor aún no responde
        });
}, []);
```

### Paso 3.3: Reemplazar los 5 lugares donde el precio no usa `formatCurrency()`

1. **`frontend/src/shared/ui/Card/ProductCard.tsx` (línea 52)**:
   - Antes: `{price && <span className={styles.priceTag}>${price}</span>}`
   - Después: `{price != null && <span className={styles.priceTag}>{formatCurrency(price)}</span>}`
2. **`frontend/src/widgets/product-detail/ProductDetailView.tsx` (líneas 132–135)**:
   - Antes: `new Intl.NumberFormat('es-CL', { style: 'currency', currency: producto.moneda || 'CLP' }).format(producto.precioVenta)`
   - Después: `formatCurrency(producto.precioVenta)`
3. **`frontend/src/widgets/cart/CartDrawer.tsx` (líneas 202–226) y `CartView.tsx` (líneas 49–105)**:
   - Antes: `$` + `toLocaleString('es-ES', { minimumFractionDigits: 2 })`
   - Después: `formatCurrency(item.price)`, `formatCurrency(item.price * item.quantity)` y `formatCurrency(cartTotal)`
4. **`frontend/src/features/profile/ui/FavoritesTab/FavoritesTab.tsx` (líneas 14–18)**:
   - Antes: `new Intl.NumberFormat('es-CL', { style: 'currency', currency: moneda || 'CLP' }).format(value)`
   - Después: `formatCurrency(item.precioVenta)`
5. **`frontend/src/widgets/admin/AdminProductListView.tsx` (línea 105) y `ProductForm.tsx` (líneas 132 y 840)**:
   - En `AdminProductListView.tsx`: cambiar `${producto.precioVenta || 'N/A'}` por `{producto.precioVenta != null ? formatCurrency(producto.precioVenta) : 'N/A'}`.
   - En `ProductForm.tsx`: agregar `<option value="GTQ">GTQ</option>` y `<option value="CLP">CLP</option>` además de `USD`, usando `getCurrencyConfig().codigo` como moneda inicial por defecto.

### Paso 3.4: Mostrar métodos de pago según el país activo (`GET /api/pagos/metodos`)

En `PaymentStep.tsx`, filtrar los botones de pasarela según los métodos devueltos por `listarMetodosPago()` (`GET /api/pagos/metodos`), donde cada país tiene activo únicamente su método local (`QPAYPRO` en Guatemala, `WEBPAY` en Chile).

---

## 4. Estructura Modular de Semillas (`db/seed`) y Cómo Cambiar Datos/Precios a Chile (`CL`)

### 4.1 Desacoplamiento de las migraciones y semillas (`V1` a `V7`)

Las semillas de desarrollo en `src/main/resources/db/seed/` están separadas modularmente siguiendo el orden estricto de llaves foráneas (`FOREIGN KEY`). Los archivos `V3` a `V6` son **100% universales** (no dependen del país ni de la moneda), mientras que únicamente **`V2`** y **`V7`** contienen datos específicos del país:

| Versión | Ubicación | Tabla afectada | ¿Depende del país/moneda? | Descripción |
|---|---|---|---|---|
| **`V1`** | `db/migration/V1__init_schema.sql` | Las 16 tablas del sistema | **No (Universal)** | Crea la estructura completa de tablas e índices. |
| **`V2`** | `db/migration/V2__seed_initial_data.sql` | `metodos_pago`, `servicios_envio`, `sucursales`, `cuentas_bancarias` | **Sí (Por defecto GT)** | Inicializa `QPAYPRO` activo, envíos `Cargo Express`/`Guatex`, sucursales en Guatemala y cuenta `Banrural` (`GTQ`). |
| **`V3`** | `db/seed/V3__seed_categorias_dev.sql` | `categorias` | **No (Universal)** | 80 categorías jerárquicas + `setval('categorias_id_seq')`. |
| **`V4`** | `db/seed/V4__seed_productos_dev.sql` | `productos` | **No (Universal)** | 560 productos base (`sku`, `nombre`, `slug`, `specs`, `stock`) + `setval('productos_id_seq')`. |
| **`V5`** | `db/seed/V5__seed_producto_imagenes_dev.sql` | `producto_imagenes` | **No (Universal)** | 29 imágenes de productos + `setval('producto_imagenes_id_seq')`. |
| **`V6`** | `db/seed/V6__seed_producto_categorias_dev.sql` | `producto_categorias` | **No (Universal)** | Asociación `ManyToMany` de los 560 productos con sus categorías. |
| **`V7`** | `db/seed/V7__seed_producto_precios_dev.sql` | `precio_historial` | **Sí (Por defecto GTQ)** | 560 precios vigentes en Quetzales (`GTQ`) + `setval('precio_historial_id_seq')`. |

---

### 4.2 Cómo cambiar los precios del catálogo a Pesos Chilenos (`CLP`)

El archivo con los **560 precios reales en Pesos Chilenos (`CLP`)** se encuentra en `backend/docs/sql/productosPreciosCLP.sql`. Existen dos formas de aplicarlo:

#### Opción A: En caliente sobre una BD ya creada (Sin borrar productos ni recrear la BD)
Dado que los 560 productos (`id` 1 al 560), imágenes (`V5`) y categorías (`V3`, `V6`) son idénticos en Guatemala y Chile, puedes reemplazar únicamente los precios sin alterar el historial de Flyway (`flyway_schema_history`):
1. En pgAdmin (Query Tool) o `psql`, limpia solo la tabla de precios:
   ```sql
   TRUNCATE TABLE precio_historial RESTART IDENTITY;
   ```
2. Ejecuta el contenido de `backend/docs/sql/productosPreciosCLP.sql`.

#### Opción B: Al crear la BD desde cero para Chile
Si vas a inicializar una base de datos limpia desde cero para Chile en desarrollo:
1. Reemplaza el contenido de `src/main/resources/db/seed/V7__seed_producto_precios_dev.sql` con el contenido de `backend/docs/sql/productosPreciosCLP.sql` antes de ejecutar `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.
2. Arranca el backend con `SPRING_PROFILES_ACTIVE=dev,cl`.

---

### 4.3 Script SQL para Ajustar Datos Operativos de `V2` a Chile (`CL`)

Por defecto, `V2__seed_initial_data.sql` y `V7__seed_producto_precios_dev.sql` inicializan los datos operativos y precios para **Guatemala (`GTQ`)**. Para configurar la pasarela (`WEBPAY`), paqueterías (`Starken` / `Chilexpress`), sucursales físicas y cuenta bancaria para **Chile (`CLP`)**, ejecuta el siguiente bloque SQL en pgAdmin o `psql`:

```sql
BEGIN;

-- 1. Activar Webpay Plus (Chile) y desactivar QPayPro (Guatemala)
UPDATE metodos_pago SET activo = true  WHERE codigo = 'WEBPAY';
UPDATE metodos_pago SET activo = false WHERE codigo = 'QPAYPRO';

-- 2. Configurar servicios de envío de Chile (precios en CLP)
DELETE FROM servicios_envio;
INSERT INTO servicios_envio (
    nombre, descripcion, tarifa, recargo_contra_entrega, activo, sin_contra_entrega, retiro_tienda
) VALUES
    ('Retiro en tienda', 'Recoge tu pedido en nuestra sucursal',     0.00,    0.00, true, false, true),
    ('Starken',          'Despacho estándar a domicilio vía Starken', 4990.00, 1500.00, true, false, false),
    ('Chilexpress',      'Despacho express vía Chilexpress',          6990.00, 2000.00, true, true,  false);

-- 3. Configurar sucursales físicas de Chile
DELETE FROM sucursales;
INSERT INTO sucursales (
    nombre, direccion, ciudad, estado, codigo_postal, pais,
    telefono, horario, referencias, mapa_url, activo, orden_visualizacion
) VALUES
    (
        'Tienda Providencia',
        'Av. Providencia 1234, Local 5',
        'Santiago',
        'Región Metropolitana',
        '7500000',
        'CL',
        '+56 2 2345 6789',
        'Lun-Vie: 9:00-18:00, Sáb: 10:00-14:00',
        'Metro Manuel Montt, frente a plaza',
        NULL,
        true,
        1
    ),
    (
        'Tienda Las Condes',
        'Av. Apoquindo 4500',
        'Santiago',
        'Región Metropolitana',
        '7550000',
        'CL',
        '+56 2 2456 7890',
        'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
        'A pasos de Metro Escuela Militar',
        NULL,
        true,
        2
    );

-- 4. Configurar cuenta bancaria en CLP
DELETE FROM cuentas_bancarias;
INSERT INTO cuentas_bancarias (banco, titular, tipo_cuenta, numero_cuenta, moneda, activo, orden_visualizacion)
VALUES ('BancoEstado', 'JPELabs SpA', 'Cuenta Corriente', '12-345-67890-1', 'CLP', true, 1);

COMMIT;
```
