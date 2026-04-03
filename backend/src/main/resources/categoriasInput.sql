-- ================================================================
-- SCRIPT DE CARGA DE CATEGORÍAS - JEPLabs Ecommerce
-- Generado para PostgreSQL
-- ================================================================

-- 1. LIMPIEZA DE DATOS (PRECAUCIÓN)
-- Descomenta la siguiente línea SOLO si quieres borrar todas las categorías existentes antes de cargar.
-- ADVERTENCIA: Esto eliminará también productos relacionados si hay claves foráneas en CASCADE.
-- TRUNCATE TABLE categorias RESTART IDENTITY CASCADE;

-- 2. INSERCIÓN DE DATOS
-- Se fuerzan los IDs para mantener la jerarquía exacta del CSV.
INSERT INTO categorias (id, nombre, slug, parent_id, created_at, updated_at)
VALUES 
(1, 'Computación', 'computacion', NULL, NOW(), NOW()),
(2, 'Smartphones y Tablets', 'smartphones-y-tablets', NULL, NOW(), NOW()),
(3, 'Gaming', 'gaming', NULL, NOW(), NOW()),
(4, 'Audio, Video y Foto', 'audio-video-y-foto', NULL, NOW(), NOW()),
(5, 'Hogar Inteligente', 'hogar-inteligente', NULL, NOW(), NOW()),
(6, 'Redes y Conectividad', 'redes-y-conectividad', NULL, NOW(), NOW()),
(7, 'Laptops y portátiles', 'laptops-y-portatiles', 1, NOW(), NOW()),
(8, 'PC de escritorio', 'pc-de-escritorio', 1, NOW(), NOW()),
(9, 'Componentes PC', 'componentes-pc', 1, NOW(), NOW()),
(10, 'Smartphones', 'smartphones', 2, NOW(), NOW()),
(11, 'Tablets', 'tablets', 2, NOW(), NOW()),
(12, 'Accesorios móvil', 'accesorios-movil', 2, NOW(), NOW()),
(13, 'Consolas', 'consolas', 3, NOW(), NOW()),
(14, 'Periféricos gaming', 'perifericos-gaming', 3, NOW(), NOW()),
(15, 'Sillas y escritorios gaming', 'sillas-y-escritorios-gaming', 3, NOW(), NOW()),
(16, 'Fotografía y video', 'fotografia-y-video', 4, NOW(), NOW()),
(17, 'Audio', 'audio', 4, NOW(), NOW()),
(18, 'Televisores y proyectores', 'televisores-y-proyectores', 4, NOW(), NOW()),
(19, 'Asistentes y hubs', 'asistentes-y-hubs', 5, NOW(), NOW()),
(20, 'Seguridad del hogar', 'seguridad-del-hogar', 5, NOW(), NOW()),
(21, 'Electrodomésticos smart', 'electrodomesticos-smart', 5, NOW(), NOW()),
(22, 'Redes Wi-Fi', 'redes-wi-fi', 6, NOW(), NOW()),
(23, 'Networking profesional', 'networking-profesional', 6, NOW(), NOW()),
(24, 'Almacenamiento externo', 'almacenamiento-externo', 6, NOW(), NOW()),
(25, 'Gaming Laptop', 'gaming-laptop', 7, NOW(), NOW()),
(26, 'Ultrabooks', 'ultrabooks', 7, NOW(), NOW()),
(27, 'Workstations', 'workstations', 7, NOW(), NOW()),
(28, 'All-in-One', 'all-in-one', 8, NOW(), NOW()),
(29, 'Torres/MiniPC', 'torresminipc', 8, NOW(), NOW()),
(30, 'Servidores NAS', 'servidores-nas', 8, NOW(), NOW()),
(31, 'Procesadores', 'procesadores', 9, NOW(), NOW()),
(32, 'RAM', 'ram', 9, NOW(), NOW()),
(33, 'Tarjetas gráficas', 'tarjetas-graficas', 9, NOW(), NOW()),
(34, 'Almacenamiento', 'almacenamiento', 9, NOW(), NOW()),
(35, 'Gama alta', 'gama-alta', 10, NOW(), NOW()),
(36, 'Gama media', 'gama-media', 10, NOW(), NOW()),
(37, 'Básicos/Prepago', 'basicosprepago', 10, NOW(), NOW()),
(38, 'Tablets Android', 'tablets-android', 11, NOW(), NOW()),
(39, 'iPads', 'ipads', 11, NOW(), NOW()),
(40, 'Tablets 2-en-1', 'tablets-2-en-1', 11, NOW(), NOW()),
(41, 'Fundas y protectores', 'fundas-y-protectores', 12, NOW(), NOW()),
(42, 'Cargadores', 'cargadores', 12, NOW(), NOW()),
(43, 'Cables y adaptadores', 'cables-y-adaptadores', 12, NOW(), NOW()),
(44, 'PlayStation', 'playstation', 13, NOW(), NOW()),
(45, 'Xbox', 'xbox', 13, NOW(), NOW()),
(46, 'Nintendo', 'nintendo', 13, NOW(), NOW()),
(47, 'Teclados mecánicos', 'teclados-mecanicos', 14, NOW(), NOW()),
(48, 'Ratones y pads', 'ratones-y-pads', 14, NOW(), NOW()),
(49, 'Headsets', 'headsets', 14, NOW(), NOW()),
(50, 'Sillas gaming', 'sillas-gaming', 15, NOW(), NOW()),
(51, 'Escritorios', 'escritorios', 15, NOW(), NOW()),
(52, 'Ilumincación RGB', 'ilumincacion-rgb', 15, NOW(), NOW()),
(53, 'Cámaras DSLR', 'camaras-dslr', 16, NOW(), NOW()),
(54, 'Cámaras Mirrorless', 'camaras-mirrorless', 16, NOW(), NOW()),
(55, 'Drones', 'drones', 16, NOW(), NOW()),
(56, 'Accesorios foto', 'accesorios-foto', 16, NOW(), NOW()),
(57, 'Auriculares y TWS', 'auriculares-y-tws', 17, NOW(), NOW()),
(58, 'Altavoces y soundbars', 'altavoces-y-soundbars', 17, NOW(), NOW()),
(59, 'Micrófonos', 'microfonos', 17, NOW(), NOW()),
(60, 'Smart TV', 'smart-tv', 18, NOW(), NOW()),
(61, 'Proyectores', 'proyectores', 18, NOW(), NOW()),
(62, 'Accesorios AV', 'accesorios-av', 18, NOW(), NOW()),
(63, 'Altavoces inteligentes', 'altavoces-inteligentes', 19, NOW(), NOW()),
(64, 'Hubs domótica', 'hubs-domotica', 19, NOW(), NOW()),
(65, 'Pantallas Inteligentes', 'pantallas-inteligentes', 19, NOW(), NOW()),
(66, 'Cámaras IP', 'camaras-ip', 20, NOW(), NOW()),
(67, 'Alarmas y sensores', 'alarmas-y-sensores', 20, NOW(), NOW()),
(68, 'Cerraduras Inteligentes', 'cerraduras-inteligentes', 20, NOW(), NOW()),
(69, 'Iluminación Inteligente', 'iluminacion-inteligente', 21, NOW(), NOW()),
(70, 'Robots aspiradores', 'robots-aspiradores', 21, NOW(), NOW()),
(71, 'Enchufes y termostatos', 'enchufes-y-termostatos', 21, NOW(), NOW()),
(72, 'Routers', 'routers', 22, NOW(), NOW()),
(73, 'Sistemas Mesh', 'sistemas-mesh', 22, NOW(), NOW()),
(74, 'Repetidores/Access points', 'repetidoresaccess-points', 22, NOW(), NOW()),
(75, 'Switches', 'switches', 23, NOW(), NOW()),
(76, 'Firewalls/NAS', 'firewallsnas', 23, NOW(), NOW()),
(77, 'Cableado estructurado', 'cableado-estructurado', 23, NOW(), NOW()),
(78, 'Discos duros externos', 'discos-duros-externos', 24, NOW(), NOW()),
(79, 'SSDs portátiles', 'ssds-portatiles', 24, NOW(), NOW()),
(80, 'USBs y tarjetas SD', 'usbs-y-tarjetas-sd', 24, NOW(), NOW());

-- 3. REINICIO DE SECUENCIA
-- Esto es CRÍTICO. Ajusta la secuencia para que el próximo ID automático sea 81.
-- Evita errores de "duplicate key value violates unique constraint" en futuros inserts.
-- Asumimos que la secuencia se llama 'categorias_id_seq'. Si tu tabla tiene otro nombre de secuencia, ajústalo aquí.
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));

-- Fin del script