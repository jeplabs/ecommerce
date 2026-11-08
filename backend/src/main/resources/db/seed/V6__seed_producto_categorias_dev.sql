-- 5. ASOCIACIÓN DE CATEGORÍAS
-- Vincula los productos con sus categorías respectivas (Jerarquía completa: Raíz -> Subcategoría -> Sub-subcategoría).
INSERT INTO producto_categorias (producto_id, categoria_id)
VALUES
-- Producto 1 (Dell Ultrabook) → Computación > Laptops > Ultrabooks
(1, 1), (1, 7), (1, 26),
-- Producto 2 (HP Victus Gaming) → Computación > Laptops > Gaming Laptop + Gaming > Consolas
(2, 1), (2, 3), (2, 7), (2, 13), (2, 25),
-- Producto 3 (HP ZBook Workstation) → Computación > Laptops > Workstations
(3, 1), (3, 7), (3, 27),
-- Producto 4 (Lenovo All-In-One) → Computación > PC escritorio > All-in-One
(4, 1), (4, 8), (4, 28),
-- Producto 5 (PC Armado Code 5) → Computación > PC escritorio > Torres/MiniPC
(5, 1), (5, 8), (5, 29),
-- Producto 6 (NAS QNAP) → Computación > PC escritorio > Servidores NAS
(6, 1), (6, 8), (6, 30),
-- Producto 7 (Intel i5-12400) → Computación > Componentes PC > Procesadores
(7, 1), (7, 9), (7, 31),
-- Producto 8 (Kingston Fury Beast RGB) → Computación > Componentes PC > RAM
(8, 1), (8, 9), (8, 32),
-- Producto 9 (MSI RTX 5060) → Computación > Componentes PC > Tarjetas gráficas
(9, 1), (9, 9), (9, 33),
-- Producto 10 (WD_BLACK SN850P) → Computación > Componentes PC > Almacenamiento
(10, 1), (10, 9), (10, 34),
-- Producto 11 (iPhone 16 Pro Max) → Smartphones y Tablets > Smartphones > Gama alta
(11, 2), (11, 10), (11, 35),
-- Producto 12 (iPad Air 11" M2) → Smartphones y Tablets > Tablets > iPads
(12, 2), (12, 11), (12, 39),
-- Producto 13 (PlayStation 5 Slim) → Gaming > Consolas > PlayStation
(13, 3), (13, 13), (13, 44),
-- Producto 14 (Logitech G PRO X TKL) → Gaming > Periféricos gaming > Teclados mecánicos
(14, 3), (14, 14), (14, 47),
-- Producto 15 (Secretlab TITAN Evo) → Gaming > Sillas y escritorios gaming > Sillas gaming
(15, 3), (15, 15), (15, 50),
-- Producto 16 (Sony WH-1000XM5) → Audio, Video y Foto > Audio > Auriculares y TWS
(16, 4), (16, 17), (16, 57),
-- Producto 17 (LG OLED EVO C4 55") → Audio, Video y Foto > Televisores y proyectores > Smart TV
(17, 4), (17, 18), (17, 60),
-- Producto 18 (TP-Link Tapo C210) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(18, 5), (18, 20), (18, 66),
-- Producto 19 (Xiaomi Robot Vacuum X20+) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(19, 5), (19, 21), (19, 70),
-- Producto 20 (ASUS RT-AX58U) → Redes y Conectividad > Redes Wi-Fi > Routers
(20, 6), (20, 22), (20, 72),
-- Producto 21 (Galaxy A55 5G) → Smartphones y Tablets > Smartphones > Gama media
(21, 2), (21, 10), (21, 36),
-- Producto 22 (Galaxy Tab S9 FE) → Smartphones y Tablets > Tablets > Tablets Android
(22, 2), (22, 11), (22, 38),
-- Producto 23 (Xbox Series X) → Gaming > Consolas > Xbox
(23, 3), (23, 13), (23, 45),
-- Producto 24 (Logitech G PRO X SUPERLIGHT 2) → Gaming > Periféricos gaming > Ratones y pads
(24, 3), (24, 14), (24, 48),
-- Producto 25 (DJI Mini 4 Pro) → Audio, Video y Foto > Fotografía y video > Drones
(25, 4), (25, 16), (25, 55),
-- Producto 26 (Sonos Beam Gen 2) → Audio, Video y Foto > Audio > Altavoces y soundbars
(26, 4), (26, 17), (26, 58),
-- Producto 27 (HomePod 2da Gen) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(27, 5), (27, 19), (27, 63),
-- Producto 28 (Philips Hue Starter Kit) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(28, 5), (28, 21), (28, 69),
-- Producto 29 (TP-Link Deco X55 3-Pack) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(29, 6), (29, 22), (29, 73),
-- Producto 30 (Samsung T7 Shield 2TB) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(30, 6), (30, 24), (30, 79),
-- Producto 31 (Moto G24 Power) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(31, 2), (31, 10), (31, 37),
-- Producto 32 (Surface Pro 10) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(32, 2), (32, 11), (32, 40),
-- Producto 33 (Funda Spigen Tough Armor) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(33, 2), (33, 12), (33, 41),
-- Producto 34 (Cargador Anker Prime 67W) → Smartphones y Tablets > Accesorios móvil > Cargadores
(34, 2), (34, 12), (34, 42),
-- Producto 35 (Cable Anker 765 140W) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(35, 2), (35, 12), (35, 43),
-- Producto 36 (Nintendo Switch OLED) → Gaming > Consolas > Nintendo
(36, 3), (36, 13), (36, 46),
-- Producto 37 (Audífonos Razer BlackShark V2 Pro) → Gaming > Periféricos gaming > Headsets
(37, 3), (37, 14), (37, 49),
-- Producto 38 (Escritorio Eureka Ergonomic 60") → Gaming > Sillas y escritorios gaming > Escritorios
(38, 3), (38, 15), (38, 51),
-- Producto 39 (Torres RGB Corsair iCUE LT100) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(39, 3), (39, 15), (39, 52),
-- Producto 40 (Cámara Canon EOS Rebel T7) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(40, 4), (40, 16), (40, 53),
-- Producto 41 (Cámara Sony Alpha A7 IV) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(41, 4), (41, 16), (41, 54),
-- Producto 42 (Trípode Manfrotto Befree Advanced) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(42, 4), (42, 16), (42, 56),
-- Producto 43 (Micrófono Shure MV7+) → Audio, Video y Foto > Audio > Micrófonos
(43, 4), (43, 17), (43, 59),
-- Producto 44 (Proyector Anker Nebula Capsule 3) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(44, 4), (44, 18), (44, 61),
-- Producto 45 (Aqara Hub M3) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(45, 5), (45, 19), (45, 64),
-- Producto 46 (Ring Alarm Kit 5 Pzs) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(46, 5), (46, 20), (46, 67),
-- Producto 47 (Cerradura Yale Assure Lock 2) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(47, 5), (47, 20), (47, 68),
-- Producto 48 (Termostato Nest Learning 3ra Gen) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(48, 5), (48, 21), (48, 71),
-- Producto 49 (Switch Ubiquiti UniFi Lite 16 PoE) → Redes y Conectividad > Networking profesional > Switches
(49, 6), (49, 23), (49, 75),
-- Producto 50 (Disco Duro Externo WD My Passport 5TB) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(50, 6), (50, 24), (50, 78),
-- Producto 51 (Soporte TV Sanus VLF728-B2) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(51, 4), (51, 18), (51, 62),
-- Producto 52 (Google Nest Hub 2da Gen) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(52, 5), (52, 19), (52, 65),
-- Producto 53 (Access Point Ubiquiti UniFi 6+) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(53, 6), (53, 22), (53, 74),
-- Producto 54 (Firewall Fortinet FortiGate 40F) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(54, 6), (54, 23), (54, 76),
-- Producto 55 (Bobina Cable UTP Cat6 Panduit 305m) → Redes y Conectividad > Networking profesional > Cableado estructurado
(55, 6), (55, 23), (55, 77),
-- Producto 56 (Tarjeta SanDisk Extreme PRO MicroSDXC 256GB) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(56, 6), (56, 24), (56, 80),

-- Productos 57 a 560 (Jerarquía completa: Raíz -> Subcategoría -> Sub-subcategoría),
-- Producto 57 (Notebook Gamer ASUS ROG Strix G16 Intel Core i9-14900HX 32GB 1TB RTX 4070 16" QHD+ 240Hz W11H) → Computación > Laptops y portátiles > Gaming Laptop
(57, 1), (57, 7), (57, 25),
-- Producto 58 (Notebook Gamer Lenovo Legion Pro 7i Intel Core i9-14900HX 32GB 2TB RTX 4080 16" WQXGA 240Hz W11P) → Computación > Laptops y portátiles > Gaming Laptop
(58, 1), (58, 7), (58, 25),
-- Producto 59 (Notebook Gamer Acer Predator Helios 16 Intel Core i7-14700HX 16GB 1TB RTX 4070 16" WQXGA 240Hz W11H) → Computación > Laptops y portátiles > Gaming Laptop
(59, 1), (59, 7), (59, 25),
-- Producto 60 (Notebook Gamer MSI Raider GE78 HX Intel Core i9-14900HX 64GB 2TB RTX 4080 17" QHD+ 240Hz W11P) → Computación > Laptops y portátiles > Gaming Laptop
(60, 1), (60, 7), (60, 25),
-- Producto 61 (Notebook Gamer Alienware m16 R2 Intel Core Ultra 7 155H 16GB 1TB RTX 4060 16" QHD+ 240Hz W11H) → Computación > Laptops y portátiles > Gaming Laptop
(61, 1), (61, 7), (61, 25),
-- Producto 62 (Notebook Gamer Razer Blade 16 Intel Core i9-14900HX 32GB 1TB RTX 4080 16" QHD+ OLED 240Hz W11H) → Computación > Laptops y portátiles > Gaming Laptop
(62, 1), (62, 7), (62, 25),
-- Producto 63 (Notebook Gamer ASUS TUF Gaming A15 AMD Ryzen 7 8845HS 16GB 512GB RTX 4060 15.6" FHD 144Hz W11H) → Computación > Laptops y portátiles > Gaming Laptop
(63, 1), (63, 7), (63, 25),
-- Producto 64 (Notebook Gamer GIGABYTE AORUS 16X Intel Core i7-14650HX 16GB 1TB RTX 4070 16" WQXGA 165Hz W11H) → Computación > Laptops y portátiles > Gaming Laptop
(64, 1), (64, 7), (64, 25),
-- Producto 65 (Notebook Gamer HP OMEN 16 Intel Core i7-14700HX 32GB 1TB RTX 4060 16.1" FHD 165Hz W11H) → Computación > Laptops y portátiles > Gaming Laptop
(65, 1), (65, 7), (65, 25),
-- Producto 66 (Apple MacBook Air 13" Chip M3 CPU 8-core GPU 10-core 16GB 512GB SSD Gris Espacial) → Computación > Laptops y portátiles > Ultrabooks
(66, 1), (66, 7), (66, 26),
-- Producto 67 (Ultrabook ASUS Zenbook 14 OLED Intel Core Ultra 7 155H 16GB 1TB 14" 3K OLED 120Hz W11H) → Computación > Laptops y portátiles > Ultrabooks
(67, 1), (67, 7), (67, 26),
-- Producto 68 (Ultrabook Lenovo Yoga Slim 7 Intel Core Ultra 7 155H 32GB 1TB 14" WUXGA OLED W11H) → Computación > Laptops y portátiles > Ultrabooks
(68, 1), (68, 7), (68, 26),
-- Producto 69 (Ultrabook Dell XPS 13 9340 Intel Core Ultra 7 155H 32GB 1TB 13.4" QHD+ Touch 120Hz W11P) → Computación > Laptops y portátiles > Ultrabooks
(69, 1), (69, 7), (69, 26),
-- Producto 70 (Ultrabook 2-en-1 HP Spectre x360 14 Intel Core Ultra 7 155H 16GB 1TB 14" 2.8K OLED Touch W11H) → Computación > Laptops y portátiles > Ultrabooks
(70, 1), (70, 7), (70, 26),
-- Producto 71 (Ultrabook Acer Swift Go 14 Intel Core Ultra 5 125H 16GB 512GB 14" 2.8K OLED 90Hz W11H) → Computación > Laptops y portátiles > Ultrabooks
(71, 1), (71, 7), (71, 26),
-- Producto 72 (Ultrabook LG gram 16 Intel Core Ultra 7 155H 16GB 1TB 16" WQXGA Antirreflejo 1199g W11H) → Computación > Laptops y portátiles > Ultrabooks
(72, 1), (72, 7), (72, 26),
-- Producto 73 (Ultrabook Samsung Galaxy Book4 Pro Intel Core Ultra 7 155H 16GB 512GB 14" Dynamic AMOLED 2X W11H) → Computación > Laptops y portátiles > Ultrabooks
(73, 1), (73, 7), (73, 26),
-- Producto 74 (Ultrabook MSI Prestige 13 AI Evo Intel Core Ultra 7 155H 32GB 1TB 13.3" 2.8K OLED 990g W11P) → Computación > Laptops y portátiles > Ultrabooks
(74, 1), (74, 7), (74, 26),
-- Producto 75 (Notebook Workstation Lenovo ThinkPad P1 Gen 7 Intel Core Ultra 9 185H 64GB 2TB RTX 4080 16" OLED W11P) → Computación > Laptops y portátiles > Workstations
(75, 1), (75, 7), (75, 27),
-- Producto 76 (Notebook Workstation Dell Precision 7680 Intel Core i9-13950HX 64GB 2TB RTX 3500 Ada 16" FHD+ W11P) → Computación > Laptops y portátiles > Workstations
(76, 1), (76, 7), (76, 27),
-- Producto 77 (Notebook Workstation HP ZBook Studio G10 Intel Core i7-13800H 32GB 1TB RTX 2000 Ada 16" WQUXGA W11P) → Computación > Laptops y portátiles > Workstations
(77, 1), (77, 7), (77, 27),
-- Producto 78 (Apple MacBook Pro 16" Chip M3 Max CPU 16-core GPU 40-core 48GB 1TB SSD Negro Espacial) → Computación > Laptops y portátiles > Workstations
(78, 1), (78, 7), (78, 27),
-- Producto 79 (Notebook Workstation ASUS ProArt P16 AMD Ryzen AI 9 HX 370 64GB 2TB RTX 4070 16" 4K OLED W11P) → Computación > Laptops y portátiles > Workstations
(79, 1), (79, 7), (79, 27),
-- Producto 80 (Notebook Workstation Lenovo ThinkPad P16s Gen 2 AMD Ryzen 7 PRO 7840U 32GB 1TB 16" WUXGA W11P) → Computación > Laptops y portátiles > Workstations
(80, 1), (80, 7), (80, 27),
-- Producto 81 (Notebook Workstation MSI CreatorPro X18 HX Intel Core i9-14900HX 64GB 2TB RTX 3500 Ada 18" 4K MiniLED W11P) → Computación > Laptops y portátiles > Workstations
(81, 1), (81, 7), (81, 27),
-- Producto 82 (Notebook Workstation Dell Precision 3581 Intel Core i7-13700H 32GB 512GB RTX A1000 15.6" FHD W11P) → Computación > Laptops y portátiles > Workstations
(82, 1), (82, 7), (82, 27),
-- Producto 83 (Notebook Workstation HP ZBook Firefly 14 G10 Intel Core i7-1355U 32GB 1TB RTX A500 14" WQXGA W11P) → Computación > Laptops y portátiles > Workstations
(83, 1), (83, 7), (83, 27),
-- Producto 84 (All-In-One Apple iMac 24" Chip M3 8-core CPU 10-core GPU 16GB 512GB SSD Pantalla 4.5K Retina Azul) → Computación > PC de escritorio > All-in-One
(84, 1), (84, 8), (84, 28),
-- Producto 85 (All-In-One HP Envy 34" Curvo WUHD Intel Core i7-12700 32GB 1TB RTX 3060 6GB W11H) → Computación > PC de escritorio > All-in-One
(85, 1), (85, 8), (85, 28),
-- Producto 86 (All-In-One Dell Inspiron 27 7720 Intel Core i7-1355U 16GB 1TB SSD 27" FHD Touch W11H) → Computación > PC de escritorio > All-in-One
(86, 1), (86, 8), (86, 28),
-- Producto 87 (All-In-One ASUS Zen AiO 24 Intel Core i5-1340P 16GB 512GB 23.8" FHD IPS W11H) → Computación > PC de escritorio > All-in-One
(87, 1), (87, 8), (87, 28),
-- Producto 88 (All-In-One Lenovo Yoga AIO 9 32" 4K Intel Core i9-13900H 32GB 1TB RTX 4050 31.5" IPS W11H) → Computación > PC de escritorio > All-in-One
(88, 1), (88, 8), (88, 28),
-- Producto 89 (All-In-One HP Pavilion 24 Intel Core i5-13400T 16GB 512GB SSD 23.8" FHD IPS W11H) → Computación > PC de escritorio > All-in-One
(89, 1), (89, 8), (89, 28),
-- Producto 90 (All-In-One MSI Modern AM272P Intel Core i7-1260P 16GB 512GB 27" FHD Ajustable en Altura W11P) → Computación > PC de escritorio > All-in-One
(90, 1), (90, 8), (90, 28),
-- Producto 91 (All-In-One Acer Aspire C27 Intel Core i5-1335U 16GB 1TB SSD 27" FHD Bisel Delgado W11H) → Computación > PC de escritorio > All-in-One
(91, 1), (91, 8), (91, 28),
-- Producto 92 (All-In-One ASUS ExpertCenter E5 Intel Core i7-1360P 32GB 1TB 23.8" FHD Doble Pantalla Opcional W11P) → Computación > PC de escritorio > All-in-One
(92, 1), (92, 8), (92, 28),
-- Producto 93 (Mini PC Apple Mac mini Chip M2 Pro CPU 10-core GPU 16-core 16GB 512GB SSD) → Computación > PC de escritorio > Torres/MiniPC
(93, 1), (93, 8), (93, 29),
-- Producto 94 (Mini PC Minisforum UM780 XTX AMD Ryzen 7 7840HS 32GB DDR5 1TB SSD OCuLink) → Computación > PC de escritorio > Torres/MiniPC
(94, 1), (94, 8), (94, 29),
-- Producto 95 (Mini PC Beelink SER8 AMD Ryzen 7 8845HS 32GB DDR5 1TB SSD WiFi 6E) → Computación > PC de escritorio > Torres/MiniPC
(95, 1), (95, 8), (95, 29),
-- Producto 96 (Mini PC Gamer ASUS ROG NUC Intel Core Ultra 9 185H 32GB 1TB RTX 4070 8GB GDDR6) → Computación > PC de escritorio > Torres/MiniPC
(96, 1), (96, 8), (96, 29),
-- Producto 97 (PC Torre Gamer HP OMEN 45L Intel Core i9-14900K 64GB 2TB RTX 4090 24GB Cryo Chamber W11P) → Computación > PC de escritorio > Torres/MiniPC
(97, 1), (97, 8), (97, 29),
-- Producto 98 (PC Torre Gamer Lenovo Legion Tower 7i Intel Core i7-14700KF 32GB 1TB RTX 4070Ti Super W11H) → Computación > PC de escritorio > Torres/MiniPC
(98, 1), (98, 8), (98, 29),
-- Producto 99 (Mini PC Dell OptiPlex Micro 7010 Intel Core i5-13500T 16GB 512GB SSD W11P) → Computación > PC de escritorio > Torres/MiniPC
(99, 1), (99, 8), (99, 29),
-- Producto 100 (PC Torre Compacto Corsair ONE i500 Intel Core i9-14900K 64GB 2TB RTX 4080 Super Madera W11P) → Computación > PC de escritorio > Torres/MiniPC
(100, 1), (100, 8), (100, 29),
-- Producto 101 (Mini PC GEEKOM A8 AMD Ryzen 9 8945HS 32GB DDR5 2TB SSD WiFi 6E Bluetooth 5.2 W11P) → Computación > PC de escritorio > Torres/MiniPC
(101, 1), (101, 8), (101, 29),
-- Producto 102 (Servidor NAS Synology DiskStation DS923+ 4-Bay AMD Ryzen R1600 4GB ECC RAM M.2 NVMe Ready) → Computación > PC de escritorio > Servidores NAS
(102, 1), (102, 8), (102, 30),
-- Producto 103 (Servidor NAS Synology DiskStation DS224+ 2-Bay Intel Celeron J4125 2GB DDR4) → Computación > PC de escritorio > Servidores NAS
(103, 1), (103, 8), (103, 30),
-- Producto 104 (Servidor NAS QNAP TS-464 4-Bay Intel Celeron N5095 8GB RAM 2x 2.5GbE HDMI 4K) → Computación > PC de escritorio > Servidores NAS
(104, 1), (104, 8), (104, 30),
-- Producto 105 (Servidor NAS Asustor Lockerstor 4 Gen2 AS6704T 4-Bay Intel Celeron N5105 4GB RAM 4x M.2) → Computación > PC de escritorio > Servidores NAS
(105, 1), (105, 8), (105, 30),
-- Producto 106 (Servidor NAS TerraMaster F4-424 Pro 4-Bay Intel Core i3-N305 32GB DDR5 2x 2.5GbE) → Computación > PC de escritorio > Servidores NAS
(106, 1), (106, 8), (106, 30),
-- Producto 107 (Servidor NAS Synology DiskStation DS1522+ 5-Bay AMD Ryzen R1600 8GB ECC RAM) → Computación > PC de escritorio > Servidores NAS
(107, 1), (107, 8), (107, 30),
-- Producto 108 (Servidor NAS Todo Flash M.2 QNAP TBS-464 4x M.2 NVMe SSD Intel Celeron N5105 8GB RAM Portátil) → Computación > PC de escritorio > Servidores NAS
(108, 1), (108, 8), (108, 30),
-- Producto 109 (Servidor NAS Synology DiskStation DS1821+ 8-Bay AMD Ryzen V1500B Quad-Core 4GB ECC RAM) → Computación > PC de escritorio > Servidores NAS
(109, 1), (109, 8), (109, 30),
-- Producto 110 (Caja de Almacenamiento DAS TerraMaster D2-320 2-Bay USB 3.2 Gen 2 10Gbps Tipo-C) → Computación > PC de escritorio > Servidores NAS
(110, 1), (110, 8), (110, 30),
-- Producto 111 (Procesador AMD Ryzen 7 7800X3D, 4.2GHz Turbo 5.0GHz, Socket AM5, 8-Core / 16-Threads con 3D V-Cache) → Computación > Componentes PC > Procesadores
(111, 1), (111, 9), (111, 31),
-- Producto 112 (Procesador Intel Core i7-14700K, 3.4GHz Turbo 5.6GHz, Socket LGA 1700, 20-Core (8P+12E) / 28-Threads) → Computación > Componentes PC > Procesadores
(112, 1), (112, 9), (112, 31),
-- Producto 113 (Procesador Intel Core i9-14900K, 3.2GHz Turbo 6.0GHz, Socket LGA 1700, 24-Core (8P+16E) / 32-Threads) → Computación > Componentes PC > Procesadores
(113, 1), (113, 9), (113, 31),
-- Producto 114 (Procesador AMD Ryzen 7 7700X, 4.5GHz Turbo 5.4GHz, Socket AM5, 8-Core / 16-Threads) → Computación > Componentes PC > Procesadores
(114, 1), (114, 9), (114, 31),
-- Producto 115 (Procesador AMD Ryzen 5 7600, 3.8GHz Turbo 5.1GHz, Socket AM5, 6-Core / 12-Threads con Cooler Wraith Stealth) → Computación > Componentes PC > Procesadores
(115, 1), (115, 9), (115, 31),
-- Producto 116 (Procesador Intel Core i5-14400F, 2.5GHz Turbo 4.7GHz, Socket LGA 1700, 10-Core (6P+4E) / 16-Threads) → Computación > Componentes PC > Procesadores
(116, 1), (116, 9), (116, 31),
-- Producto 117 (Procesador AMD Ryzen 9 7950X, 4.5GHz Turbo 5.7GHz, Socket AM5, 16-Core / 32-Threads) → Computación > Componentes PC > Procesadores
(117, 1), (117, 9), (117, 31),
-- Producto 118 (Procesador Intel Core i5-14600KF, 3.5GHz Turbo 5.3GHz, Socket LGA 1700, 14-Core (6P+8E) / 20-Threads) → Computación > Componentes PC > Procesadores
(118, 1), (118, 9), (118, 31),
-- Producto 119 (Procesador AMD Ryzen 5 5600X, 3.7GHz Turbo 4.6GHz, Socket AM4, 6-Core / 12-Threads con Cooler) → Computación > Componentes PC > Procesadores
(119, 1), (119, 9), (119, 31),
-- Producto 120 (Memoria RAM Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz CL30 Intel XMP y AMD EXPO Negra) → Computación > Componentes PC > RAM
(120, 1), (120, 9), (120, 32),
-- Producto 121 (Memoria RAM G.Skill Trident Z5 Neo RGB DDR5 32GB (2x16GB) 6000MHz CL30 AMD EXPO) → Computación > Componentes PC > RAM
(121, 1), (121, 9), (121, 32),
-- Producto 122 (Memoria RAM Crucial Pro DDR5 32GB (2x16GB) 6000MHz CL36 Intel XMP 3.0 y AMD EXPO Negra) → Computación > Componentes PC > RAM
(122, 1), (122, 9), (122, 32),
-- Producto 123 (Memoria RAM Corsair Dominator Titanium DDR5 64GB (2x32GB) 6400MHz CL32 Blanca Intel XMP) → Computación > Componentes PC > RAM
(123, 1), (123, 9), (123, 32),
-- Producto 124 (Memoria RAM TeamGroup T-Force Delta RGB DDR5 32GB (2x16GB) 6000MHz CL30 Blanca) → Computación > Componentes PC > RAM
(124, 1), (124, 9), (124, 32),
-- Producto 125 (Memoria RAM Kingston FURY Beast DDR4 32GB (2x16GB) 3200MHz CL16 Negra) → Computación > Componentes PC > RAM
(125, 1), (125, 9), (125, 32),
-- Producto 126 (Memoria RAM Corsair Vengeance LPX DDR4 16GB (2x8GB) 3200MHz CL16 Negra) → Computación > Componentes PC > RAM
(126, 1), (126, 9), (126, 32),
-- Producto 127 (Memoria RAM G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 7200MHz CL34 Plata Intel XMP) → Computación > Componentes PC > RAM
(127, 1), (127, 9), (127, 32),
-- Producto 128 (Memoria RAM Crucial DDR5 32GB (2x16GB) 4800MHz CL40 Estándar JEDEC) → Computación > Componentes PC > RAM
(128, 1), (128, 9), (128, 32),
-- Producto 129 (Tarjeta Gráfica ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X) → Computación > Componentes PC > Tarjetas gráficas
(129, 1), (129, 9), (129, 33),
-- Producto 130 (Tarjeta Gráfica MSI GeForce RTX 4080 SUPER 16G GAMING X SLIM GDDR6X) → Computación > Componentes PC > Tarjetas gráficas
(130, 1), (130, 9), (130, 33),
-- Producto 131 (Tarjeta Gráfica GIGABYTE GeForce RTX 4070 Ti SUPER WINDFORCE OC 16GB GDDR6X) → Computación > Componentes PC > Tarjetas gráficas
(131, 1), (131, 9), (131, 33),
-- Producto 132 (Tarjeta Gráfica Sapphire Pulse AMD Radeon RX 7800 XT 16GB GDDR6) → Computación > Componentes PC > Tarjetas gráficas
(132, 1), (132, 9), (132, 33),
-- Producto 133 (Tarjeta Gráfica ASUS Dual GeForce RTX 4070 EVO OC Edition 12GB GDDR6X) → Computación > Componentes PC > Tarjetas gráficas
(133, 1), (133, 9), (133, 33),
-- Producto 134 (Tarjeta Gráfica XFX Speedster MERC 310 AMD Radeon RX 7900 XT Black Edition 20GB GDDR6) → Computación > Componentes PC > Tarjetas gráficas
(134, 1), (134, 9), (134, 33),
-- Producto 135 (Tarjeta Gráfica ZOTAC Gaming GeForce RTX 4060 Ti 8GB Twin Edge GDDR6) → Computación > Componentes PC > Tarjetas gráficas
(135, 1), (135, 9), (135, 33),
-- Producto 136 (Tarjeta Gráfica PowerColor Fighter AMD Radeon RX 7600 XT 16GB GDDR6) → Computación > Componentes PC > Tarjetas gráficas
(136, 1), (136, 9), (136, 33),
-- Producto 137 (Tarjeta Gráfica MSI GeForce RTX 3050 VENTUS 2X 6G OC GDDR6 (Sin conector PCIe)) → Computación > Componentes PC > Tarjetas gráficas
(137, 1), (137, 9), (137, 33),
-- Producto 138 (SSD M.2 NVMe Samsung 990 PRO 2TB PCIe 4.0 x4 con Disipador Térmico (7450 MB/s) Compatible PS5 y PC) → Computación > Componentes PC > Almacenamiento
(138, 1), (138, 9), (138, 34),
-- Producto 139 (SSD M.2 NVMe Crucial T700 2TB PCIe 5.0 x4 con Disipador Térmico (12400 MB/s)) → Computación > Componentes PC > Almacenamiento
(139, 1), (139, 9), (139, 34),
-- Producto 140 (SSD M.2 NVMe Kingston KC3000 2TB PCIe 4.0 x4 (7000 MB/s)) → Computación > Componentes PC > Almacenamiento
(140, 1), (140, 9), (140, 34),
-- Producto 141 (SSD M.2 NVMe WD_BLACK SN770 1TB PCIe Gen4 x4 (5150 MB/s) Gaming) → Computación > Componentes PC > Almacenamiento
(141, 1), (141, 9), (141, 34),
-- Producto 142 (SSD M.2 NVMe Crucial P3 Plus 1TB PCIe 4.0 x4 (5000 MB/s)) → Computación > Componentes PC > Almacenamiento
(142, 1), (142, 9), (142, 34),
-- Producto 143 (Disco Duro Interno Seagate BarraCuda 2TB 3.5" SATA III 7200 RPM 256MB Caché) → Computación > Componentes PC > Almacenamiento
(143, 1), (143, 9), (143, 34),
-- Producto 144 (Disco Duro Interno Western Digital WD Red Plus 4TB 3.5" SATA III 5400 RPM CMR para NAS) → Computación > Componentes PC > Almacenamiento
(144, 1), (144, 9), (144, 34),
-- Producto 145 (SSD Interno 2.5" SATA III Samsung 870 EVO 1TB (560 MB/s)) → Computación > Componentes PC > Almacenamiento
(145, 1), (145, 9), (145, 34),
-- Producto 146 (SSD M.2 NVMe Corsair MP600 PRO LPX 2TB PCIe 4.0 x4 Optimizado para PS5 y PC (7100 MB/s)) → Computación > Componentes PC > Almacenamiento
(146, 1), (146, 9), (146, 34),
-- Producto 147 (Smartphone Samsung Galaxy S24 Ultra 5G 512GB 12GB RAM Titanio Gris con Galaxy AI y S-Pen) → Smartphones y Tablets > Smartphones > Gama alta
(147, 2), (147, 10), (147, 35),
-- Producto 148 (Smartphone Apple iPhone 15 Pro Max 256GB Titanio Natural Chip A17 Pro) → Smartphones y Tablets > Smartphones > Gama alta
(148, 2), (148, 10), (148, 35),
-- Producto 149 (Smartphone Google Pixel 8 Pro 5G 128GB 12GB RAM Obsidiana con Chip Google Tensor G3) → Smartphones y Tablets > Smartphones > Gama alta
(149, 2), (149, 10), (149, 35),
-- Producto 150 (Smartphone Xiaomi 14 Ultra 5G 512GB 16GB RAM Negro Lentes Ópticos Leica) → Smartphones y Tablets > Smartphones > Gama alta
(150, 2), (150, 10), (150, 35),
-- Producto 151 (Smartphone Plegable Samsung Galaxy Z Fold5 5G 512GB 12GB RAM Phantom Black) → Smartphones y Tablets > Smartphones > Gama alta
(151, 2), (151, 10), (151, 35),
-- Producto 152 (Smartphone Gamer ASUS ROG Phone 8 Pro 5G 512GB 16GB RAM 165Hz AniMe Vision) → Smartphones y Tablets > Smartphones > Gama alta
(152, 2), (152, 10), (152, 35),
-- Producto 153 (Smartphone OnePlus 12 5G 512GB 16GB RAM Emerald Green Cámara Hasselblad) → Smartphones y Tablets > Smartphones > Gama alta
(153, 2), (153, 10), (153, 35),
-- Producto 154 (Smartphone Sony Xperia 1 VI 5G 256GB 12GB RAM Negro Zoom Óptico Continuo 85-170mm) → Smartphones y Tablets > Smartphones > Gama alta
(154, 2), (154, 10), (154, 35),
-- Producto 155 (Smartphone Plegable Samsung Galaxy Z Flip5 5G 256GB 8GB RAM Mint Pantalla Flex Window) → Smartphones y Tablets > Smartphones > Gama alta
(155, 2), (155, 10), (155, 35),
-- Producto 156 (Smartphone Xiaomi Redmi Note 13 Pro+ 5G 512GB 12GB RAM Midnight Black 200MP OIS IP68) → Smartphones y Tablets > Smartphones > Gama media
(156, 2), (156, 10), (156, 36),
-- Producto 157 (Smartphone Google Pixel 8a 5G 128GB 8GB RAM Bay Blue Chip Tensor G3) → Smartphones y Tablets > Smartphones > Gama media
(157, 2), (157, 10), (157, 36),
-- Producto 158 (Smartphone POCO X6 Pro 5G 512GB 12GB RAM Amarillo Dimensity 8300-Ultra) → Smartphones y Tablets > Smartphones > Gama media
(158, 2), (158, 10), (158, 36),
-- Producto 159 (Smartphone Motorola Edge 50 Pro 512GB 12GB RAM Cuero Vegano Lavanda 125W TurboPower) → Smartphones y Tablets > Smartphones > Gama media
(159, 2), (159, 10), (159, 36),
-- Producto 160 (Smartphone Samsung Galaxy A35 5G 256GB 8GB RAM Awesome Navy Pantalla Super AMOLED 120Hz) → Smartphones y Tablets > Smartphones > Gama media
(160, 2), (160, 10), (160, 36),
-- Producto 161 (Smartphone Nothing Phone (2a) 5G 256GB 12GB RAM Blanco Interfaz Glyph Dimensity 7200 Pro) → Smartphones y Tablets > Smartphones > Gama media
(161, 2), (161, 10), (161, 36),
-- Producto 162 (Smartphone realme 12 Pro+ 5G 512GB 12GB RAM Submarine Blue Teleobjetivo Periscópico) → Smartphones y Tablets > Smartphones > Gama media
(162, 2), (162, 10), (162, 36),
-- Producto 163 (Smartphone HONOR Magic6 Lite 5G 256GB 8GB RAM Naranja Pantalla Anticaídas Ultra Resistente) → Smartphones y Tablets > Smartphones > Gama media
(163, 2), (163, 10), (163, 36),
-- Producto 164 (Smartphone OnePlus Nord CE4 5G 256GB 8GB RAM Dark Chrome Carga 100W) → Smartphones y Tablets > Smartphones > Gama media
(164, 2), (164, 10), (164, 36),
-- Producto 165 (Smartphone Samsung Galaxy A15 4G 128GB 4GB RAM Blue Black Pantalla Super AMOLED 90Hz) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(165, 2), (165, 10), (165, 37),
-- Producto 166 (Smartphone Xiaomi Redmi 13C 128GB 4GB RAM Clover Green Pantalla 6.74" 90Hz) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(166, 2), (166, 10), (166, 37),
-- Producto 167 (Smartphone Motorola Moto G14 128GB 4GB RAM Gris Acero Pantalla FHD+ Audio Dolby Atmos) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(167, 2), (167, 10), (167, 37),
-- Producto 168 (Smartphone realme Note 50 64GB 3GB RAM Midnight Black Pantalla 90Hz Resistencia IP54) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(168, 2), (168, 10), (168, 37),
-- Producto 169 (Smartphone HONOR X6a 128GB 4GB RAM Cyan Lake Batería 5200 mAh Pantalla 90Hz) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(169, 2), (169, 10), (169, 37),
-- Producto 170 (Smartphone ZTE Blade A54 64GB 4GB RAM Azul Pantalla 6.6" HD+ 5000 mAh) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(170, 2), (170, 10), (170, 37),
-- Producto 171 (Smartphone TCL 505 128GB 4GB RAM Gris Espacial Pantalla 6.75" 90Hz Altavoces Duales) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(171, 2), (171, 10), (171, 37),
-- Producto 172 (Smartphone Nokia G22 64GB 4GB RAM Gris Reparable por el Usuario con iFixit) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(172, 2), (172, 10), (172, 37),
-- Producto 173 (Smartphone POCO C65 256GB 8GB RAM Morado Pantalla 6.74" 90Hz Cámara Triple 50MP) → Smartphones y Tablets > Smartphones > Básicos/Prepago
(173, 2), (173, 10), (173, 37),
-- Producto 174 (Tablet Samsung Galaxy Tab S9+ 12.4" 256GB 12GB RAM WiFi Dynamic AMOLED 2X con S-Pen IP68) → Smartphones y Tablets > Tablets > Tablets Android
(174, 2), (174, 11), (174, 38),
-- Producto 175 (Tablet Xiaomi Pad 6S Pro 12.4" 512GB 12GB RAM 3K 144Hz Snapdragon 8 Gen 2 Carga 120W) → Smartphones y Tablets > Tablets > Tablets Android
(175, 2), (175, 11), (175, 38),
-- Producto 176 (Tablet Lenovo Tab P12 12.7" 3K 128GB 8GB RAM con Lápiz Lenovo Tab Pen Plus Incluido) → Smartphones y Tablets > Tablets > Tablets Android
(176, 2), (176, 11), (176, 38),
-- Producto 177 (Tablet OnePlus Pad 2 11.61" 3K 144Hz 256GB 12GB RAM Snapdragon 8 Gen 3 Gris) → Smartphones y Tablets > Tablets > Tablets Android
(177, 2), (177, 11), (177, 38),
-- Producto 178 (Tablet Samsung Galaxy Tab A9+ 11" 64GB 4GB RAM WiFi Plata Pantalla 90Hz) → Smartphones y Tablets > Tablets > Tablets Android
(178, 2), (178, 11), (178, 38),
-- Producto 179 (Tablet Xiaomi Redmi Pad SE 11" 128GB 4GB RAM Gris Grafito Pantalla 90Hz Batería 8000 mAh) → Smartphones y Tablets > Tablets > Tablets Android
(179, 2), (179, 11), (179, 38),
-- Producto 180 (Tablet Lenovo Tab M11 11" WUXGA 128GB 4GB RAM con Funda Folio y Lápiz Óptico) → Smartphones y Tablets > Tablets > Tablets Android
(180, 2), (180, 11), (180, 38),
-- Producto 181 (Tablet HONOR Pad 9 12.1" 2.5K 120Hz 256GB 8GB RAM Gris 8 Altavoces) → Smartphones y Tablets > Tablets > Tablets Android
(181, 2), (181, 11), (181, 38),
-- Producto 182 (Tablet Blackview MEGA 1 11.5" 2.4K 120Hz 256GB 12GB RAM Helio G99 Cámara 50MP) → Smartphones y Tablets > Tablets > Tablets Android
(182, 2), (182, 11), (182, 38),
-- Producto 183 (Apple iPad Pro 11" Chip M4 256GB WiFi Pantalla Ultra Retina XDR OLED Gris Espacial) → Smartphones y Tablets > Tablets > iPads
(183, 2), (183, 11), (183, 39),
-- Producto 184 (Apple iPad Pro 13" Chip M4 512GB WiFi Pantalla Ultra Retina XDR OLED Plata) → Smartphones y Tablets > Tablets > iPads
(184, 2), (184, 11), (184, 39),
-- Producto 185 (Apple iPad Air 13" Chip M2 128GB WiFi Azul Pantalla Liquid Retina) → Smartphones y Tablets > Tablets > iPads
(185, 2), (185, 11), (185, 39),
-- Producto 186 (Apple iPad 10ma Generación 10.9" 64GB WiFi Plata Chip A14 Bionic Puerto USB-C) → Smartphones y Tablets > Tablets > iPads
(186, 2), (186, 11), (186, 39),
-- Producto 187 (Apple iPad mini 8.3" 64GB WiFi Púrpura Chip A15 Bionic True Tone) → Smartphones y Tablets > Tablets > iPads
(187, 2), (187, 11), (187, 39),
-- Producto 188 (Apple iPad 10ma Generación 10.9" 256GB WiFi Amarillo Chip A14 Bionic) → Smartphones y Tablets > Tablets > iPads
(188, 2), (188, 11), (188, 39),
-- Producto 189 (Apple iPad Air 11" Chip M2 256GB WiFi Blanco Estrella Pantalla Liquid Retina) → Smartphones y Tablets > Tablets > iPads
(189, 2), (189, 11), (189, 39),
-- Producto 190 (Apple iPad Pro 11" Chip M4 512GB WiFi + Cellular 5G Pantalla Ultra Retina XDR Negro Espacial) → Smartphones y Tablets > Tablets > iPads
(190, 2), (190, 11), (190, 39),
-- Producto 191 (Apple iPad Pro 13" Chip M4 1TB WiFi Vidrio Nanotexturizado Pantalla Ultra Retina XDR) → Smartphones y Tablets > Tablets > iPads
(191, 2), (191, 11), (191, 39),
-- Producto 192 (Tablet 2-en-1 Microsoft Surface Pro 11va Edición Copilot+ PC Snapdragon X Elite 16GB 512GB OLED 13" Platino) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(192, 2), (192, 11), (192, 40),
-- Producto 193 (Tablet 2-en-1 Microsoft Surface Pro 9 Intel Core i7-1255U 16GB 256GB SSD 13" PixelSense 120Hz Grafito) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(193, 2), (193, 11), (193, 40),
-- Producto 194 (Tablet 2-en-1 Lenovo Yoga Duet 7i Intel Core i5-1135G7 16GB 512GB 13" 2K Touch Teclado Bluetooth y Lápiz) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(194, 2), (194, 11), (194, 40),
-- Producto 195 (Tablet 2-en-1 Gamer ASUS ROG Flow Z13 Intel Core i9-13900H 16GB 1TB RTX 4050 13.4" QHD+ 165Hz) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(195, 2), (195, 11), (195, 40),
-- Producto 196 (Tablet 2-en-1 Dell Latitude 7320 Detachable Intel Core i7-1180G7 16GB 512GB 13" FHD+ vPro W11P) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(196, 2), (196, 11), (196, 40),
-- Producto 197 (Tablet 2-en-1 HP Elite Dragonfly Folio G3 Intel Core i7-1265U 32GB 1TB 13.5" 3K2K OLED Touch W11P) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(197, 2), (197, 11), (197, 40),
-- Producto 198 (Tablet 2-en-1 Microsoft Surface Go 4 Intel N200 8GB 128GB UFS 10.5" PixelSense Platino W11P) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(198, 2), (198, 11), (198, 40),
-- Producto 199 (Tablet 2-en-1 Acer Switch 5 Intel Core i5-7200U 8GB 256GB 12" QHD Touch LiquidLoop) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(199, 2), (199, 11), (199, 40),
-- Producto 200 (Tablet 2-en-1 Lenovo ThinkPad X12 Detachable Intel Core i5-1130G7 16GB 512GB 12.3" FHD+ W11P) → Smartphones y Tablets > Tablets > Tablets 2-en-1
(200, 2), (200, 11), (200, 40),
-- Producto 201 (Funda Spigen Ultra Hybrid Zero One para Samsung Galaxy S24 Ultra Diseño Teardown Magnética) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(201, 2), (201, 12), (201, 41),
-- Producto 202 (Funda de Alta Resistencia OtterBox Defender Series XT para iPhone 15 Pro Max Negra con MagSafe) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(202, 2), (202, 12), (202, 41),
-- Producto 203 (Funda Rugerizada UAG Monarch Pro Kevlar para Samsung Galaxy S24 Ultra Magnética) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(203, 2), (203, 12), (203, 41),
-- Producto 204 (Protector de Pantalla Vidrio Templado Spigen GlasTR EZ FIT para Galaxy S24 Ultra (Pack 2 Unidades)) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(204, 2), (204, 12), (204, 41),
-- Producto 205 (Funda Magnética con Soporte Plegable TORRAS Magnetic Ostand para iPhone 15 Pro Negro Mate) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(205, 2), (205, 12), (205, 41),
-- Producto 206 (Funda Anticaídas Ringke Fusion-X para Samsung Galaxy S24 Camo Black) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(206, 2), (206, 12), (206, 41),
-- Producto 207 (Protector de Pantalla Vidrio Ultrarresistente ESR Armorite para iPhone 15 Pro Max (Pack 2 con Bandeja)) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(207, 2), (207, 12), (207, 41),
-- Producto 208 (Funda Delgada con Patrón Geométrico Spigen Liquid Air para Google Pixel 8 Negro Mate) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(208, 2), (208, 12), (208, 41),
-- Producto 209 (Funda Transparente Antiamarilleo UAG Plyo Series MagSafe para iPhone 15 Ice/White) → Smartphones y Tablets > Accesorios móvil > Fundas y protectores
(209, 2), (209, 12), (209, 41),
-- Producto 210 (Cargador Rápido de Pared Anker Prime 100W GaN 3 Puertos (2x USB-C + 1x USB-A) Plegable) → Smartphones y Tablets > Accesorios móvil > Cargadores
(210, 2), (210, 12), (210, 42),
-- Producto 211 (Cargador de Pared UGREEN Nexode 65W GaN Fast Charger 3 Puertos USB-C y USB-A) → Smartphones y Tablets > Accesorios móvil > Cargadores
(211, 2), (211, 12), (211, 42),
-- Producto 212 (Estación de Carga Inalámbrica Plegable 3 en 1 Anker MagGo Qi2 Certificada 15W MagSafe) → Smartphones y Tablets > Accesorios móvil > Cargadores
(212, 2), (212, 12), (212, 42),
-- Producto 213 (Cargador Original Samsung 45W Power Adapter USB-C Super Fast Charging 2.0 con Cable 5A 1.8m) → Smartphones y Tablets > Accesorios móvil > Cargadores
(213, 2), (213, 12), (213, 42),
-- Producto 214 (Batería Externa Power Bank Ultrafina Baseus Blade 100W 20000mAh con Pantalla Digital) → Smartphones y Tablets > Accesorios móvil > Cargadores
(214, 2), (214, 12), (214, 42),
-- Producto 215 (Cargador Doble USB-C Belkin BoostCharge Pro 65W GaN PPS Blanco) → Smartphones y Tablets > Accesorios móvil > Cargadores
(215, 2), (215, 12), (215, 42),
-- Producto 216 (Batería Externa Anker Nano Power Bank 10000mAh 30W con Cable USB-C Incorporado) → Smartphones y Tablets > Accesorios móvil > Cargadores
(216, 2), (216, 12), (216, 42),
-- Producto 217 (Cargador de Auto Rápido UGREEN 130W Metálico (100W USB-C + 30W USB-A) para Coche y Camión) → Smartphones y Tablets > Accesorios móvil > Cargadores
(217, 2), (217, 12), (217, 42),
-- Producto 218 (Batería Externa Futurista Shargeek Storm 2 Slim 130W 20000mAh Transparente con Pantalla IPS) → Smartphones y Tablets > Accesorios móvil > Cargadores
(218, 2), (218, 12), (218, 42),
-- Producto 219 (Cable USB-C a USB-C Anker 765 Nylon Trenzado 140W USB Power Delivery 3.1 1.8 Metros) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(219, 2), (219, 12), (219, 43),
-- Producto 220 (Cable Thunderbolt 4 USB4 UGREEN 40Gbps 100W 8K@60Hz 0.8 Metros Certificado Intel) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(220, 2), (220, 12), (220, 43),
-- Producto 221 (Cable Original Apple USB-C a Lightning 2 Metros Blanco para Carga Rápida) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(221, 2), (221, 12), (221, 43),
-- Producto 222 (Adaptador Doble Belkin Rockstar Audio + Carga Lightning para iPhone Certificado MFi) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(222, 2), (222, 12), (222, 43),
-- Producto 223 (Adaptador USB-C a Jack 3.5mm UGREEN con Chip DAC Hi-Res Audio 24bit/96kHz Trenzado) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(223, 2), (223, 12), (223, 43),
-- Producto 224 (Adaptador Hub USB-C 8 en 1 Anker 555 HDMI 4K@60Hz 100W PD Ethernet 10Gbps para Teléfonos y Laptops) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(224, 2), (224, 12), (224, 43),
-- Producto 225 (Cable Retráctil USB-C a USB-C Baseus Free2Draw 100W PD Regulable en Longitud (1 Metro)) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(225, 2), (225, 12), (225, 43),
-- Producto 226 (Cable USB-C a USB-C Spigen DuraBend 60W Silicona Suave al Tacto 1 Metro Negro) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(226, 2), (226, 12), (226, 43),
-- Producto 227 (Adaptador USB-C a USB-A 3.0 OTG UGREEN Metálico de Tamaño Miniatura (Pack 2 Unidades)) → Smartphones y Tablets > Accesorios móvil > Cables y adaptadores
(227, 2), (227, 12), (227, 43),
-- Producto 228 (Consola PlayStation 5 Pro 2TB SSD Edición Digital con PlayStation Spectral Super Resolution (PSSR)) → Gaming > Consolas > PlayStation
(228, 3), (228, 13), (228, 44),
-- Producto 229 (Control Inalámbrico DualSense Edge para PlayStation 5 Personalizable con Módulos Intercambiables) → Gaming > Consolas > PlayStation
(229, 3), (229, 13), (229, 44),
-- Producto 230 (Visor de Realidad Virtual PlayStation VR2 + Juego Horizon Call of the Mountain) → Gaming > Consolas > PlayStation
(230, 3), (230, 13), (230, 44),
-- Producto 231 (Reproductor Remoto PlayStation Portal para Consola PS5 Pantalla LCD 8" 1080p 60Hz) → Gaming > Consolas > PlayStation
(231, 3), (231, 13), (231, 44),
-- Producto 232 (Auriculares Inalámbricos PlayStation Pulse Elite con Drivers Magnéticos Planares para PS5 y PC) → Gaming > Consolas > PlayStation
(232, 3), (232, 13), (232, 44),
-- Producto 233 (Control Inalámbrico DualSense para PlayStation 5 Edición Deep Earth Volcanic Red) → Gaming > Consolas > PlayStation
(233, 3), (233, 13), (233, 44),
-- Producto 234 (Estación de Carga Doble Original Sony para Mandos DualSense y DualSense Edge de PS5) → Gaming > Consolas > PlayStation
(234, 3), (234, 13), (234, 44),
-- Producto 235 (SSD M.2 Seagate FireCuda 530 2TB con Disipador Térmico Oficial con Licencia PlayStation 5) → Gaming > Consolas > PlayStation
(235, 3), (235, 13), (235, 44),
-- Producto 236 (Auriculares Inalámbricos TWS PlayStation Pulse Explore Magnéticos Planares para PS5 y Móvil) → Gaming > Consolas > PlayStation
(236, 3), (236, 13), (236, 44),
-- Producto 237 (Consola Xbox Series X 1TB SSD con Lector de Discos 4K Ultra HD Blu-Ray y Game Pass Ready) → Gaming > Consolas > Xbox
(237, 3), (237, 13), (237, 45),
-- Producto 238 (Consola Xbox Series S 1TB SSD Edición Digital Carbon Black) → Gaming > Consolas > Xbox
(238, 3), (238, 13), (238, 45),
-- Producto 239 (Control Inalámbrico Xbox Elite Series 2 Core Blanco con Palancas de Tensión Ajustable) → Gaming > Consolas > Xbox
(239, 3), (239, 13), (239, 45),
-- Producto 240 (Tarjeta de Expansión de Almacenamiento Seagate de 1TB para Xbox Series X|S NVMe Plug-and-Play) → Gaming > Consolas > Xbox
(240, 3), (240, 13), (240, 45),
-- Producto 241 (Auriculares Inalámbricos Xbox Wireless Headset con Diales Giratorios en Auriculares y Dolby Atmos) → Gaming > Consolas > Xbox
(241, 3), (241, 13), (241, 45),
-- Producto 242 (Control Inalámbrico Xbox Robot White con Cruceta Híbrida y Botón Compartir) → Gaming > Consolas > Xbox
(242, 3), (242, 13), (242, 45),
-- Producto 243 (Auriculares Inalámbricos Premium Turtle Beach Stealth Pro para Xbox y PC con Cancelación Activa de Ruido) → Gaming > Consolas > Xbox
(243, 3), (243, 13), (243, 45),
-- Producto 244 (Control Profesional con Cable Razer Wolverine V2 Chroma para Xbox Series X|S y PC con 6 Botones Extra) → Gaming > Consolas > Xbox
(244, 3), (244, 13), (244, 45),
-- Producto 245 (Estación de Carga Doble PowerA para Mandos de Xbox con 2 Baterías Recargables de 1100mAh) → Gaming > Consolas > Xbox
(245, 3), (245, 13), (245, 45),
-- Producto 246 (Consola Nintendo Switch Modelo OLED 64GB Blanco Pantalla OLED 7" Soporte Ancho Ajustable) → Gaming > Consolas > Nintendo
(246, 3), (246, 13), (246, 46),
-- Producto 247 (Consola Portátil Nintendo Switch Lite 32GB Turquesa Diseño Compacto y Ligero) → Gaming > Consolas > Nintendo
(247, 3), (247, 13), (247, 46),
-- Producto 248 (Control Inalámbrico Nintendo Switch Pro Controller Original con Giroscopio y Vibración HD) → Gaming > Consolas > Nintendo
(248, 3), (248, 13), (248, 46),
-- Producto 249 (Mandos Nintendo Joy-Con Par (Azul Neón / Rojo Neón) con Correas de Muñeca) → Gaming > Consolas > Nintendo
(249, 3), (249, 13), (249, 46),
-- Producto 250 (Mandos Ergonómicos HORI Split Pad Pro para Nintendo Switch en Modo Portátil Negro) → Gaming > Consolas > Nintendo
(250, 3), (250, 13), (250, 46),
-- Producto 251 (Tarjeta de Memoria SanDisk MicroSDXC 512GB con Licencia Oficial Nintendo Switch (100 MB/s)) → Gaming > Consolas > Nintendo
(251, 3), (251, 13), (251, 46),
-- Producto 252 (Cargador y Base Dock Portátil HDMI Genki Covert Dock Mini para Nintendo Switch 4K) → Gaming > Consolas > Nintendo
(252, 3), (252, 13), (252, 46),
-- Producto 253 (Control Inalámbrico 8BitDo Ultimate Bluetooth con Joysticks Hall Effect y Base de Carga Blanca) → Gaming > Consolas > Nintendo
(253, 3), (253, 13), (253, 46),
-- Producto 254 (Funda Rígida de Viaje Ultrafina tomtoc FancyCase para Nintendo Switch OLED Militarmente Resistente) → Gaming > Consolas > Nintendo
(254, 3), (254, 13), (254, 46),
-- Producto 255 (Teclado Mecánico SteelSeries Apex Pro TKL (2023) Switches OmniPoint 2.0 Ajustables Pantalla OLED) → Gaming > Periféricos gaming > Teclados mecánicos
(255, 3), (255, 14), (255, 47),
-- Producto 256 (Teclado Mecánico Razer Huntsman V3 Pro TKL Switches Ópticos Analógicos Gen-2 con Rapid Trigger) → Gaming > Periféricos gaming > Teclados mecánicos
(256, 3), (256, 14), (256, 47),
-- Producto 257 (Teclado Mecánico Inalámbrico Logitech G915 LIGHTSPEED TKL GL Tactile Perfil Bajo RGB) → Gaming > Periféricos gaming > Teclados mecánicos
(257, 3), (257, 14), (257, 47),
-- Producto 258 (Teclado Mecánico Corsair K70 RGB PRO Cherry MX Red Sondeo 8000Hz Axon Reposamuñecas) → Gaming > Periféricos gaming > Teclados mecánicos
(258, 3), (258, 14), (258, 47),
-- Producto 259 (Teclado Mecánico Personalizado Keychron Q1 Pro QMK/VIA Inalámbrico 75% Montaje Gasket Knob) → Gaming > Periféricos gaming > Teclados mecánicos
(259, 3), (259, 14), (259, 47),
-- Producto 260 (Teclado Mecánico Gamer ASUS ROG Azoth 75% Pantalla OLED Switch NX Snow Prelubricado Hot-Swap) → Gaming > Periféricos gaming > Teclados mecánicos
(260, 3), (260, 14), (260, 47),
-- Producto 261 (Teclado Mecánico HyperX Alloy Origins Core TKL Switches HyperX Red RGB Cable Desmontable) → Gaming > Periféricos gaming > Teclados mecánicos
(261, 3), (261, 14), (261, 47),
-- Producto 262 (Teclado Analógico Wooting 60HE+ Switches Lekker Hall Effect Rapid Trigger 60% PBT) → Gaming > Periféricos gaming > Teclados mecánicos
(262, 3), (262, 14), (262, 47),
-- Producto 263 (Teclado Mecánico Económico Redragon K552 Kumara RGB TKL Switches Blue Español) → Gaming > Periféricos gaming > Teclados mecánicos
(263, 3), (263, 14), (263, 47),
-- Producto 264 (Ratón Gamer Inalámbrico Razer DeathAdder V3 Pro Negro Sensor Focus Pro 30K 63 Gramos) → Gaming > Periféricos gaming > Ratones y pads
(264, 3), (264, 14), (264, 48),
-- Producto 265 (Ratón Gamer Inalámbrico Logitech G502 X PLUS RGB LIGHTSPEED Switches Lightforce Híbridos) → Gaming > Periféricos gaming > Ratones y pads
(265, 3), (265, 14), (265, 48),
-- Producto 266 (Ratón Gamer Inalámbrico Razer Viper V3 Pro Blanco 54g Sondeo 8000Hz Inalámbrico Incluido) → Gaming > Periféricos gaming > Ratones y pads
(266, 3), (266, 14), (266, 48),
-- Producto 267 (Ratón Gamer Inalámbrico BenQ ZOWIE EC2-CW Ergonómico para Esports con Receptor Mejorado) → Gaming > Periféricos gaming > Ratones y pads
(267, 3), (267, 14), (267, 48),
-- Producto 268 (Mousepad Gaming de Precisión ARTISAN Ninja FX Hayate Otsu XL Soft Negro Fabricado en Japón) → Gaming > Periféricos gaming > Ratones y pads
(268, 3), (268, 14), (268, 48),
-- Producto 269 (Alfombrilla de Ratón Gigante SteelSeries QcK Heavy XXL 900x400mm Grosor 4mm de Alta Densidad) → Gaming > Periféricos gaming > Ratones y pads
(269, 3), (269, 14), (269, 48),
-- Producto 270 (Ratón Gamer Ultraligero Pulsar X2 V2 Mini Blanco 51g Sensor PixArt PAW3395 Óptico) → Gaming > Periféricos gaming > Ratones y pads
(270, 3), (270, 14), (270, 48),
-- Producto 271 (Sistema de Carga Inalámbrica Continua Logitech G POWERPLAY Mousepad con Alfombrilla de Tela y Rígida) → Gaming > Periféricos gaming > Ratones y pads
(271, 3), (271, 14), (271, 48),
-- Producto 272 (Alfombrilla Híbrida Razer Strider Chroma RGB Tamaño Extendido 900x370mm Resistente al Agua) → Gaming > Periféricos gaming > Ratones y pads
(272, 3), (272, 14), (272, 48),
-- Producto 273 (Auriculares Gamer SteelSeries Arctis Nova Pro Wireless con Cancelación Activa de Ruido y Estación Base DAC) → Gaming > Periféricos gaming > Headsets
(273, 3), (273, 14), (273, 49),
-- Producto 274 (Auriculares Gamer HyperX Cloud III Wireless con Batería de 120 Horas Audio Espacial DTS) → Gaming > Periféricos gaming > Headsets
(274, 3), (274, 14), (274, 49),
-- Producto 275 (Auriculares Gamer Logitech G PRO X 2 LIGHTSPEED con Drivers de Grafeno Inalámbricos Blancos) → Gaming > Periféricos gaming > Headsets
(275, 3), (275, 14), (275, 49),
-- Producto 276 (Auriculares Gamer Razer BlackShark V2 Pro (Edición 2023) Micrófono HyperClear 32kHz 70h Batería) → Gaming > Periféricos gaming > Headsets
(276, 3), (276, 14), (276, 49),
-- Producto 277 (Auriculares Gamer Corsair HS80 MAX Wireless Bluetooth y Dolby Atmos con Almohadillas Transpirables) → Gaming > Periféricos gaming > Headsets
(277, 3), (277, 14), (277, 49),
-- Producto 278 (Auriculares Gamer Cerrados EPOS H6PRO Acústica de Estudio con Cable Jack 3.5mm Verde) → Gaming > Periféricos gaming > Headsets
(278, 3), (278, 14), (278, 49),
-- Producto 279 (Auriculares Gamer ASTRO A50 Gen 4 Inalámbricos con Estación Base de Carga Óptica para Xbox y PC) → Gaming > Periféricos gaming > Headsets
(279, 3), (279, 14), (279, 49),
-- Producto 280 (Auriculares Inalámbricos SteelSeries Arctis Nova 7 Dual Wireless 38h Batería USB-C Multiplataforma) → Gaming > Periféricos gaming > Headsets
(280, 3), (280, 14), (280, 49),
-- Producto 281 (Auriculares Gamer Ultraligeros Razer Kraken X Lite 7.1 Sonido Envolvente 230g Cable Jack 3.5mm) → Gaming > Periféricos gaming > Headsets
(281, 3), (281, 14), (281, 49),
-- Producto 282 (Silla Gamer Ergonómica Secretlab TITAN Evo (Talla XL) Cuero Híbrido PRIME 2.0 Stealth) → Gaming > Sillas y escritorios gaming > Sillas gaming
(282, 3), (282, 15), (282, 50),
-- Producto 283 (Silla Gamer Secretlab TITAN Evo (Talla Regular) Tejido SoftWeave Plus Cookies & Cream) → Gaming > Sillas y escritorios gaming > Sillas gaming
(283, 3), (283, 15), (283, 50),
-- Producto 284 (Silla Gamer noblechairs HERO Black Edition Cuero Híbrido Transpirable Fabricada en Alemania) → Gaming > Sillas y escritorios gaming > Sillas gaming
(284, 3), (284, 15), (284, 50),
-- Producto 285 (Silla Gamer Corsair TC100 RELAXED de Tela Gris Asiento Más Ancho Respaldo Reclinable) → Gaming > Sillas y escritorios gaming > Sillas gaming
(285, 3), (285, 15), (285, 50),
-- Producto 286 (Silla Gamer Razer Iskur V2 con Sistema de Soporte Lumbar Adaptativo Curvo Tejido Gris Oscuro) → Gaming > Sillas y escritorios gaming > Sillas gaming
(286, 3), (286, 15), (286, 50),
-- Producto 287 (Silla Gamer Robusta COUGAR Armor Titan Pro Cuero PVC Ante Gamuza Premium Soporta 160kg) → Gaming > Sillas y escritorios gaming > Sillas gaming
(287, 3), (287, 15), (287, 50),
-- Producto 288 (Silla Gamer Talla Grande AKRacing Masters Series Max Asiento Ancho Marco de Acero 180kg) → Gaming > Sillas y escritorios gaming > Sillas gaming
(288, 3), (288, 15), (288, 50),
-- Producto 289 (Silla Gamer Ergonómica ThunderX3 CORE Loft Tejido Transpirable Soporte Lumbar Multidireccional) → Gaming > Sillas y escritorios gaming > Sillas gaming
(289, 3), (289, 15), (289, 50),
-- Producto 290 (Silla Gamer Newskill Takamikura Carbón Cuero Sintético Reposabrazos 3D Reclinable 180°) → Gaming > Sillas y escritorios gaming > Sillas gaming
(290, 3), (290, 15), (290, 50),
-- Producto 291 (Escritorio Elevable Metálico Secretlab MAGNUS Pro XL 177cm Eléctrico Gestión de Cables Magnética) → Gaming > Sillas y escritorios gaming > Escritorios
(291, 3), (291, 15), (291, 51),
-- Producto 292 (Escritorio Gamer en L Eureka Ergonomic Wing-Shaped 60" Fibra de Carbono con Soporte de Monitor) → Gaming > Sillas y escritorios gaming > Escritorios
(292, 3), (292, 15), (292, 51),
-- Producto 293 (Escritorio Gamer COUGAR Mars Pro 150 con Iluminación RGB y Hub de Conexiones USB 3.0 / USB-C) → Gaming > Sillas y escritorios gaming > Escritorios
(293, 3), (293, 15), (293, 51),
-- Producto 294 (Escritorio Elevable Eléctrico FlexiSpot E7 Pro Doble Motor Tablero Bambú Macizo 160x80cm) → Gaming > Sillas y escritorios gaming > Escritorios
(294, 3), (294, 15), (294, 51),
-- Producto 295 (Escritorio Gamer GIGABYTE AORUS Desk RGB 140cm Alfombrilla Completa y Soporte para Auriculares) → Gaming > Sillas y escritorios gaming > Escritorios
(295, 3), (295, 15), (295, 51),
-- Producto 296 (Escritorio Elevable Eléctrico ThunderX3 ED7 140cm Motor Silencioso Alfombrilla Completa) → Gaming > Sillas y escritorios gaming > Escritorios
(296, 3), (296, 15), (296, 51),
-- Producto 297 (Escritorio Gamer Drift DZ200 Iluminación LED RGB 140x65cm Fibra de Carbono con Bandeja) → Gaming > Sillas y escritorios gaming > Escritorios
(297, 3), (297, 15), (297, 51),
-- Producto 298 (Escritorio Elevable Eléctrico de Esquina SANODESK L-Shaped 3 Motores 180x120cm Negro) → Gaming > Sillas y escritorios gaming > Escritorios
(298, 3), (298, 15), (298, 51),
-- Producto 299 (Escritorio Gamer Mars Gaming MGD 110cm Compacto Fibra de Carbono Soporte de Auriculares) → Gaming > Sillas y escritorios gaming > Escritorios
(299, 3), (299, 15), (299, 51),
-- Producto 300 (Torres de Iluminación Inteligente Corsair iCUE LT100 Starter Kit (2 Torres de 422mm con 92 LEDs)) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(300, 3), (300, 15), (300, 52),
-- Producto 301 (Barras LED Modulares Inteligentes Nanoleaf Lines Smarter Kit (9 Barras con Retroiluminación)) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(301, 3), (301, 15), (301, 52),
-- Producto 302 (Barras de Luz Philips Hue Play Pack Doble Negro Iluminación de Entretenimiento HDMI Sync Ready) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(302, 3), (302, 15), (302, 52),
-- Producto 303 (Paneles LED 3D Modulares Govee Glide Hexa Pro (Pack 10 Paneles) Efecto de Cubo Tridimensional) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(303, 3), (303, 15), (303, 52),
-- Producto 304 (Kit de Tiras LED Inalámbricas Razer Chroma Light Strip Set (3 Tiras RGB con Controlador USB/BT)) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(304, 3), (304, 15), (304, 52),
-- Producto 305 (Barras de Luz Gamer Govee Gaming Light Bars con Cámara Envisual para Monitores de 24" a 32") → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(305, 3), (305, 15), (305, 52),
-- Producto 306 (Lámpara Hexagonal Modular Cololight Pro Kit Piedra (6 Bloques LED RGB) Base de Mármol) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(306, 3), (306, 15), (306, 52),
-- Producto 307 (Kit de Tiras LED Inteligentes para Monitor Corsair iCUE LS100 Smart Lighting Strip (Pantallas hasta 27")) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(307, 3), (307, 15), (307, 52),
-- Producto 308 (Barra de Luz para Monitor Yeelight Smart Bar Pro con Luz Frontal y RGB Trasera Sincronizable con Razer Chroma) → Gaming > Sillas y escritorios gaming > Ilumincación RGB
(308, 3), (308, 15), (308, 52),
-- Producto 309 (Cámara DSLR Canon EOS 90D Solo Cuerpo Sensor APS-C de 32.5 MP Grabación 4K sin Recorte) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(309, 4), (309, 16), (309, 53),
-- Producto 310 (Cámara DSLR Nikon D7500 Kit con Lente AF-S DX NIKKOR 18-140mm f/3.5-5.6G ED VR) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(310, 4), (310, 16), (310, 53),
-- Producto 311 (Cámara DSLR Profesional Full Frame Canon EOS 5D Mark IV Solo Cuerpo 30.4 MP Dual Pixel RAW) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(311, 4), (311, 16), (311, 53),
-- Producto 312 (Cámara DSLR Full Frame Nikon D850 Solo Cuerpo 45.7 MP Sensor BSI Grabación 4K UHD) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(312, 4), (312, 16), (312, 53),
-- Producto 313 (Cámara DSLR Canon EOS Rebel T8i (850D) Kit con Lente EF-S 18-55mm IS STM) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(313, 4), (313, 16), (313, 53),
-- Producto 314 (Cámara DSLR Deportiva Profesional Nikon D6 Solo Cuerpo 20.8 MP Enfoque de 105 Puntos en Cruz) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(314, 4), (314, 16), (314, 53),
-- Producto 315 (Cámara DSLR Pentax K-3 Mark III Solo Cuerpo Negro Sensor BSI 25.7 MP Estabilizador en Cuerpo IBIS) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(315, 4), (315, 16), (315, 53),
-- Producto 316 (Cámara DSLR Full Frame Canon EOS 6D Mark II Solo Cuerpo 26.2 MP Pantalla Táctil Articulada) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(316, 4), (316, 16), (316, 53),
-- Producto 317 (Cámara DSLR Nikon D3500 Kit con Lente AF-P DX NIKKOR 18-55mm f/3.5-5.6G VR Modo Guía) → Audio, Video y Foto > Fotografía y video > Cámaras DSLR
(317, 4), (317, 16), (317, 53),
-- Producto 318 (Cámara Mirrorless Full Frame Sony Alpha 7R V Solo Cuerpo 61 MP con Unidad de Procesamiento por IA) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(318, 4), (318, 16), (318, 54),
-- Producto 319 (Cámara Mirrorless Full Frame Canon EOS R5 Mark II Solo Cuerpo 45 MP Video 8K 60p RAW Eye Control AF) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(319, 4), (319, 16), (319, 54),
-- Producto 320 (Cámara Mirrorless Full Frame Nikon Z8 Solo Cuerpo 45.7 MP Video 8K 60p N-RAW Sin Obturador Mecánico) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(320, 4), (320, 16), (320, 54),
-- Producto 321 (Cámara Mirrorless APS-C Fujifilm X-T5 Solo Cuerpo Plata 40.2 MP Simulación de Película Diales Clásicos) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(321, 4), (321, 16), (321, 54),
-- Producto 322 (Cámara Mirrorless para Vlogging y Creadores Sony ZV-E10 II Kit Lente 16-50mm f/3.5-5.6 OSS II) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(322, 4), (322, 16), (322, 54),
-- Producto 323 (Cámara Mirrorless Micro Cuatro Tercios Panasonic Lumix GH7 25.2 MP Grabación Interna ProRes RAW HQ) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(323, 4), (323, 16), (323, 54),
-- Producto 324 (Cámara Mirrorless Full Frame Compacta Canon EOS R8 Solo Cuerpo 24.2 MP Video 4K 60p 10-bit) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(324, 4), (324, 16), (324, 54),
-- Producto 325 (Cámara de Cine Profesional Sony FX3 Cinema Line Full Frame 4K 120p con Mango XLR Incluido) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(325, 4), (325, 16), (325, 54),
-- Producto 326 (Cámara Mirrorless OM System OM-1 Mark II Micro Cuatro Tercios 20.4 MP Disparo a 120 fps Live GND) → Audio, Video y Foto > Fotografía y video > Cámaras Mirrorless
(326, 4), (326, 16), (326, 54),
-- Producto 327 (Drone DJI Mini 4 Pro Fly More Combo con Control Remoto DJI RC 2 Pantalla FHD 249g Detección Omnidireccional) → Audio, Video y Foto > Fotografía y video > Drones
(327, 4), (327, 16), (327, 55),
-- Producto 328 (Drone DJI Air 3 Fly More Combo con Control DJI RC 2 Doble Cámara Principal 4K HDR 46min) → Audio, Video y Foto > Fotografía y video > Drones
(328, 4), (328, 16), (328, 55),
-- Producto 329 (Drone Cinematográfico DJI Mavic 3 Pro Cine Premium Combo Triple Cámara Hasselblad Apple ProRes SSD 1TB) → Audio, Video y Foto > Fotografía y video > Drones
(329, 4), (329, 16), (329, 55),
-- Producto 330 (Drone FPV DJI Avata 2 Fly More Combo con Goggles 3 y RC Motion 3 Protectores Integrados) → Audio, Video y Foto > Fotografía y video > Drones
(330, 4), (330, 16), (330, 55),
-- Producto 331 (Drone Autel Robotics EVO Lite+ Premium Bundle Cámara con Sensor de 1" 6K 40min Vuelo Naranja) → Audio, Video y Foto > Fotografía y video > Drones
(331, 4), (331, 16), (331, 55),
-- Producto 332 (Drone DJI Mini 2 SE Fly More Combo 249g Video 2.7K Gimbal 3 Ejes 31min Vuelo 10km) → Audio, Video y Foto > Fotografía y video > Drones
(332, 4), (332, 16), (332, 55),
-- Producto 333 (Kit Drone de Carreras FPV BETAFPV Cetus Pro RTF con Gafas VR Mando y 2 Baterías para Principiantes) → Audio, Video y Foto > Fotografía y video > Drones
(333, 4), (333, 16), (333, 55),
-- Producto 334 (Drone Profesional DJI Mavic 3 Classic con Control DJI RC Sensor Hasselblad 4/3 5.1K 46min) → Audio, Video y Foto > Fotografía y video > Drones
(334, 4), (334, 16), (334, 55),
-- Producto 335 (Drone Ultraligero Autel EVO Nano+ 249g Sensor 1/1.28" RYYB f/1.9 Enfoque PDAF Naranja) → Audio, Video y Foto > Fotografía y video > Drones
(335, 4), (335, 16), (335, 55),
-- Producto 336 (Estabilizador Gimbal DJI RS 4 Pro Combo con Motor Focus Pro y Transmisor de Video para Cámaras de Cine) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(336, 4), (336, 16), (336, 56),
-- Producto 337 (Trípode de Viaje Manfrotto Befree Advanced de Aluminio con Rótula de Bola 494 Palanca QPL Travel) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(337, 4), (337, 16), (337, 56),
-- Producto 338 (Correa Profesional para Cámara Peak Design Slide Lite Negra con Conectores Anchor Links Rápidos) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(338, 4), (338, 16), (338, 56),
-- Producto 339 (Flash de Cabeza Redonda Godox V1Pro Batería de Litio Luz de Modelado LED y Subflash SU-1) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(339, 4), (339, 16), (339, 56),
-- Producto 340 (Tarjeta SDXC SanDisk Extreme PRO 128GB UHS-II V90 (300 MB/s) para Video 8K y 4K RAW Cine) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(340, 4), (340, 16), (340, 56),
-- Producto 341 (Mochila Profesional para Fotografía Lowepro ProTactic BP 450 AW II Modular con Acceso en 4 Puntos) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(341, 4), (341, 16), (341, 56),
-- Producto 342 (Filtro Polarizador Circular CPL K&F Concept Nano-X True Color 82mm Recubrimiento de Titanio Sin Tinte) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(342, 4), (342, 16), (342, 56),
-- Producto 343 (Luz Continua de Estudio Aputure Amaran 200x S Bi-Color 200W Montura Bowens CRI 95+ Control por App) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(343, 4), (343, 16), (343, 56),
-- Producto 344 (Monitor Grabador de Campo Atomos Ninja 5.2" 1000 nits HDR ProRes RAW HDMI 4K 60p) → Audio, Video y Foto > Fotografía y video > Accesorios foto
(344, 4), (344, 16), (344, 56),
-- Producto 345 (Auriculares Inalámbricos TWS Sony WF-1000XM5 Cancelación de Ruido Líder con Procesador V2 y QN2e) → Audio, Video y Foto > Audio > Auriculares y TWS
(345, 4), (345, 17), (345, 57),
-- Producto 346 (Auriculares Inalámbricos Apple AirPods Pro 2da Generación con Estuche MagSafe USB-C Chip H2) → Audio, Video y Foto > Audio > Auriculares y TWS
(346, 4), (346, 17), (346, 57),
-- Producto 347 (Auriculares TWS Bose QuietComfort Ultra Earbuds Audio Inmersivo y Cancelación de Ruido de Clase Mundial) → Audio, Video y Foto > Audio > Auriculares y TWS
(347, 4), (347, 17), (347, 57),
-- Producto 348 (Auriculares TWS Sennheiser Momentum True Wireless 4 Snapdragon Sound y Auracast Sonido Audiófilo) → Audio, Video y Foto > Audio > Auriculares y TWS
(348, 4), (348, 17), (348, 57),
-- Producto 349 (Auriculares TWS Samsung Galaxy Buds2 Pro Grafito Audio 24-bit Hi-Fi Cancelación Inteligente IPX7) → Audio, Video y Foto > Audio > Auriculares y TWS
(349, 4), (349, 17), (349, 57),
-- Producto 350 (Auriculares TWS Nothing Ear (2024) Blanco Diseño Transparente Driver Cerámico de 11mm LDAC) → Audio, Video y Foto > Audio > Auriculares y TWS
(350, 4), (350, 17), (350, 57),
-- Producto 351 (Auriculares TWS JBL Tour Pro 2 con Pantalla Táctil a Color en el Estuche Inteligente de Carga) → Audio, Video y Foto > Audio > Auriculares y TWS
(351, 4), (351, 17), (351, 57),
-- Producto 352 (Auriculares TWS Anker Soundcore Liberty 4 NC Cancelación de Ruido del 98.5% LDAC Batería 50h) → Audio, Video y Foto > Audio > Auriculares y TWS
(352, 4), (352, 17), (352, 57),
-- Producto 353 (Auriculares TWS Beats Studio Buds + Edición Especial Transparente Cancelación Activa Compatible iOS/Android) → Audio, Video y Foto > Audio > Auriculares y TWS
(353, 4), (353, 17), (353, 57),
-- Producto 354 (Barra de Sonido Inteligente Sonos Arc Dolby Atmos 11 Altavoces con Calibración Trueplay Negra) → Audio, Video y Foto > Audio > Altavoces y soundbars
(354, 4), (354, 17), (354, 58),
-- Producto 355 (Barra de Sonido JBL Bar 1300X 11.1.4 Canales 1170W Altavoces Traseros Inalámbricos Desmontables y Subwoofer 12") → Audio, Video y Foto > Audio > Altavoces y soundbars
(355, 4), (355, 17), (355, 58),
-- Producto 356 (Barra de Sonido Bose Smart Ultra Soundbar con Dolby Atmos y Modo de Diálogo por IA) → Audio, Video y Foto > Audio > Altavoces y soundbars
(356, 4), (356, 17), (356, 58),
-- Producto 357 (Altavoz Bluetooth para Hogar Marshall Stanmore III Negro Diseño Clásico Amplificadores Clase D) → Audio, Video y Foto > Audio > Altavoces y soundbars
(357, 4), (357, 17), (357, 58),
-- Producto 358 (Altavoz Portátil para Fiestas JBL Boombox 3 Wi-Fi y Bluetooth Audio HD Dolby Atmos Subwoofer Integrado) → Audio, Video y Foto > Audio > Altavoces y soundbars
(358, 4), (358, 17), (358, 58),
-- Producto 359 (Altavoz Inteligente Sonos Era 300 con Audio Espacial Dolby Atmos 6 Drivers WiFi y Bluetooth) → Audio, Video y Foto > Audio > Altavoces y soundbars
(359, 4), (359, 17), (359, 58),
-- Producto 360 (Barra de Sonido Samsung Q-Series HW-Q990D 11.1.4 Canales Dolby Atmos Inalámbrico Q-Symphony HDMI 2.1) → Audio, Video y Foto > Audio > Altavoces y soundbars
(360, 4), (360, 17), (360, 58),
-- Producto 361 (Altavoz Bluetooth Portátil Ultimate Ears HYPERBOOM Graves Masivos Ecualizador Adaptativo IPX4) → Audio, Video y Foto > Audio > Altavoces y soundbars
(361, 4), (361, 17), (361, 58),
-- Producto 362 (Altavoz Portátil Premium Sonos Move 2 Sonido Estéreo 24 Horas de Batería WiFi Bluetooth IP56) → Audio, Video y Foto > Audio > Altavoces y soundbars
(362, 4), (362, 17), (362, 58),
-- Producto 363 (Micrófono Dinámico de Estudio Shure SM7B Cardioide para Podcast, Streaming y Grabación Profesional) → Audio, Video y Foto > Audio > Micrófonos
(363, 4), (363, 17), (363, 59),
-- Producto 364 (Micrófono Dinámico para Creadores Rode PodMic USB y XLR con DSP Interno Aphex y Salida de Auriculares) → Audio, Video y Foto > Audio > Micrófonos
(364, 4), (364, 17), (364, 59),
-- Producto 365 (Micrófono de Condensador USB Elgato Wave:3 Blanco 24-bit/96kHz con Tecnología Clipguard Anti-Distorsión) → Audio, Video y Foto > Audio > Micrófonos
(365, 4), (365, 17), (365, 59),
-- Producto 366 (Micrófono de Condensador USB HyperX QuadCast S con Iluminación RGB y Montura Antivibración Shock Mount) → Audio, Video y Foto > Audio > Micrófonos
(366, 4), (366, 17), (366, 59),
-- Producto 367 (Sistema de Micrófonos Inalámbricos Compactos Rode Wireless PRO Doble Canal Grabación 32-bit Float y Timecode) → Audio, Video y Foto > Audio > Micrófonos
(367, 4), (367, 17), (367, 59),
-- Producto 368 (Micrófono USB Profesional Blue Yeti X con Medidor LED de 11 Segmentos y Efectos Vocales Blue VO!CE) → Audio, Video y Foto > Audio > Micrófonos
(368, 4), (368, 17), (368, 59),
-- Producto 369 (Micrófono de Condensador Cardioide Audio-Technica AT2020USB-X Grabación 24-bit/96kHz Salida Auriculares) → Audio, Video y Foto > Audio > Micrófonos
(369, 4), (369, 17), (369, 59),
-- Producto 370 (Micrófono USB-C Sennheiser Profile Streaming Set con Brazo Articulado de Mesa Premium) → Audio, Video y Foto > Audio > Micrófonos
(370, 4), (370, 17), (370, 59),
-- Producto 371 (Micrófono Inalámbrico Autónomo DJI Mic 2 Transmisor Individual Negro Grabación Interna 32-bit Float) → Audio, Video y Foto > Audio > Micrófonos
(371, 4), (371, 17), (371, 59),
-- Producto 372 (Smart TV LG OLED evo 65" G4 4K 144Hz Procesador Alpha 11 con IA Panel con Disipador Térmico y Brillo Máximo) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(372, 4), (372, 18), (372, 60),
-- Producto 373 (Smart TV Samsung OLED 65" S90D 4K 144Hz Procesador NQ4 AI Gen2 Pantalla Glare-Free Gaming Hub) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(373, 4), (373, 18), (373, 60),
-- Producto 374 (Smart TV Sony BRAVIA 9 65" 4K Mini LED HDR XR Backlight Master Drive Google TV) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(374, 4), (374, 18), (374, 60),
-- Producto 375 (Smart TV TCL 65" QM8 4K QD-Mini LED 5000 nits 144Hz Panel Antirreflejos Google TV) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(375, 4), (375, 18), (375, 60),
-- Producto 376 (Smart TV Hisense 65" U8N Mini-LED ULED 4K 3000 nits 144Hz Dolby Vision IQ Google TV) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(376, 4), (376, 18), (376, 60),
-- Producto 377 (Smart TV LG OLED evo 55" C4 4K 144Hz Procesador Alpha 9 Gen7 Dolby Vision Gaming 4x HDMI 2.1) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(377, 4), (377, 18), (377, 60),
-- Producto 378 (Smart TV Samsung Neo QLED 55" QN90D 4K 144Hz Quantum Matrix Mini LED Procesador NQ4 AI) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(378, 4), (378, 18), (378, 60),
-- Producto 379 (Smart TV TCL 55" C755 4K QD-Mini LED 144Hz VRR Subwoofer Onkyo Integrado Google TV) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(379, 4), (379, 18), (379, 60),
-- Producto 380 (Smart TV Philips 65" OLED 4K 120Hz con Iluminación Ambilight en 3 Lados Procesador P5 con IA) → Audio, Video y Foto > Televisores y proyectores > Smart TV
(380, 4), (380, 18), (380, 60),
-- Producto 381 (Proyector Láser y LED Híbrido 4K XGIMI Horizon Ultra 2300 lúmenes ISO Dolby Vision Android TV) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(381, 4), (381, 18), (381, 61),
-- Producto 382 (Proyector Gamer 4K HDR BenQ X3100i 3300 lúmenes ANSI 100% DCI-P3 4.16ms Latencia Ultra Baja) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(382, 4), (382, 18), (382, 61),
-- Producto 383 (Proyector Portátil Inteligente Samsung The Freestyle 2da Gen Full HD Giro 180° Gaming Hub Integrado) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(383, 4), (383, 18), (383, 61),
-- Producto 384 (Proyector Láser Compacto Epson EpiqVision Mini EF-12 Full HD 3LCD Sonido Yamaha Android TV) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(384, 4), (384, 18), (384, 61),
-- Producto 385 (Proyector para Exteriores Anker Nebula Mars 3 1000 lúmenes ANSI Batería 5 Horas Camping Resistente IPX3) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(385, 4), (385, 18), (385, 61),
-- Producto 386 (Proyector Láser 4K Dangbei Mars Pro 3200 lúmenes ANSI ALPD Láser de Cine Altavoces Duales 10W) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(386, 4), (386, 18), (386, 61),
-- Producto 387 (Proyector Láser Tiro Ultracorto 4K AWOL Vision LTV-3000 Pro Triple Láser 3000 lúmenes Dolby Vision) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(387, 4), (387, 18), (387, 61),
-- Producto 388 (Proyector Portátil con Batería XGIMI Halo+ 900 lúmenes ANSI Full HD 1080p Harman Kardon Android TV) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(388, 4), (388, 18), (388, 61),
-- Producto 389 (Proyector para Cine y Juegos ViewSonic PX701-4K 3200 lúmenes ANSI 4.2ms HDR 1080p 240Hz) → Audio, Video y Foto > Televisores y proyectores > Proyectores
(389, 4), (389, 18), (389, 61),
-- Producto 390 (Soporte de Pared Premium Sanus Advanced Full-Motion para Televisores de 42" a 90" Extensión de 71cm) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(390, 4), (390, 18), (390, 62),
-- Producto 391 (Cable HDMI 2.1 Ultra High Speed AudioQuest Cinnamon 48Gbps 8K-10K eARC Plata al 1.25% (2 Metros)) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(391, 4), (391, 18), (391, 62),
-- Producto 392 (Soporte Fijo Ultrafino Vogel's THIN 505 para Televisores de 40" a 85" Separación de solo 15mm de la Pared) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(392, 4), (392, 18), (392, 62),
-- Producto 393 (Caja de Sincronización HDMI Philips Hue Play HDMI Sync Box 4K 60Hz HDR10+ y Dolby Vision) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(393, 4), (393, 18), (393, 62),
-- Producto 394 (Kit de Limpieza Profesional para Pantallas OLED, TV y Lentes K&F Concept con Fórmula Antiestática) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(394, 4), (394, 18), (394, 62),
-- Producto 395 (Cable HDMI 2.1 Belkin Ultra HD High Speed 4K/120Hz 8K/60Hz 48Gbps 2 Metros Certificado HDMI Forum) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(395, 4), (395, 18), (395, 62),
-- Producto 396 (Controlador Universal Infrarrojos y WiFi Logitech Harmony Hub para Equipos de Audio y Video) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(396, 4), (396, 18), (396, 62),
-- Producto 397 (Soporte para Barra de Sonido Extensible Sanus que se Acopla al Soporte del Televisor (Hasta 6.8kg)) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(397, 4), (397, 18), (397, 62),
-- Producto 398 (Kit Completo de Gestión y Ocultación de Cables para TV y Teatro en Casa SOULWIT (150 Piezas)) → Audio, Video y Foto > Televisores y proyectores > Accesorios AV
(398, 4), (398, 18), (398, 62),
-- Producto 399 (Altavoz Inteligente Amazon Echo Studio con Audio Espacial Dolby Atmos Blanco Glaciar) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(399, 5), (399, 19), (399, 63),
-- Producto 400 (Altavoz Inteligente Apple HomePod mini Amarillo Sonido 360° Chip S5 Siri y Sensor de Temperatura) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(400, 5), (400, 19), (400, 63),
-- Producto 401 (Altavoz Inteligente con Reloj Amazon Echo Dot 5ta Generación Pantalla LED Azul Marino con Alexa) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(401, 5), (401, 19), (401, 63),
-- Producto 402 (Altavoz Inteligente Google Nest Audio Carbón Graves Enriquecidos con Asistente de Google) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(402, 5), (402, 19), (402, 63),
-- Producto 403 (Altavoz Inteligente Sonos Era 100 Blanco Acústica Estéreo de Próxima Generación WiFi y Bluetooth) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(403, 5), (403, 19), (403, 63),
-- Producto 404 (Altavoz Inteligente Compacto Amazon Echo Pop Lavanda con Sonido Direccional y Alexa) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(404, 5), (404, 19), (404, 63),
-- Producto 405 (Altavoz Inteligente Google Nest Mini 2da Gen Tiza con Montura de Pared Integrada) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(405, 5), (405, 19), (405, 63),
-- Producto 406 (Altavoz Inteligente Esférico Amazon Echo 4ta Generación Sonido Premium Dolby Hub Zigbee) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(406, 5), (406, 19), (406, 63),
-- Producto 407 (Altavoz Inteligente Xiaomi Smart Speaker con Reloj LED y Control Infrarrojo de Electrodomésticos) → Hogar Inteligente > Asistentes y hubs > Altavoces inteligentes
(407, 5), (407, 19), (407, 63),
-- Producto 408 (Hub Domótico Multiusos Aqara Hub M3 con Soporte Matter, Thread, Zigbee 3.0 y Emisor IR de 360°) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(408, 5), (408, 19), (408, 64),
-- Producto 409 (Puente de Conexión Inteligente Philips Hue Bridge 2.0 Zigbee y Compatible con Apple HomeKit) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(409, 5), (409, 19), (409, 64),
-- Producto 410 (Hub Domótico Universal Homey Bridge Soporta Zigbee, Z-Wave Plus, Bluetooth, 433MHz e Infrarrojos) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(410, 5), (410, 19), (410, 64),
-- Producto 411 (Hub Domótico Samsung SmartThings Station con Cargador Inalámbrico Rápido de 15W Integrado) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(411, 5), (411, 19), (411, 64),
-- Producto 412 (Panel de Control Táctil de Pared SONOFF NSPanel Pro Pantalla de 3.95" Hub Zigbee 3.0 Blanco) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(412, 5), (412, 19), (412, 64),
-- Producto 413 (Hub Domótico Aeotec Smart Home Hub Funciona como SmartThings Hub Z-Wave Plus y Zigbee) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(413, 5), (413, 19), (413, 64),
-- Producto 414 (Hub Domótico SwitchBot Hub 2 Pantalla LED Termohigrómetro Emisor IR y Soporte Matter) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(414, 5), (414, 19), (414, 64),
-- Producto 415 (Controlador Universal Remoto BroadLink RM4 Pro Infrarrojos 360° y Radiofrecuencia 433/315MHz) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(415, 5), (415, 19), (415, 64),
-- Producto 416 (Mini Hub Zigbee 3.0 Aqara Hub E1 Formato Pendrive USB con Repetidor WiFi Integrado) → Hogar Inteligente > Asistentes y hubs > Hubs domótica
(416, 5), (416, 19), (416, 64),
-- Producto 417 (Pantalla Inteligente Amazon Echo Show 15 con Fire TV Integrado Full HD 15.6" y Mando por Voz Alexa) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(417, 5), (417, 19), (417, 65),
-- Producto 418 (Pantalla Inteligente Google Nest Hub Max 10" HD con Cámara Nest Cam Integrada y Audio Estéreo) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(418, 5), (418, 19), (418, 65),
-- Producto 419 (Pantalla Inteligente Amazon Echo Show 8 (3ra Generación - 2023) Audio Espacial y Hub Smart Home) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(419, 5), (419, 19), (419, 65),
-- Producto 420 (Pantalla Inteligente Motorizada Amazon Echo Show 10 3ra Gen Pantalla HD de 10.1" con Movimiento Automático) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(420, 5), (420, 19), (420, 65),
-- Producto 421 (Pantalla Inteligente Compacta Amazon Echo Show 5 (3ra Generación) Pantalla 5.5" Blanco) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(421, 5), (421, 19), (421, 65),
-- Producto 422 (Reloj Despertador Inteligente Xiaomi Mi Smart Clock Pantalla Táctil 4" con Google Assistant) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(422, 5), (422, 19), (422, 65),
-- Producto 423 (Reloj Inteligente Lenovo Smart Clock Essential con Alexa Pantalla LED Grande y Luz Nocturna) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(423, 5), (423, 19), (423, 65),
-- Producto 424 (Soporte Ajustable con Inclinación y Giro para Pantalla Inteligente Amazon Echo Show 8 Blanco) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(424, 5), (424, 19), (424, 65),
-- Producto 425 (Soporte de Sobremesa Oficial con Cable de Alimentación de 3 Metros para Google Nest Cam Interior/Exterior) → Hogar Inteligente > Asistentes y hubs > Pantallas Inteligentes
(425, 5), (425, 19), (425, 65),
-- Producto 426 (Kit Cámaras de Seguridad 4K Inalámbricas eufyCam S330 (eufyCam 3) Pack 2 Cámaras + HomeBase 3 Solar) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(426, 5), (426, 20), (426, 66),
-- Producto 427 (Cámara de Seguridad Ring Stick Up Cam Pro a Batería Video HDR Detección de Movimiento 3D por Radar) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(427, 5), (427, 20), (427, 66),
-- Producto 428 (Cámara IP de Exterior Pan/Tilt 2K QHD TP-Link Tapo C520WS Visión Nocturna a Color Starlight 360°) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(428, 5), (428, 20), (428, 66),
-- Producto 429 (Cámara de Seguridad Inalámbrica Arlo Pro 5S 2K HDR Visión Nocturna Color Foco Integrado WiFi Dual) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(429, 5), (429, 20), (429, 66),
-- Producto 430 (Cámara Inteligente y Hub Zigbee Aqara Camera Hub G3 2K 360° Reconocimiento Facial y Gestos por IA) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(430, 5), (430, 20), (430, 66),
-- Producto 431 (Cámara Solar de Doble Lente Reolink Argus Track 4K con Zoom Híbrido 6X y Seguimiento Automático) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(431, 5), (431, 20), (431, 66),
-- Producto 432 (Cámara de Seguridad Interior Pan/Tilt 2K QHD TP-Link Tapo C225 con Obturador Físico de Privacidad) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(432, 5), (432, 20), (432, 66),
-- Producto 433 (Cámara Interior Giratoria 2K eufy Security Indoor Cam E220 Pan & Tilt con Seguimiento y HomeKit) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(433, 5), (433, 20), (433, 66),
-- Producto 434 (Cámara de Interior Compacta Ring Indoor Cam (2da Generación) Enchufable con Tapa de Privacidad) → Hogar Inteligente > Seguridad del hogar > Cámaras IP
(434, 5), (434, 20), (434, 66),
-- Producto 435 (Sistema de Seguridad Integral para Hogar Ring Alarm Kit de 8 Piezas (2da Generación) con Teclado y Sirena) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(435, 5), (435, 20), (435, 67),
-- Producto 436 (Sensor Inteligente de Puertas y Ventanas Aqara Sensor P2 con Protocolo Matter sobre Thread (Sin Hub)) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(436, 5), (436, 20), (436, 67),
-- Producto 437 (Sensor de Movimiento de Exterior Philips Hue Outdoor Sensor Inalámbrico Resistente al Agua IP54) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(437, 5), (437, 20), (437, 67),
-- Producto 438 (Detector de Fugas de Agua Inteligente Eve Water Guard con Sirena de 100dB Cable Sensor de 2m y Apple Home) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(438, 5), (438, 20), (438, 67),
-- Producto 439 (Sensor de Movimiento y Luz Aqara Motion Sensor P1 Batería de 5 Años Ángulo de 170 Grados Zigbee 3.0) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(439, 5), (439, 20), (439, 67),
-- Producto 440 (Detector de Humo Óptico y Temperatura Ultracompacto FIBARO Smoke Sensor Z-Wave Plus) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(440, 5), (440, 20), (440, 67),
-- Producto 441 (Sensor Inteligente de Apertura de Puertas y Ventanas TP-Link Tapo T110 Tamaño Miniatura) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(441, 5), (441, 20), (441, 67),
-- Producto 442 (Sensor de Presencia Humana por Radar de Ondas Milimétricas Aqara FP2 Detección de Caídas y Posición) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(442, 5), (442, 20), (442, 67),
-- Producto 443 (Sensor de Inundación y Temperatura WiFi Shelly Flood con Alarma Acústica Sin Necesidad de Hub) → Hogar Inteligente > Seguridad del hogar > Alarmas y sensores
(443, 5), (443, 20), (443, 67),
-- Producto 444 (Cerradura Inteligente Nuki Smart Lock Ultra Motor Brushless sin Escobillas Carga Rápida Matter sobre Thread) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(444, 5), (444, 20), (444, 68),
-- Producto 445 (Cerradura Inteligente con Cerrojo Yale Assure Lock 2 Touch Lector de Huellas Dactilares y Teclado Negro) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(445, 5), (445, 20), (445, 68),
-- Producto 446 (Cerradura Inteligente Aqara Smart Lock U100 con Apple Home Key (Desbloqueo con iPhone y Apple Watch)) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(446, 5), (446, 20), (446, 68),
-- Producto 447 (Cerradura de Seguridad con Cerrojo Schlage Encode Plus Apple Home Key WiFi Integrado Acero Níquel Satinado) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(447, 5), (447, 20), (447, 68),
-- Producto 448 (Cerradura Inteligente 6 en 1 Ultraloq U-Bolt Pro WiFi con Huella Dactilar Teclado Antiespía y Auto-Unlock) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(448, 5), (448, 20), (448, 68),
-- Producto 449 (Kit Cerradura Inteligente SwitchBot Lock Ultra con Teclado Biométrico Keypad Touch Sin Modificar Cilindro) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(449, 5), (449, 20), (449, 68),
-- Producto 450 (Teclado Numérico Inalámbrico con Lector de Huellas Dactilares Nuki Keypad 2.0 para Cerraduras Nuki) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(450, 5), (450, 20), (450, 68),
-- Producto 451 (Cerradura Inteligente con Manilla Lockly Secure Plus Teclado Digital Patentado PIN Genie y Sensor 3D) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(451, 5), (451, 20), (451, 68),
-- Producto 452 (Cerradura Motorizada Yale Linus Smart Lock L2 con WiFi Integrado Batería Recargable Silenciosa) → Hogar Inteligente > Seguridad del hogar > Cerraduras Inteligentes
(452, 5), (452, 20), (452, 68),
-- Producto 453 (Kit de Inicio Philips Hue White and Color Ambiance 3 Bombillas LED E27 + Puente Hue Bridge + Interruptor Smart) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(453, 5), (453, 21), (453, 69),
-- Producto 454 (Paneles LED Triangulares Inteligentes Nanoleaf Shapes Triangles Starter Kit (9 Paneles) Táctiles y Rhythm) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(454, 5), (454, 21), (454, 69),
-- Producto 455 (Lámpara de Pie Inteligente Govee Floor Lamp Pro 170cm Altavoz Bluetooth Integrado y Efectos RGBIC) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(455, 5), (455, 21), (455, 69),
-- Producto 456 (Tira LED Philips Hue Gradient Lightstrip 2 Metros Mezcla Gradual de Múltiples Colores Simultáneos) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(456, 5), (456, 21), (456, 69),
-- Producto 457 (Plafón LED de Techo Inteligente Aqara Ceiling Light T1M 50cm Luz Principal Blanca + Anillo RGB Exterior) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(457, 5), (457, 21), (457, 69),
-- Producto 458 (Barras de Luz Modulares de Pared LIFX Beam Seamless Kit (6 Barras + 1 Esquina) WiFi Sin Hub 1200lm) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(458, 5), (458, 21), (458, 69),
-- Producto 459 (Bombillas Inteligentes Wi-Fi Multicolor TP-Link Tapo L530E E27 806 lúmenes (Pack 4 Unidades) Sin Hub) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(459, 5), (459, 21), (459, 69),
-- Producto 460 (Barras de Luz LED Modulares WiZ Bar Pack Doble Blancas y Color con Tecnología SpaceSense) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(460, 5), (460, 21), (460, 69),
-- Producto 461 (Lámpara de Mesa Portátil con Batería Philips Hue Go V2 Blanca Bluetooth y Zigbee para Interiores y Terrazas) → Hogar Inteligente > Electrodomésticos smart > Iluminación Inteligente
(461, 5), (461, 21), (461, 69),
-- Producto 462 (Robot Aspirador y Fregasuelos Roborock S8 MaxV Ultra con Base Todo en Uno Lavado de Mopa con Agua Caliente a 60°C) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(462, 5), (462, 21), (462, 70),
-- Producto 463 (Robot Aspirador Cuadrado ECOVACS DEEBOT X2 OMNI 8000Pa Perfil Ultrafino de 9.5cm y Doble Mopa Giratoria) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(463, 5), (463, 21), (463, 70),
-- Producto 464 (Robot Aspirador y Trapeador Dreame L20 Ultra Complete MopExtend Inteligente 7000Pa y Extracción de Mopas) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(464, 5), (464, 21), (464, 70),
-- Producto 465 (Robot Aspirador y Fregador iRobot Roomba Combo j9+ con Base Clean Base de Madera y Detección de Mascotas) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(465, 5), (465, 21), (465, 70),
-- Producto 466 (Robot Aspirador Roborock Q Revo MaxV 7000Pa Fregado con Mopa Extensible y Asistente por Voz 'Hello Rocky') → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(466, 5), (466, 21), (466, 70),
-- Producto 467 (Robot Aspirador Xiaomi Robot Vacuum X10+ con Estación Todo en Uno 4000Pa Navegación Láser LDS) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(467, 5), (467, 21), (467, 70),
-- Producto 468 (Robot Aspirador iRobot Roomba j7+ con Base de Autovaciado Clean Base y Detección de Cables por IA) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(468, 5), (468, 21), (468, 70),
-- Producto 469 (Robot Aspirador y Trapeador Dreame D10 Plus 4000Pa Base de Autovaciado de 2.5L Láser LiDAR) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(469, 5), (469, 21), (469, 70),
-- Producto 470 (Robot Aspirador Compacto Lefant M210 Pro 2200Pa Altura de 7.6cm Especial para Pelos de Animales) → Hogar Inteligente > Electrodomésticos smart > Robots aspiradores
(470, 5), (470, 21), (470, 70),
-- Producto 471 (Termostato Inteligente Nest Learning Thermostat 3ra Generación Acero Inoxidable con Pantalla Farsight) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(471, 5), (471, 21), (471, 71),
-- Producto 472 (Termostato Inteligente ecobee Smart Thermostat Premium con Sensor Remoto SmartSensor y Monitor de Aire) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(472, 5), (472, 21), (472, 71),
-- Producto 473 (Kit de Inicio Termostato Inteligente Inalámbrico tado° V3+ con Puente Bridge y Geolocalización) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(473, 5), (473, 21), (473, 71),
-- Producto 474 (Enchufe Inteligente Eve Energy con Medidor de Consumo Eléctrico Matter sobre Thread (Pack 1 Unidad)) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(474, 5), (474, 21), (474, 71),
-- Producto 475 (Enchufes Inteligentes TP-Link Tapo P110M Matter con Monitor de Energía en Tiempo Real (Pack 4 Unidades)) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(475, 5), (475, 21), (475, 71),
-- Producto 476 (Enchufe Inteligente Compacto Philips Hue Smart Plug Zigbee y Bluetooth Blanco) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(476, 5), (476, 21), (476, 71),
-- Producto 477 (Enchufe Inteligente Doble para Pared Meross con Control Independiente de 2 Salidas Compatible HomeKit) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(477, 5), (477, 21), (477, 71),
-- Producto 478 (Relé Inteligente Empotrable para Interruptor Shelly Plus 1PM con Medidor de Potencia WiFi y Bluetooth) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(478, 5), (478, 21), (478, 71),
-- Producto 479 (Cabezal Termostático Inteligente para Radiador tado° Add-on Control Individual de Cada Habitación) → Hogar Inteligente > Electrodomésticos smart > Enchufes y termostatos
(479, 5), (479, 21), (479, 71),
-- Producto 480 (Router Wi-Fi 6 ASUS ROG Rapture GT-AX11000 Pro) → Redes y Conectividad > Redes Wi-Fi > Routers
(480, 6), (480, 22), (480, 72),
-- Producto 481 (Router Wi-Fi 6E TP-Link Archer AXE75 Tri-Banda) → Redes y Conectividad > Redes Wi-Fi > Routers
(481, 6), (481, 22), (481, 72),
-- Producto 482 (Router Wi-Fi 7 TP-Link Archer BE800 Cuádruple Banda) → Redes y Conectividad > Redes Wi-Fi > Routers
(482, 6), (482, 22), (482, 72),
-- Producto 483 (Router Netgear Nighthawk Pro Gaming XR1000 Wi-Fi 6) → Redes y Conectividad > Redes Wi-Fi > Routers
(483, 6), (483, 22), (483, 72),
-- Producto 484 (Router Portátil de Viaje GL.iNet GL-MT3000 (Beryl AX)) → Redes y Conectividad > Redes Wi-Fi > Routers
(484, 6), (484, 22), (484, 72),
-- Producto 485 (Router Wi-Fi 6 Dual-Band D-Link EXO AX AX1800 DIR-X1860) → Redes y Conectividad > Redes Wi-Fi > Routers
(485, 6), (485, 22), (485, 72),
-- Producto 486 (Router Wi-Fi 6 ASUS RT-AX88U Pro Dual-Band 6000 Mbps) → Redes y Conectividad > Redes Wi-Fi > Routers
(486, 6), (486, 22), (486, 72),
-- Producto 487 (Router Wi-Fi 6 MikroTik hAP ax3 Cuatro Núcleos) → Redes y Conectividad > Redes Wi-Fi > Routers
(487, 6), (487, 22), (487, 72),
-- Producto 488 (Router 4G/LTE Wi-Fi Móvil TP-Link TL-MR6400 N300) → Redes y Conectividad > Redes Wi-Fi > Routers
(488, 6), (488, 22), (488, 72),
-- Producto 489 (Sistema Wi-Fi Mesh Tri-Banda TP-Link Deco XE75 Pro (Pack 2)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(489, 6), (489, 22), (489, 73),
-- Producto 490 (Sistema Mesh Amazon eero Pro 6E Tri-Banda (Pack 3)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(490, 6), (490, 22), (490, 73),
-- Producto 491 (Sistema Mesh Wi-Fi 6 ASUS ZenWiFi XT9 (Pack 2)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(491, 6), (491, 22), (491, 73),
-- Producto 492 (Sistema Mesh Wi-Fi 6 TP-Link Deco X50 PoE (Pack 3)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(492, 6), (492, 22), (492, 73),
-- Producto 493 (Sistema Mesh Wi-Fi 7 Netgear Orbi 970 Series (Pack 2)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(493, 6), (493, 22), (493, 73),
-- Producto 494 (Sistema Wi-Fi Mesh TP-Link Deco M4 AC1200 (Pack 3)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(494, 6), (494, 22), (494, 73),
-- Producto 495 (Sistema Mesh Linksys Velop Pro 6E Tri-Banda (Pack 2)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(495, 6), (495, 22), (495, 73),
-- Producto 496 (Sistema Wi-Fi Mesh para Exteriores TP-Link Deco X50-Outdoor) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(496, 6), (496, 22), (496, 73),
-- Producto 497 (Sistema Mesh Google Nest Wifi Pro 6E (Pack 2)) → Redes y Conectividad > Redes Wi-Fi > Sistemas Mesh
(497, 6), (497, 22), (497, 73),
-- Producto 498 (Punto de Acceso Ubiquiti UniFi U6 Pro Wi-Fi 6 Ceiling) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(498, 6), (498, 22), (498, 74),
-- Producto 499 (Repetidor Wi-Fi 6 TP-Link RE705X AX3000 de Enchufe) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(499, 6), (499, 22), (499, 74),
-- Producto 500 (Punto de Acceso Exterior Ubiquiti UniFi Swiss Army Knife Ultra (UK-Ultra)) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(500, 6), (500, 22), (500, 74),
-- Producto 501 (Punto de Acceso Wi-Fi 6 TP-Link Omada EAP653 Ultra Slim) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(501, 6), (501, 22), (501, 74),
-- Producto 502 (Repetidor Wi-Fi 6 Netgear Nighthawk EAX80 8-Stream AX6000) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(502, 6), (502, 22), (502, 74),
-- Producto 503 (Punto de Acceso Wi-Fi 6E Ubiquiti UniFi U6 Enterprise) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(503, 6), (503, 22), (503, 74),
-- Producto 504 (Repetidor Wi-Fi Xiaomi Mi Wi-Fi Range Extender Pro) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(504, 6), (504, 22), (504, 74),
-- Producto 505 (Punto de Acceso de Pared Ubiquiti UniFi In-Wall HD (UAP-IW-HD)) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(505, 6), (505, 22), (505, 74),
-- Producto 506 (Repetidor Wi-Fi 6 ASUS RP-AX58 Dual-Band AiMesh) → Redes y Conectividad > Redes Wi-Fi > Repetidores/Access points
(506, 6), (506, 22), (506, 74),
-- Producto 507 (Switch Gestionado Ubiquiti UniFi Pro 24 PoE (USW-Pro-24-POE)) → Redes y Conectividad > Networking profesional > Switches
(507, 6), (507, 23), (507, 75),
-- Producto 508 (Switch No Gestionado TP-Link TL-SG108PE 8 Puertos Gigabit PoE) → Redes y Conectividad > Networking profesional > Switches
(508, 6), (508, 23), (508, 75),
-- Producto 509 (Switch Multi-Gigabit QNAP QSW-2104-2T (2x 10GbE + 4x 2.5GbE)) → Redes y Conectividad > Networking profesional > Switches
(509, 6), (509, 23), (509, 75),
-- Producto 510 (Switch Gestionado MikroTik CRS305-1G-4S+IN 10Gbps SFP+) → Redes y Conectividad > Networking profesional > Switches
(510, 6), (510, 23), (510, 75),
-- Producto 511 (Switch No Gestionado D-Link DGS-105 5 Puertos Gigabit Metálico) → Redes y Conectividad > Networking profesional > Switches
(511, 6), (511, 23), (511, 75),
-- Producto 512 (Switch Gestionado Netgear Smart Managed Pro MS510TXM 8 Puertos Multi-Gigabit) → Redes y Conectividad > Networking profesional > Switches
(512, 6), (512, 23), (512, 75),
-- Producto 513 (Switch de Escritorio Ubiquiti UniFi Flex Mini (USW-Flex-Mini)) → Redes y Conectividad > Networking profesional > Switches
(513, 6), (513, 23), (513, 75),
-- Producto 514 (Switch No Gestionado TP-Link TL-SG1016D 16 Puertos Gigabit Rack) → Redes y Conectividad > Networking profesional > Switches
(514, 6), (514, 23), (514, 75),
-- Producto 515 (Switch Industrial PoE Din-Rail Zyxel RGS104-12HP) → Redes y Conectividad > Networking profesional > Switches
(515, 6), (515, 23), (515, 75),
-- Producto 516 (Servidor NAS Synology DiskStation DS923+ 4 Bahías) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(516, 6), (516, 23), (516, 76),
-- Producto 517 (Firewall de Seguridad Fortinet FortiGate 40F) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(517, 6), (517, 23), (517, 76),
-- Producto 518 (Servidor NAS QNAP TS-464-8G 4 Bahías Cuatro Núcleos) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(518, 6), (518, 23), (518, 76),
-- Producto 519 (Gateway de Seguridad Ubiquiti UniFi Gateway Max (UXG-Max)) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(519, 6), (519, 23), (519, 76),
-- Producto 520 (Servidor NAS Synology DiskStation DS224+ 2 Bahías) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(520, 6), (520, 23), (520, 76),
-- Producto 521 (Firewall de Seguridad Netgate 2100 con pfSense Plus) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(521, 6), (521, 23), (521, 76),
-- Producto 522 (Servidor NAS en Rack Synology RackStation RS822+ 1U) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(522, 6), (522, 23), (522, 76),
-- Producto 523 (Firewall SonicWall TZ270 Seguridad Total Essential) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(523, 6), (523, 23), (523, 76),
-- Producto 524 (Servidor NAS Todo Flash Asustor Flashstor 6 (FS6706T)) → Redes y Conectividad > Networking profesional > Firewalls/NAS
(524, 6), (524, 23), (524, 76),
-- Producto 525 (Bobina de Cable de Red Cat 6A UTP 100% Cobre 305m) → Redes y Conectividad > Networking profesional > Cableado estructurado
(525, 6), (525, 23), (525, 77),
-- Producto 526 (Patch Panel Cat 6 de 24 Puertos 1U para Rack de 19 Pulgadas) → Redes y Conectividad > Networking profesional > Cableado estructurado
(526, 6), (526, 23), (526, 77),
-- Producto 527 (Kit de Herramientas de Red Profesional con Crimpadora y Tester) → Redes y Conectividad > Networking profesional > Cableado estructurado
(527, 6), (527, 23), (527, 77),
-- Producto 528 (Pack de 10 Latiguillos Patch Cord Cat 6 Slim 1m Azul) → Redes y Conectividad > Networking profesional > Cableado estructurado
(528, 6), (528, 23), (528, 77),
-- Producto 529 (Armario Rack Mural 19 Pulgadas 9U Fondo 450mm) → Redes y Conectividad > Networking profesional > Cableado estructurado
(529, 6), (529, 23), (529, 77),
-- Producto 530 (Conectores RJ45 Cat 6 Pass-Through Blindados (Bote 100 Uds)) → Redes y Conectividad > Networking profesional > Cableado estructurado
(530, 6), (530, 23), (530, 77),
-- Producto 531 (Pack 20 Conectores Keystone Jack Cat 6 RJ45 Hembra) → Redes y Conectividad > Networking profesional > Cableado estructurado
(531, 6), (531, 23), (531, 77),
-- Producto 532 (Regleta PDU 1U 8 Tomas Schuko para Rack de 19" con Interruptor) → Redes y Conectividad > Networking profesional > Cableado estructurado
(532, 6), (532, 23), (532, 77),
-- Producto 533 (Cable Óptico de Fibra Monomodo LC a LC Dúplex OS2 10m) → Redes y Conectividad > Networking profesional > Cableado estructurado
(533, 6), (533, 23), (533, 77),
-- Producto 534 (Disco Duro Externo WD My Book 12TB USB 3.0 Sobremesa) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(534, 6), (534, 24), (534, 78),
-- Producto 535 (Disco Duro Externo Seagate One Touch 5TB Portátil USB 3.0) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(535, 6), (535, 24), (535, 78),
-- Producto 536 (Disco Duro Rugerizado LaCie Rugged Mini 4TB USB 3.0 / USB-C) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(536, 6), (536, 24), (536, 78),
-- Producto 537 (Disco Duro Externo Toshiba Canvio Basics 2TB USB 3.0) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(537, 6), (537, 24), (537, 78),
-- Producto 538 (Disco Duro Gaming WD_BLACK P10 Game Drive 5TB USB 3.2) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(538, 6), (538, 24), (538, 78),
-- Producto 539 (Disco Duro Externo LaCie d2 Professional 10TB USB-C Enterprise) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(539, 6), (539, 24), (539, 78),
-- Producto 540 (Disco Duro Externo ADATA HD710 Pro 2TB Militar Antigolpes) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(540, 6), (540, 24), (540, 78),
-- Producto 541 (Disco Duro Sobremesa Seagate Expansion Desktop 16TB USB 3.0) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(541, 6), (541, 24), (541, 78),
-- Producto 542 (Disco Duro Externo WD Elements Portable 1TB USB 3.0) → Redes y Conectividad > Almacenamiento externo > Discos duros externos
(542, 6), (542, 24), (542, 78),
-- Producto 543 (SSD Portátil Samsung T9 2TB USB 3.2 Gen 2x2 2000MB/s) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(543, 6), (543, 24), (543, 79),
-- Producto 544 (SSD Portátil SanDisk Extreme PRO v2 2TB 2000MB/s Rugerizado) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(544, 6), (544, 24), (544, 79),
-- Producto 545 (SSD Portátil Crucial X9 Pro 1TB USB 3.2 Gen 2 1050MB/s) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(545, 6), (545, 24), (545, 79),
-- Producto 546 (SSD Portátil Kingston XS2000 2TB USB 3.2 Gen 2x2 de Bolsillo) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(546, 6), (546, 24), (546, 79),
-- Producto 547 (SSD Portátil LaCie Rugged SSD Pro 1TB Thunderbolt 3 2800MB/s) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(547, 6), (547, 24), (547, 79),
-- Producto 548 (SSD Portátil WD My Passport SSD 1TB Rojo Metálico) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(548, 6), (548, 24), (548, 79),
-- Producto 549 (SSD Portátil Samsung T7 Shield 4TB USB 3.2 Azul Resistente) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(549, 6), (549, 24), (549, 79),
-- Producto 550 (Carcasa Enclosure NVMe M.2 a USB-C 10Gbps ASUS ROG Strix Arion) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(550, 6), (550, 24), (550, 79),
-- Producto 551 (SSD Portátil Corsair EX100U 2TB USB-C Ultracompacto) → Redes y Conectividad > Almacenamiento externo > SSDs portátiles
(551, 6), (551, 24), (551, 79),
-- Producto 552 (Tarjeta MicroSDXC SanDisk Extreme PRO 256GB V30 A2 200MB/s) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(552, 6), (552, 24), (552, 80),
-- Producto 553 (Memoria USB 3.2 Kingston DataTraveler Max 512GB Tipo-C 1000MB/s) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(553, 6), (553, 24), (553, 80),
-- Producto 554 (Tarjeta SDXC Lexar Professional 1800x 128GB UHS-II V60) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(554, 6), (554, 24), (554, 80),
-- Producto 555 (Memoria USB Dual SanDisk Ultra Dual Drive Luxe 256GB USB-A y USB-C) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(555, 6), (555, 24), (555, 80),
-- Producto 556 (Tarjeta MicroSDXC Samsung PRO Plus 512GB con Lector USB) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(556, 6), (556, 24), (556, 80),
-- Producto 557 (Memoria USB Cifrada Kingston IronKey Locker+ 50 64GB Hardware AES) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(557, 6), (557, 24), (557, 80),
-- Producto 558 (Tarjeta CFexpress Tipo B SanDisk Extreme PRO 128GB) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(558, 6), (558, 24), (558, 80),
-- Producto 559 (Lector de Tarjetas SD/MicroSD USB-C y USB 3.0 UGREEN) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(559, 6), (559, 24), (559, 80),
-- Producto 560 (Memoria USB Metálica Samsung Bar Plus 128GB USB 3.1 400MB/s) → Redes y Conectividad > Almacenamiento externo > USBs y tarjetas SD
(560, 6), (560, 24), (560, 80);

