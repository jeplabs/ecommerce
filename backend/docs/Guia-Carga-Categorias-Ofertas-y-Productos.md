# Guía de Carga Manual de Nuevas Categorías ("Ofertas y Más"), Asociación de Productos y Sincronización con Flyway

Esta guía documenta el procedimiento que **debe seguirse obligatoriamente** debido a que se modificaron los archivos seed del repositorio (`V3__seed_categorias_dev.sql` y `V6__seed_producto_categorias_dev.sql`).

---

## 1. ¿Por qué es necesario este procedimiento manual?

Los archivos `V3__seed_categorias_dev.sql` y `V6__seed_producto_categorias_dev.sql` ya fueron editados en el código fuente para incorporar la nueva estructura de **"Ofertas y más"**.

Si intentas levantar el backend directamente habiendo modificado estos archivos seed, **Flyway se quejará con un error de validación** (debido a discrepancia de *checksum* con los scripts ya registrados en la tabla `flyway_schema_history` de tu base de datos local), o los datos en la base no coincidirán con lo que espera la aplicación.

Por ello, el procedimiento correcto es:
1. **Ejecutar primero a mano en PostgreSQL** el script de las nuevas categorías.
2. **Ejecutar a mano en PostgreSQL** el script de asociación de productos.
3. **Recién después levantar el backend** para que Flyway y Spring Boot inicien sin conflictos de datos.

---

## 2. Paso a Paso Obligatorio

> [!WARNING]
> Mantén el backend apagado mientras ejecutas estos dos scripts en tu base de datos (`psql`, pgAdmin o DBeaver).

### Paso 1: Agregar a mano las nuevas categorías

Ejecuta en tu base de datos el siguiente script para crear las categorías 81 a 89:

```sql
INSERT INTO categorias (id, nombre, slug, parent_id)
VALUES 
(81, 'Ofertas y más', 'ofertas-y-mas', NULL),
(82, 'Ofertas', 'ofertas', 81),
(83, 'Productos Destacados', 'productos-destacados', 81),
(84, 'Ofertas de temporada', 'ofertas-de-temporada', 82),
(85, 'Packs y Kits', 'packs-y-kits', 82),
(86, 'Liquidación', 'liquidacion', 82),
(87, 'Los más vendidos', 'los-mas-vendidos', 83),
(88, 'Novedades', 'novedades', 83),
(89, 'Recomendados de la tienda', 'recomendados-de-la-tienda', 83);

SELECT * FROM public.categorias
ORDER BY id ASC;

-- Sincronizar la secuencia de IDs para que futuros inserts automáticos no colisionen:
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));
```

---

### Paso 2: Agregar a mano la asociación de productos

Una vez que las categorías 81 a 89 ya existen en la base de datos, ejecuta el script para vincular los productos (jerarquía completa: Raíz -> Subcategoría -> Sub-subcategoría):

```sql
-- ==============================================================================
-- ASOCIACIÓN DE PRODUCTOS A LAS NUEVAS CATEGORÍAS DE "OFERTAS Y MÁS"
-- Asigna 2 productos existentes a cada una de las 6 nuevas sub-subcategorías
-- garantizando la jerarquía completa (Raíz -> Subcategoría -> Sub-subcategoría).
-- ==============================================================================

INSERT INTO producto_categorias (producto_id, categoria_id)
VALUES
-- ─────────────────────────────────────────────────────────────
-- 1. OFERTAS (Cat 82) > Ofertas de temporada (Cat 84)
-- ─────────────────────────────────────────────────────────────
-- Producto 1 (Notebook Dell Ultrabook Pro Plus 14)
(1, 81), (1, 82), (1, 84),
-- Producto 2 (Notebook Gamer HP Victus RTX 4050)
(2, 81), (2, 82), (2, 84),

-- ─────────────────────────────────────────────────────────────
-- 2. OFERTAS (Cat 82) > Packs y Kits (Cat 85)
-- ─────────────────────────────────────────────────────────────
-- Producto 14 (Teclado Gamer Logitech G PRO X TKL)
(14, 81), (14, 82), (14, 85),
-- Producto 8 (Memoria RAM Kingston Fury Beast RGB)
(8, 81), (8, 82), (8, 85),

-- ─────────────────────────────────────────────────────────────
-- 3. OFERTAS (Cat 82) > Liquidación (Cat 86)
-- ─────────────────────────────────────────────────────────────
-- Producto 18 (Cámara de Seguridad TP-Link Tapo C210)
(18, 81), (18, 82), (18, 86),
-- Producto 20 (Router Wi-Fi 6 ASUS RT-AX58U)
(20, 81), (20, 82), (20, 86),

-- ─────────────────────────────────────────────────────────────
-- 4. PRODUCTOS DESTACADOS (Cat 83) > Los más vendidos (Cat 87)
-- ─────────────────────────────────────────────────────────────
-- Producto 11 (Smartphone Apple iPhone 16 Pro Max)
(11, 81), (11, 83), (11, 87),
-- Producto 13 (Consola Sony PlayStation 5 Slim)
(13, 81), (13, 83), (13, 87),

-- ─────────────────────────────────────────────────────────────
-- 5. PRODUCTOS DESTACADOS (Cat 83) > Novedades (Cat 88)
-- ─────────────────────────────────────────────────────────────
-- Producto 12 (Tablet Apple iPad Air 11" M2)
(12, 81), (12, 83), (12, 88),
-- Producto 17 (Smart TV LG OLED EVO C4 55")
(17, 81), (17, 83), (17, 88),

-- ─────────────────────────────────────────────────────────────
-- 6. PRODUCTOS DESTACADOS (Cat 83) > Recomendados de la tienda (Cat 89)
-- ─────────────────────────────────────────────────────────────
-- Producto 16 (Auriculares Sony WH-1000XM5)
(16, 81), (16, 83), (16, 89),
-- Producto 19 (Robot Aspirador Xiaomi Robot Vacuum X20+)
(19, 81), (19, 83), (19, 89),

-- 1. OFERTAS (Cat 82) > Ofertas de temporada (Cat 84) [Nuevos]
-- Producto 3 (Notebook Workstation HP ZBook X G1i)
(3, 81), (3, 82), (3, 84),
-- Producto 4 (All-In-One Lenovo IdeaCentre A100)
(4, 81), (4, 82), (4, 84),

-- 2. OFERTAS (Cat 82) > Packs y Kits (Cat 85) [Nuevos]
-- Producto 24 (Mouse Gamer Inalámbrico Logitech G PRO X Superlight 2)
(24, 81), (24, 82), (24, 85),
-- Producto 34 (Cargador de Pared Anker Prime 67W GaN 3 Puertos)
(34, 81), (34, 82), (34, 85),

-- 3. OFERTAS (Cat 82) > Liquidación (Cat 86) [Nuevos]
-- Producto 7 (Procesador Intel Core i5-12400 LGA1700)
(7, 81), (7, 82), (7, 86),
-- Producto 31 (Smartphone Motorola Moto G24 Power 256GB)
(31, 81), (31, 82), (31, 86),

-- 4. DESTACADOS (Cat 83) > Los más vendidos (Cat 87) [Nuevos]
-- Producto 21 (Smartphone Samsung Galaxy A55 5G 256GB)
(21, 81), (21, 83), (21, 87),
-- Producto 23 (Consola Microsoft Xbox Series X 1TB 4K)
(23, 81), (23, 83), (23, 87),

-- 5. DESTACADOS (Cat 83) > Novedades (Cat 88) [Nuevos]
-- Producto 9 (Tarjeta de Video MSI GeForce RTX 5060 OC 8GB GDDR7)
(9, 81), (9, 83), (9, 88),
-- Producto 25 (Drone DJI Mini 4 Pro Fly More Combo)
(25, 81), (25, 83), (25, 88),

-- 6. DESTACADOS (Cat 83) > Recomendados de la tienda (Cat 89) [Nuevos]
-- Producto 15 (Silla Gamer Secretlab TITAN Evo 2022 SoftWeave)
(15, 81), (15, 83), (15, 89),
-- Producto 26 (Barra de Sonido Sonos Beam Gen 2 Dolby Atmos)
(26, 81), (26, 83), (26, 89)
ON CONFLICT (producto_id, categoria_id) DO NOTHING;
```

---

### Paso 3: Levantar el Backend (Spring Boot & Flyway)

Una vez aplicados ambos scripts en la base de datos:

1. Iniciar la aplicación backend:
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
2. Al iniciar, Flyway no presentará quejas ni errores de inconsistencia, y Hibernate cargará los datos que ya calzan exactamente con los archivos seed modificados.
3. Verificar que los endpoints respondan correctamente:
   - `GET http://localhost:8080/api/categorias/arbol`
   - `GET http://localhost:8080/api/productos/categoria/ofertas-y-mas`

---

## 3. Estado de la Implementación en el Frontend

El frontend **ya cuenta con los ajustes necesarios** implementados en `CategoriasNav.tsx`:
- En **Desktop**: Al hacer hover sobre *"Ofertas y más"*, el Mega Menú despliega las columnas *"Ofertas"* y *"Productos Destacados"*, mostrando debajo de cada una los enlaces directos a sus respectivas sub-subcategorías.
- En **Tablet/Móvil**: El drawer lateral muestra la navegación anidada con acordeones automáticos de forma limpia y responsiva.
