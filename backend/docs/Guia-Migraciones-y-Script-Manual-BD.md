# Guía de Uso de Migraciones Consolidadas y Script SQL Externo para Carga Manual en Base de Datos

Este documento explica cómo funciona la nueva estructura de migraciones de Flyway tras la consolidación (*Migration Squashing*), cómo reiniciar una base de datos local preexistente, y provee el **script SQL externo independiente** (fuera de la aplicación) para cuando desees poblar o restaurar datos manualmente directamente en PostgreSQL (`psql`, pgAdmin o DBeaver).

---

## 1. Arquitectura Actual de Migraciones en el Proyecto

| Ubicación en el proyecto | Archivos | Cuándo se ejecuta | Propósito |
|---|---|---|---|
| `src/main/resources/db/migration/` | `V1__init_schema.sql`<br/>`V2__seed_initial_data.sql` | **Siempre** (todos los perfiles: `dev`, `prod`, etc.) | `V1` crea las 16 tablas e índices en limpio (0 `ALTER TABLE`).<br/>`V2` inserta la configuración mínima operativa (`metodos_pago`, los 3 `servicios_envio` activos, `sucursales` y `cuentas_bancarias`). |
| `src/main/resources/db/seed/` | `V3__seed_categorias_dev.sql`<br/>`V4__seed_productos_dev.sql`<br/>`V5__seed_producto_imagenes_dev.sql`<br/>`V6__seed_producto_categorias_dev.sql`<br/>`V7__seed_producto_precios_dev.sql` | **Solo en perfil `dev`** (`application-dev.properties`) | Carga automáticamente las 80 categorías y los 560 productos del catálogo con sus imágenes, relaciones `producto_categorias` y precios en `GTQ` cuando estás en entorno de desarrollo. |

> **¿Cómo desactivar la carga automática del catálogo en `dev` si algún día quieres probar con catálogo vacío?**
> En `application-dev.properties`, basta con comentar o dejar únicamente `db/migration`:
> ```properties
> spring.flyway.locations=classpath:db/migration
> ```

---

## 2. Cómo Recrear la Base de Datos desde Cero tras Consolidar Migraciones

Dado que las antiguas migraciones `V1` a `V27` fueron consolidadas en los nuevos `V1__init_schema.sql` y `V2__seed_initial_data.sql`, si tu base de datos local ya tenía la tabla `flyway_schema_history` con las 27 versiones anteriores registradas, Flyway detectaría una diferencia de *checksums*.

Para recrear todo limpio desde cero:

### Opción A: Desde pgAdmin / DBeaver (Query Tool)
Conéctate a tu base de datos (`ecommerce-ea`) y ejecuta:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Luego inicia la aplicación Spring Boot (`.\mvnw.cmd spring-boot:run`). Flyway ejecutará automáticamente `V1`, `V2`, `V3` y `V4` en menos de 1 segundo.

### Opción B: Desde terminal con `psql`
```powershell
psql -U postgres -d ecommerce-ea -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"
```

---

## 3. Script SQL Externo para Carga Manual en Base de Datos

> **Nota**: Este script **no está incluido dentro del empaquetado de la aplicación** para mantener limpio el runtime. Puedes copiarlo y ejecutarlo directamente en tu gestor de base de datos (pgAdmin, DBeaver o `psql`) sobre cualquier entorno (por ejemplo, staging o producción) cuando quieras insertar o restaurar manualmente los datos operativos base o limpiar/reiniciar secuencias.

```sql
-- =============================================================================
-- SCRIPT EXTERNO DE CARGA MANUAL EN BASE DE DATOS (PostgreSQL)
-- Proyecto: JEPLabs E-Commerce
-- Uso: Ejecutar manualmente desde pgAdmin, DBeaver o psql.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. MÉTODOS DE PAGO (Idempotente por código único)
-- -----------------------------------------------------------------------------
INSERT INTO metodos_pago (codigo, nombre, descripcion, tipo, activo, orden_visualizacion)
VALUES
    ('STRIPE',         'Tarjeta (Stripe)',       'Visa, Mastercard y más',       'PASARELA',       true,  1),
    ('MERCADO_PAGO',   'Mercado Pago',           'Latam - tarjeta o saldo',      'PASARELA',       true,  2),
    ('WEBPAY',         'Webpay Plus',            'Transbank - Chile',            'PASARELA',       false, 3),
    ('TRANSFERENCIA',  'Transferencia bancaria', 'Depósito pendiente',           'TRANSFERENCIA',  true,  4),
    ('CONTRA_ENTREGA', 'Pago contra entrega',    'Paga al recibir tu pedido',    'CONTRA_ENTREGA', true,  5),
    ('QPAYPRO',        'QPayPro',                'Visa, Mastercard - Guatemala', 'PASARELA',       true,  6)
ON CONFLICT (codigo) DO UPDATE SET
    nombre              = EXCLUDED.nombre,
    descripcion         = EXCLUDED.descripcion,
    tipo                = EXCLUDED.tipo,
    activo              = EXCLUDED.activo,
    orden_visualizacion = EXCLUDED.orden_visualizacion;

-- -----------------------------------------------------------------------------
-- 2. SERVICIOS DE ENVÍO (Los 3 servicios utilizados actualmente)
--    1) Retiro en tienda  -> retiro_tienda = true,  sin_contra_entrega = false
--    2) Cargo Express     -> retiro_tienda = false, sin_contra_entrega = false (Normal)
--    3) Guatex            -> retiro_tienda = false, sin_contra_entrega = true  (Express)
-- -----------------------------------------------------------------------------
INSERT INTO servicios_envio (
    id, nombre, descripcion, tarifa, recargo_contra_entrega, activo, sin_contra_entrega, retiro_tienda
) VALUES
    (1, 'Retiro en tienda', 'Recoge tu pedido en nuestra sucursal', 0.00,  0.00,  true, false, true),
    (2, 'Cargo Express',    'Servicio de entrega Cargo Express',    35.00, 10.00, true, false, false),
    (3, 'Guatex',           'Servicio de entrega express Guatex',   45.00, 15.00, true, true,  false)
ON CONFLICT (id) DO UPDATE SET
    nombre                 = EXCLUDED.nombre,
    descripcion            = EXCLUDED.descripcion,
    tarifa                 = EXCLUDED.tarifa,
    recargo_contra_entrega = EXCLUDED.recargo_contra_entrega,
    activo                 = EXCLUDED.activo,
    sin_contra_entrega     = EXCLUDED.sin_contra_entrega,
    retiro_tienda          = EXCLUDED.retiro_tienda;

SELECT setval('servicios_envio_id_seq', COALESCE((SELECT MAX(id) FROM servicios_envio), 1));

-- -----------------------------------------------------------------------------
-- 3. SUCURSALES FÍSICAS DE RETIRO EN TIENDA
-- -----------------------------------------------------------------------------
INSERT INTO sucursales (
    id, nombre, direccion, ciudad, estado, codigo_postal, pais,
    telefono, horario, referencias, mapa_url, activo, orden_visualizacion
) VALUES
    (
        1,
        'Tienda Centro',
        'Av. Principal 123, Ciudad de Guatemala',
        'Ciudad de Guatemala',
        'Guatemala',
        '01001',
        'GT',
        '+502 2345-6789',
        'Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00',
        'Zona 1, Centro Histórico',
        NULL,
        true,
        1
    ),
    (
        2,
        'Tienda Zona 10',
        'Boulevard Los Proceres 5-50, Zona 10',
        'Ciudad de Guatemala',
        'Guatemala',
        '01010',
        'GT',
        '+502 2456-7890',
        'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
        'Plaza Comercial Zona 10',
        NULL,
        true,
        2
    )
ON CONFLICT (id) DO UPDATE SET
    nombre              = EXCLUDED.nombre,
    direccion           = EXCLUDED.direccion,
    ciudad              = EXCLUDED.ciudad,
    estado              = EXCLUDED.estado,
    codigo_postal       = EXCLUDED.codigo_postal,
    pais                = EXCLUDED.pais,
    telefono            = EXCLUDED.telefono,
    horario             = EXCLUDED.horario,
    referencias         = EXCLUDED.referencias,
    mapa_url            = EXCLUDED.mapa_url,
    activo              = EXCLUDED.activo,
    orden_visualizacion = EXCLUDED.orden_visualizacion,
    actualizado_at      = NOW();

SELECT setval('sucursales_id_seq', COALESCE((SELECT MAX(id) FROM sucursales), 1));

-- -----------------------------------------------------------------------------
-- 4. CUENTAS BANCARIAS PARA TRANSFERENCIAS
-- -----------------------------------------------------------------------------
INSERT INTO cuentas_bancarias (
    id, banco, titular, tipo_cuenta, numero_cuenta, moneda, activo, orden_visualizacion
) VALUES
    (1, 'Banrural', 'JPELabs S.A.', 'Monetaria', '4521-8834-9901', 'GTQ', true, 1)
ON CONFLICT (id) DO UPDATE SET
    banco               = EXCLUDED.banco,
    titular             = EXCLUDED.titular,
    tipo_cuenta         = EXCLUDED.tipo_cuenta,
    numero_cuenta       = EXCLUDED.numero_cuenta,
    moneda              = EXCLUDED.moneda,
    activo              = EXCLUDED.activo,
    orden_visualizacion = EXCLUDED.orden_visualizacion;

SELECT setval('cuentas_bancarias_id_seq', COALESCE((SELECT MAX(id) FROM cuentas_bancarias), 1));

COMMIT;
```

---

## 4. Cómo Ejecutar Manualmente los Archivos de Catálogo (`V3` y `V4`) en otro Entorno

Si en un entorno distinto a `dev` (donde `db/seed` no está activo en `spring.flyway.locations`) deseas cargar el catálogo de categorías y productos manualmente desde consola:

```powershell
# 1. Cargar las 80 categorías jerárquicas
psql -U postgres -d NOMBRE_BASE_DATOS -f backend/src/main/resources/db/seed/V3__seed_categorias_dev.sql

# 2. Cargar los 56 productos, imágenes, precios y relaciones
psql -U postgres -d NOMBRE_BASE_DATOS -f backend/src/main/resources/db/seed/V4__seed_productos_dev.sql
```
Ambos archivos reinician automáticamente las secuencias (`categorias_id_seq`, `productos_id_seq`, `producto_imagenes_id_seq`) al finalizar para evitar colisiones de IDs cuando crees nuevas categorías o productos desde el panel de administración.
