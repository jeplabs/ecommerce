# Guía de Configuración Multi-País (Guatemala y Chile) e Integración de Moneda en Frontend

Este documento detalla cómo operar el e-commerce en **Guatemala (`gt`)** y **Chile (`cl`)** desde un único código fuente, cómo alternar entre perfiles en desarrollo y producción, y qué ajustes exactos debe realizar el equipo de Frontend para reflejar dinámicamente la moneda, impuestos y métodos de pago de cada país.

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

## 4. Script SQL para Ajustar Datos Operativos en una Base de Datos de Chile (`CL`)

Por defecto, `V2__seed_initial_data.sql` y `V4__seed_productos_dev.sql` inicializan los datos para **Guatemala (`GTQ`)**. Si deseas inicializar o convertir una base de datos local o de producción para **Chile (`CLP`)**, ejecuta el siguiente bloque SQL en pgAdmin o `psql`:

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

-- 5. (Opcional en dev) Actualizar moneda del catálogo semilla a CLP
UPDATE precio_historial SET moneda = 'CLP' WHERE moneda = 'GTQ';

COMMIT;
```
