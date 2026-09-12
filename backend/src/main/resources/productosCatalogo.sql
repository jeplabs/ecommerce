-- ================================================================
-- SCRIPT DE CARGA DE PRODUCTOS - JEPLabs Ecommerce
-- Generado para PostgreSQL
-- Incluye: Productos, Imágenes (solo prod 1-10), Precios Vigentes y Categorías
-- Última actualización: Septiembre 2026 (56 productos en total - 100% Cobertura de Categorías)
-- REQUISITO: Ejecutar categoriasInput.sql ANTES de este script.
-- ================================================================

-- 1. LIMPIEZA DE DATOS (PRECAUCIÓN)
-- Descomenta las siguientes líneas SOLO si quieres borrar todos los productos existentes.
-- ADVERTENCIA: Esto eliminará productos, imágenes asociadas y historial de precios.
-- TRUNCATE TABLE producto_categorias, producto_imagenes, precio_historial, productos RESTART IDENTITY CASCADE;

-- 2. INSERCIÓN DE PRODUCTOS
-- Se fuerzan los IDs para mantener la consistencia con las relaciones del script.

-- ── Laptops y portátiles (Cat 7) ────────────────────────────────

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(1, 'U7LNL321TBWPS_3PSXCTO2N1', 'Notebook Dell Ultrabook Pro Plus14 2in1 Intel Ultra 7 268V 32GB 1TB 14"TouchW11P', 'notebook-dell-ultrabook-pro-plus14-2in1-intel-ultra-7-268v-32gb-1tb-14touchw11p',
'Descubre la potencia y versatilidad del Dell Ultrabook Pro Plus 14 2 en 1, un dispositivo diseñado para satisfacer las necesidades de los profesionales modernos. Equipado con un procesador Intel® Core™ Ultra 7 268V, este ultrabook cuenta con 8 núcleos que ofrecen un rendimiento excepcional, alcanzando frecuencias de hasta 5 GHz en modo turbo. Con su arquitectura avanzada, podrás realizar múltiples tareas sin esfuerzo, desde la edición de videos hasta la programación, todo con una fluidez impresionante.

La memoria RAM de 32 GB LPDDR5X a 8533 MHz garantiza que puedas ejecutar aplicaciones pesadas y mantener múltiples pestañas abiertas sin comprometer la velocidad. Además, su unidad SSD de 1 TB proporciona un amplio espacio de almacenamiento y tiempos de carga ultrarrápidos, permitiéndote acceder a tus archivos y aplicaciones en un instante.

La pantalla táctil de 14.0 pulgadas con una resolución de 1920 x 1200 ofrece imágenes nítidas y vibrantes, ideal para presentaciones, diseño gráfico o simplemente disfrutar de tus series favoritas. Con una frecuencia de actualización de 60 Hz, cada movimiento en la pantalla es suave y sin interrupciones. La tecnología LED asegura que los colores sean brillantes y los contrastes profundos, mejorando tu experiencia visual.

En cuanto a la conectividad, el Dell Pro Plus 14 2 en 1 no decepciona. Con WiFi 7 tribanda y Bluetooth 5.4, podrás disfrutar de conexiones rápidas y estables. Además, cuenta con múltiples puertos, incluyendo 2x Thunderbolt 4, 1x HDMI 2.1 y 2x USB 5Gbps Type-A, lo que te permite conectar fácilmente tus dispositivos y accesorios.

El diseño del ultrabook es elegante y funcional, con un acabado en gris que le da un toque moderno. Con dimensiones de 314 x 224 x 20 mm y un peso de solo 1550 g, es lo suficientemente ligero como para llevarlo contigo a cualquier lugar. La batería de 5Wh con carga rápida ExpressCharge Boost asegura que puedas trabajar durante horas sin preocuparte por la carga.

El Dell Pro Plus 14 2 en 1 también incluye una cámara frontal Quad HD de 5.2 MP y un sistema de audio de alta calidad con altavoces Cirrus Logic, lo que lo convierte en una excelente opción para videoconferencias y entretenimiento. Con el sistema operativo Microsoft Windows® 11 Pro, tendrás acceso a las últimas características y actualizaciones de seguridad.

Con una garantía de 1 año, el Dell Ultrabook Pro Plus 14 2 en 1 es la elección perfecta para quienes buscan un dispositivo potente, portátil y versátil. Ya sea para trabajar, estudiar o disfrutar de tu contenido favorito, este ultrabook está diseñado para superar tus expectativas.',
'{"RAM": "32 GB LPDDR5X (8533 MHz)", "Audio": "2 altavoces 2.5W, doble micrófono", "Marca": "Dell", "Pantalla": "14.0\" LED (1920x1200) táctil / 60 Hz", "Procesador": "Pro Plus 14 2 in 1", "Cámara Web": "Cámara frontal Quad HD 5.2MP IR", "Almacenamiento": "SSD 1TB", "Frecuencia CPU": "2.2 GHz", "Tarjeta Gráfica": "Intel Arc Graphics 140V (Integrada)"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(2, 'A14LPLA', 'Notebook Gamer HP Victus Ryzen 7 8845HS RAM 16GB SSD 1TB 15.6" RTX4050 6GB W11H', 'notebook-gamer-hp-victus-ryzen-7-8845hs-ram-16gb-ssd-1tb-156-rtx4050-6gb-w11h',
'La Notebook Gamer HP Victus 15-FB2019LA es la elección perfecta para los entusiastas de los videojuegos que buscan un rendimiento excepcional y una experiencia visual envolvente. Equipado con un potente procesador AMD Ryzen™ 7 8845HS, que cuenta con 8 núcleos y 16 hilos, esta laptop ofrece una frecuencia base de 3.8 GHz y puede alcanzar hasta 5.1 GHz en modo turbo, garantizando un rendimiento fluido incluso en las tareas más exigentes.

La memoria RAM de 16 GB DDR5 a 5600 MHz permite una multitarea sin interrupciones, mientras que el almacenamiento SSD de 1 TB proporciona un acceso rápido a tus juegos y aplicaciones, reduciendo los tiempos de carga y mejorando la eficiencia general del sistema. Con una pantalla de 15.6 pulgadas y resolución Full HD (1920 x 1080), disfrutarás de gráficos nítidos y colores vibrantes, gracias a su tecnología IPS y un brillo de 300 nits.

La tarjeta gráfica NVIDIA GeForce RTX 4050 con 6 GB de memoria GDDR6 dedicada asegura que puedas jugar a los títulos más recientes con configuraciones gráficas altas, ofreciendo una experiencia de juego fluida y envolvente. Además, la laptop cuenta con una tasa de refresco de 144 Hz, lo que mejora la jugabilidad en títulos de acción rápida.

En términos de conectividad, la HP Victus está equipada con una variedad de puertos, incluyendo 2 puertos USB Type-A, 1 puerto USB Type-C con soporte para DisplayPort, 1 puerto HDMI 2.1 y un puerto RJ-45 para conexión de red. También incluye conectividad inalámbrica avanzada con Wi-Fi 6E y Bluetooth 5.3, asegurando que estés siempre conectado.

El diseño de la laptop es elegante y funcional, con un teclado retroiluminado de tamaño completo que incluye un teclado numérico, ideal para largas sesiones de juego. La batería de polímero de litio de 4 celdas ofrece una capacidad de 70 Wh, proporcionando una autonomía de hasta 7.75 horas, lo que te permite jugar y trabajar sin preocuparte por la carga.

Con un peso de solo 2.29 kg y dimensiones compactas de 358 x 255 x 24 mm, la HP Victus es fácil de transportar, lo que la convierte en una opción ideal para gamers en movimiento. Además, cuenta con un sistema de audio DTS:X Ultra y altavoces duales que mejoran la experiencia de inmersión en tus juegos y películas.

La Notebook Gamer HP Victus 15-FB2019LA no solo es una máquina potente, sino que también está diseñada con la sostenibilidad en mente, cumpliendo con certificaciones como EPEAT Gold y ENERGY STAR. Con su combinación de rendimiento, portabilidad y características avanzadas, esta laptop es una opción excepcional para cualquier gamer que busque llevar su experiencia de juego al siguiente nivel.',
'{"RAM": "16GB", "Procesador": "Ryzen 7", "Almacenamiento": "1TB", "Sistema Operativo": "Windows 11 Home", "Tamaño de pantalla ": "15.6"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(3, 'C2NM9LT', 'Notebook Workstation HP ZBook X G1i Ultra 7 255HX RAM32GB SSD1TB 16" W11P', 'notebook-workstation-hp-zbook-x-g1i-ultra-7-255hx-ram32gb-ssd1tb-16-w11p',
'La Notebook Workstation HP ZBook X G1i es una potente herramienta diseñada para profesionales que requieren un rendimiento excepcional en sus tareas diarias. Con un procesador Intel® Core™ Ultra 7 255HX, que cuenta con 20 núcleos (8 de rendimiento y 12 de eficiencia), esta workstation es capaz de manejar múltiples aplicaciones y procesos simultáneamente, garantizando una experiencia fluida y eficiente. Su frecuencia base de 2.3 GHz puede alcanzar hasta 5.2 GHz en modo turbo, lo que la convierte en una opción ideal para trabajos que demandan alta capacidad de procesamiento.

Equipado con 32 GB de RAM DDR5 a 5600 MT/s, el HP ZBook X G1i asegura un rendimiento ágil y rápido, permitiendo a los usuarios ejecutar aplicaciones pesadas y realizar multitasking sin inconvenientes. Además, su almacenamiento SSD de 1 TB proporciona una velocidad de lectura y escritura de 500 MB/s, lo que se traduce en tiempos de carga reducidos y un acceso rápido a los datos.

La pantalla de 16 pulgadas con resolución WUXGA (1920 x 1200) ofrece imágenes nítidas y vibrantes, gracias a su tecnología IPS y un brillo de 300 nits. Esta característica es especialmente útil para diseñadores gráficos, editores de video y otros profesionales creativos que requieren precisión en los colores y detalles. La pantalla antirreflectante también permite trabajar en diversas condiciones de iluminación sin distracciones.

En términos de conectividad, la HP ZBook X G1i no decepciona. Dispone de múltiples puertos, incluyendo 2 puertos Thunderbolt 4, 2 puertos USB 5Gbps Type-A, 1 HDMI 2.1 y un puerto RJ45 para conexiones de red rápidas y estables. Además, cuenta con la última tecnología de Wi-Fi 7 (802.11be) y Bluetooth 5.4, asegurando que siempre estés conectado de manera eficiente.

La batería de polímero de litio de 6 celdas y 83 Wh proporciona una duración prolongada, ideal para aquellos que necesitan trabajar en movimiento. Con la capacidad de carga rápida, puedes obtener hasta un 50% de carga en solo 30 minutos, lo que es perfecto para días ajetreados.

El diseño del HP ZBook X G1i es elegante y funcional, con un teclado retroiluminado resistente a salpicaduras que incluye un teclado numérico, lo que facilita la entrada de datos. Además, la presencia de un lector de huellas digitales y opciones de protección mediante contraseña garantizan la seguridad de tus datos y proyectos.

Con un peso de aproximadamente 2.04 kg y dimensiones compactas de 359 x 230 x 23 mm, esta workstation es lo suficientemente portátil para llevarla a cualquier lugar, sin sacrificar el rendimiento. La HP ZBook X G1i es, sin duda, una opción excepcional para aquellos que buscan una computadora portátil potente y confiable para sus necesidades profesionales.',
'{"RAM": "32GB", "Procesador": "Ultra 7", "Almacenamiento": "1TB", "Sistema operativo": "Windows 11 Pro", "Tamaño de pantalla": "16"}',
20, 'DISPONIBLE', 0, NOW(), NOW());

-- ── PC de escritorio (Cat 8) ────────────────────────────────────

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(4, 'F0JN0021CL', 'All-In-One Lenovo IdeaCentre A100, 23.8" FHD, Intel Core I3-N305, 8GB DDR4, SSD 512GB, W11 Home', 'all-in-one-lenovo-ideacentre-a100-238-fhd-intel-core-i3-n305-8gb-ddr4-ssd-512gb-w11-home',
'El Lenovo IdeaCentre A100 (F0JN0021CL) es un computador All-in-One de 23,8 pulgadas que integra pantalla, procesamiento y almacenamiento en un diseño compacto, reduciendo el espacio ocupado sobre el escritorio. Está equipado con un procesador Intel® Core™ i3-N305, 8 GB de memoria DDR4 y una unidad SSD de 512 GB, ofreciendo un funcionamiento ágil para tareas de productividad, navegación y aplicaciones de oficina.

Cuenta con una pantalla Full HD de 23,8 pulgadas que proporciona imágenes nítidas y un amplio espacio de visualización. Incorpora gráficos Intel® UHD Graphics, sistema operativo Windows 11 Home y un diseño en color Cloud Grey, complementado con teclado y mouse para disponer de una solución lista para utilizar desde el primer momento.',
'{"Color": "Cloud Grey", "Marca": "Lenovo", "Modelo": "IdeaCentre A100", "Pantalla": "23,8 pulgadas", "Gráficos": "Intel® UHD Graphics", "Procesador": "Intel® Core™ i3-N305", "Memoria RAM": "8 GB DDR4", "Resolución": "Full HD", "Almacenamiento": "SSD 512 GB", "Sistema operativo": "Windows 11 Home", "Idioma del teclado": "Español", "Periféricos incluidos": "Teclado y mouse", "Frecuencia del procesador": "Hasta 3,8 GHz"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(5, 'SPLABS-CODE5-FDOS', 'PC Armado Code 5 , Ryzen 5 5600GT, 8GB RAM DDR4 3200 MHz, SSD NVMe 500 GB, 650w, FREEDOS', 'pc-armado-code-5-ryzen-5-5600gt-8gb-ram-ddr4-3200-mhz-ssd-nvme-500-gb-650w-freedos',
'Diseñado para ofrecer fluidez y fiabilidad en cada tarea. Equilibrio perfecto para gestionar trabajos de oficina y entretenimiento multimedia sin interrupciones. Es la herramienta ideal para un día a día eficiente, garantizando una experiencia rápida y sin tiempos de espera',
'{"Gabinete": "MSI PRO SHIELD M100P", "Procesador": "AMD Ryzen 5 5600GT", "Memoria RAM": "DDR4 8 GB 3200 MHz CL22", "Placa Madre": "GIGABYTE A520M K V2, Socket AM4", "Almacenamiento": "SSD ADATA LEGEND 860 500 GB", "Fuente de Poder": "Be Quiet! SYSTEM POWER 11U, 650 W"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(6, 'TS-873A-8G-US', 'Servidor NAS QNAP AMD Ryzen™ V1500B, 4 Núcleos 2.2GHz, 8-Bay, 8GB Ram', 'servidor-nas-qnap-amd-ryzen-v1500b-4-nucleos-22ghz-8-bay-8gb-ram',
E'Medios de almacenaje\nUnidades de almacenamiento instaladas\tNo\nNúmero de unidades de almacenamiento compatibles\t8\nTipo de unidades de almacenamiento instaladas\tNo\nTipos de unidades de almacenamiento admitidas\tHDD & SSD\nCompatibilidad con RAID\tSi\nInterfaces de disco de almacenamiento soportados\tM.2, Serial ATA II, Serial ATA III\nTamaños de almacenamiento en disco soportados\t2.5,3.5,M.2\nNúmero de ranuras M.2 (M y B)\t2\nNiveles RAID\t0,1,5+S,5,6,6+HS,10+HS,10,50,60,JBOD\nMigración del nivel RAID online\tSi\nAmpliación RAID online\tSi',
'{"Memoria interna": "8 GB", "Familia de procesador": "AMD Ryzen", "Modelo del procesador": "V1500B", "RAM máximo soportado": "64 GB", "Tipo de memoria interna": "DDR4", "Frecuencia del procesador": "2,2 GHz", "Número de núcleos de procesador": "4", "Número de procesadores soportados": "1"}',
5, 'DISPONIBLE', 0, NOW(), NOW());

-- ── Componentes PC (Cat 9) ───────────────────────────────────────

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(7, 'BX8071512400', 'Procesador Intel Core i5-12400, 2.5GHz Turbo 4.4GHz, Socket LGA 1700, 6-Core / 12-Threads', 'procesador-intel-core-i5-12400-25ghz-turbo-44ghz-socket-lga-1700-6-core-12-threads',
E'Procesador\nFamilia de procesador\tIntel® Core™ i5\nNúmero de núcleos de procesador\t6\nSocket de procesador\tLGA 1700\nCaja\tSi\nRefrigerador incluido\tSi\nFabricante de procesador\tIntel\nModelo del procesador\ti5-12400\nModo de procesador operativo\t64 bits\nProcessor generation\tIntel® Core™ i5 de 12ma Generación\nNúmero de hilos de ejecución\t12\nNúcleos de rendimiento\t6\nFrecuencia del procesador turbo\t4,4 GHz\nFrecuencia de aceleración de núcleo de rendimiento\t4,4 GHz\nFrecuencia base de núcleo de rendimiento\t2,5 GHz\nCaché del procesador\t18 MB\nTipo de cache en procesador\tSmart Cache\nPotencia base del procesador\t65 W\nPotencia turbo máxima\t117 W\nTipos de bus\tDMI4\nNúmero máximo de carriles DMI\t8\nAncho de banda de memoria soportada por el procesador (max)\t76,8 GB/s\nProcesador nombre en clave\tAlder Lake\nMemoria\nCanales de memoria\tDual-channel\nMemoria interna máxima que admite el procesador\t128 GB\nTipos de memoria que admite el procesador\tDDR4-SDRAM,DDR5-SDRAM\nAncho de banda de memoria (max)\t76,8 GB/s\nGráficos\nAdaptador gráfico incorporado\tSi\nAdaptador de gráficos discreto\tNo\nModelo de adaptador gráfico incorporado\tIntel UHD Graphics 730\nModelo de adaptador de gráficos discretos\tNo disponible\nSalidas compatibles de adaptador gráfico incorporado\tEmbedded DisplayPort (eDP) 1.4b,DisplayPort 1.4a,HDMI 2.1\nFrecuencia base de gráficos incorporada\t300 MHz\nFrecuencia dinámica (máx) de adaptador gráfico incorporado\t1450 MHz\nNúmero de pantallas soportadas (gráficos incorporados)\t4\nVersión DirectX de adaptador gráfico incorporado\t12.0\nVersión OpenGL de adaptador gráfico incorporado\t4.5\nResolución máxima de adaptador gráfico incorporado (DisplayPort)\t7680 x 4320 Pixeles\nResolución máxima de adaptador gráfico incorporado (eDP - Integrated Flat Panel)\t5120 x 3200 Pixeles\nResolución máxima de adaptador gráfico incorporado (HDMI)\t4096 x 2160 Pixeles\nFrecuencia de actualización de adaptador gráfico incorporado a la resolución máxima (DisplayPort)\t60 Hz',
'{"Marca": "Intel", "L3 Cache": "18", "Número Modelo": "BX8071512400", "Número de Cores": "6-Core", "Número de Threads": "12", "Gráficos Integrados": "Sí", "Socket del Procesador": "LGA 1700", "Procesador Desbloqueado": "No", "Frecuencia Base del Procesador": "2.5GHz", "Frecuencia Turbo del Procesador": "4.4GHz"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(8, 'KF432C16BB2A/8', 'Memoria RAM DDR4 8GB 3200MT/s Kingston Fury Beast RGB, CL16, DIMM, 1.35V', 'memoria-ram-ddr4-8gb-3200mts-kingston-fury-beast-rgb-cl16-dimm-135v',
E'Un módulo de memoria DDR SDRAM transfiere datos en la subida y bajada de cada ciclo de reloj (1 Hz). Ej.: DDR4-3200 (PC4-3200) Frecuencia de reloj: 1600MHz Velocidad de transmisión de datos: 3200MT/seg Ancho de banda: 25,600 Mb/seg (25.6 GB/seg) \n\n1. Iluminación personalizable con el software Kingston FURY CTRL o con el software de control RGB de la placa madre El soporte para la personalización de RGB a través de software de otros fabricantes puede variar. \n\n2. La memoria Plug N Play trabajará en los sistemas DDR4 a la velocidad permitida por el BIOS del Fabricante. PnP no puede aumentar la velocidad de la memoria del sistema por encima de la velocidad permitida por el BIOS del Fabricante. Los productos FURY Plug N Play DDR4 soportan especificaciones XMP 2.0, por lo tanto, es posible lograr el overclocking activando el perfil incorporado XMP.\nCapacidad total: 8 GB (1x8 GB)\nPerfil de memoria: 3200MT/s 16-18-18 1.35V\nNúmero de pieza: KF432C16BB2A/8',
'{"Latencia CAS": "16", "Componente para": "PC/servidor", "Memoria interna": "8 GB", "Voltaje de memoria": "1.35 V", "Tiempo activo en fila": "32 ns", "Tiempo de ciclo de fila": "45,75 ns", "Tipo de memoria interna": "DDR4", "Configuración de módulos": "1024M x 64", "Forma de factor de memoria": "288-pin DIMM", "Velocidad de memoria del reloj": "3200 MHz", "Intel® Extreme Memory Profile (XMP)": "Si", "Tiempo de actualización de ciclo de fila": "350 ns"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(9, '912-V537-038', 'Tarjeta de Video MSI NVIDIA GeForce RTX 5060 SHADOW 2X OC, 8GB GDDR7, 128-bit, PCI-e 5.0', 'tarjeta-de-video-msi-nvidia-geforce-rtx-5060-shadow-2x-oc-8gb-gddr7-128-bit-pci-e-50',
E'GeForce RTX™ 5060 8G SHADOW 2X OC\nBasada en la arquitectura NVIDIA Blackwell y DLSS 4\nTarjeta GeForce Enthusiast preparada para SFF\nRelojes de núcleo:\nRendimiento extremo: 2535 MHz (MSI Center)\nBoost: 2527 MHz\nTORX FAN 5.0: Las aspas del ventilador unidas por arcos anulares trabajan para estabilizar y mantener el flujo de aire a alta presión.\nTubos de Calor: diseñados para una transferencia de calor eficiente, los tubos de calor alejan eficazmente la energía térmica de la GPU, mejorando el rendimiento general de la refrigeración.\nBackplate de Refuerzo: La placa trasera de refuerzo incorpora una rejilla de ventilación que permite el paso directo del aire de escape.\nMSI Center: El exclusivo software MSI Center permite monitorizar, ajustar y optimizar los productos MSI en tiempo real.\nEl software Afterburner toma el control total con el software de overclocking de tarjetas gráficas más reconocido y utilizado del mundo.',
'{"Cores": "3840 Units", "Memory": "8GB GDDR7", "Memory Bus": "128-bit", "Model Name": "G5060-8S2C", "Bus Standard": "PCI Express® Gen 5 x16 (uses x8)", "Motor Gráfico": "NVIDIA® GeForce RTX™ 5060", "Recommended PSU": "550 W", "Power connectors": "8-pin x 1", "Card Dimension (mm)": "197 x 120 x 40 mm"}',
30, 'DISPONIBLE', 0, NOW(), NOW()),

(10, 'WDBBYV0010BNC-WRWM', 'Unidad SSD Sandisk WD_BLACK SN850P NVMe, 1TB, Lectura 7300 MBs, Escritura 6300 MBs, Licencia PS5', 'unidad-ssd-sandisk-wdblack-sn850p-nvme-1tb-lectura-7300-mbs-escritura-6300-mbs-licencia-ps5',
E'El SSD SanDisk WD_BLACK SN850P NVMe para consolas PS5 de 1 TB (WDBBYV0010BNC-WRSN) es una unidad de almacenamiento interno M.2 NVMe PCIe 4.0 x4 con formato M.2 2280. Cuenta con capacidad de 1 TB, rendimiento de lectura secuencial de hasta 7300 MB/s, escritura secuencial de hasta 6300 MB/s, además de disipador térmico integrado.\n\nEl modelo incorpora interfaz PCIe 4.0 x4, conector M.2, lectura aleatoria de hasta 800K IOPS, escritura aleatoria de hasta 1100K IOPS, dimensiones de 80 × 24,46 × 9,89 mm y peso de 30,4 g.',
'{"Peso": "30,4 g", "Tipo": "Unidad SSD interna NVMe", "Marca": "SanDisk", "Formato": "M.2 2280", "Conector": "M.2", "Interfaz": "PCIe 4.0 x4", "Capacidad": "1 TB", "Dimensiones": "80 × 24,46 × 9,89 mm", "Lectura aleatoria": "Hasta 800K IOPS", "Resistencia (TBW)": "600 TBW", "Lectura secuencial": "Hasta 7300 MB/s", "Escritura aleatoria": "Hasta 1100K IOPS", "Escritura secuencial": "Hasta 6300 MB/s"}',
10, 'DISPONIBLE', 0, NOW(), NOW());

-- ── Smartphones y Tablets (Cats 35, 36, 37, 38, 39, 40, 41, 42, 43) ──

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(11, 'MYWW3LZ/A', 'Smartphone Apple iPhone 16 Pro Max 256GB Titanium Natural', 'smartphone-apple-iphone-16-pro-max-256gb-titanium-natural',
'El iPhone 16 Pro Max cuenta con una pantalla Super Retina XDR de 6.9 pulgadas con ProMotion, chip A18 Pro de rendimiento extremo, sistema de cámaras Pro con fusor de 48 MP y teleobjetivo de 5x, botón de Control de Cámara, y diseño en titanio Grado 5 increíblemente resistente y ligero.',
'{"Pantalla": "6.9\" Super Retina XDR OLED 120Hz ProMotion", "Procesador": "Apple A18 Pro", "Almacenamiento": "256 GB", "Cámara Principal": "48 MP + 48 MP Ultra Gran Angular + 12 MP Teleobjetivo 5x", "Batería": "Hasta 33 horas de reproducción de video", "Sistema Operativo": "iOS 18", "Conectividad": "5G, Wi-Fi 7, USB-C 3.0"}',
15, 'DISPONIBLE', 0, NOW(), NOW()),

(12, 'MUWC3LZ/A', 'Tablet Apple iPad Air 11" M2 128GB Wi-Fi Space Gray', 'tablet-apple-ipad-air-11-m2-128gb-wi-fi-space-gray',
'El nuevo iPad Air de 11 pulgadas cuenta con la potencia del chip Apple M2, pantalla Liquid Retina de alta resolución, cámara frontal ultra gran angular de 12 MP en posición horizontal compatible con Encuadre Centrado, y compatibilidad con Apple Pencil Pro y Magic Keyboard.',
'{"Pantalla": "11.0\" Liquid Retina IPS (2360x1640)", "Procesador": "Apple M2 (8 núcleos CPU, 10 núcleos GPU)", "Almacenamiento": "128 GB", "RAM": "8 GB", "Cámara": "12 MP Gran Angular trasera / 12 MP Ultra Gran Angular frontal", "Sistema Operativo": "iPadOS 17", "Conectividad": "Wi-Fi 6E, Bluetooth 5.3, USB-C"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(21, 'SM-A556B', 'Smartphone Samsung Galaxy A55 5G 256GB 8GB RAM Awesome Navy', 'smartphone-samsung-galaxy-a55-5g-256gb-8gb-ram-awesome-navy',
'El Samsung Galaxy A55 5G combina un diseño elegante en cristal y metal con una pantalla Super AMOLED FHD+ de 6.6 pulgadas a 120Hz, procesador Exynos 1480, cámara principal de 50 MP con OIS, resistencia IP67 y batería de 5000 mAh.',
'{"Pantalla": "6.6\" Super AMOLED FHD+ 120Hz", "Procesador": "Exynos 1480 Octa-Core", "Almacenamiento": "256 GB (Expandible)", "RAM": "8 GB", "Cámara Principal": "50 MP + 12 MP Ultra Gran Angular + 5 MP Macro", "Batería": "5000 mAh (Carga rápida 25W)", "Protección": "IP67 resistente al agua y polvo"}',
25, 'DISPONIBLE', 0, NOW(), NOW()),

(22, 'SM-X510', 'Tablet Samsung Galaxy Tab S9 FE 10.9" 128GB Wi-Fi S-Pen Incluido Gray', 'tablet-samsung-galaxy-tab-s9-fe-109-128gb-wi-fi-s-pen-incluido-gray',
'Diseñada para la creatividad y productividad. La Galaxy Tab S9 FE incluye el lápiz óptico S Pen resistente al agua (IP68), pantalla de 10.9 pulgadas a 90Hz, procesador Exynos 1380, cuerpo de aluminio de alta durabilidad y altavoces duales AKG.',
'{"Pantalla": "10.9\" WUXGA+ (2304x1440) 90Hz", "Procesador": "Exynos 1380 Octa-Core", "Almacenamiento": "128 GB", "RAM": "6 GB", "Accesorios": "S Pen incluido en la caja", "Protección": "Resistencia IP68", "Batería": "8000 mAh"}',
18, 'DISPONIBLE', 0, NOW(), NOW()),

(31, 'MOTO-G24-POWER', 'Smartphone Motorola Moto G24 Power 256GB 8GB RAM Ink Blue', 'smartphone-motorola-moto-g24-power-256gb-8gb-ram-ink-blue',
'El Moto G24 Power destaca por su enorme batería de 6000 mAh con carga rápida TurboPower de 30W, pantalla HD+ de 6.6 pulgadas a 90Hz, procesador MediaTek Helio G85, cámara principal de 50 MP con Quad Pixel y diseño con acabado repelente al agua.',
'{"Pantalla": "6.6\" HD+ (1612x720) 90Hz", "Procesador": "MediaTek Helio G85 Octa-Core", "Almacenamiento": "256 GB (Expandible hasta 1TB)", "RAM": "8 GB (hasta 16GB con RAM Boost)", "Cámara Principal": "50 MP + 2 MP Macro", "Batería": "6000 mAh (TurboPower 30W)", "Sonido": "Altavoces estéreo con Dolby Atmos"}',
14, 'DISPONIBLE', 0, NOW(), NOW()),

(32, 'ZXV-00001', 'Tablet 2-en-1 Microsoft Surface Pro 10 Intel Core Ultra 5 135U 16GB 256GB Platinum', 'tablet-2-en-1-microsoft-surface-pro-10-intel-core-ultra-5-135u-16gb-256gb-platinum',
'Diseñada para empresas y profesionales exigentes. La Surface Pro 10 cuenta con procesador Intel Core Ultra 5 con NPU para inteligencia artificial, pantalla táctil PixelSense Flow de 13 pulgadas a 120Hz, cámara de estudio Quad HD de 1440p y conectividad Wi-Fi 6E.',
'{"Pantalla": "13.0\" PixelSense Flow (2880x1920) 120Hz táctil", "Procesador": "Intel Core Ultra 5 135U con NPU AI Boost", "RAM": "16 GB LPDDR5x", "Almacenamiento": "256 GB SSD extraíble", "Cámara": "Frontal 1440p Quad HD / Trasera 10.5 MP Ultra HD 4K", "Sistema Operativo": "Windows 11 Pro", "Peso": "879 gramos"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(33, 'ACS07936', 'Funda Spigen Tough Armor MagFit para Apple iPhone 16 Pro Max Black', 'funda-spigen-tough-armor-magfit-para-apple-iphone-16-pro-max-black',
'Protección de grado militar de doble capa para iPhone 16 Pro Max. La funda Spigen Tough Armor MagFit incluye tecnología de espuma Air Cushion contra impactos, soporte desplegable integrado y anillo magnético compatible con accesorios y cargadores MagSafe.',
'{"Material": "Policarbonato + TPU + Espuma de impacto Extreme Protection Tech", "Compatibilidad MagSafe": "Sí (Imanes integrados N52)", "Certificación": "Grado Militar MIL-STD 810G-516.6", "Características": "Soporte kickstand integrado para visualización de video", "Compatibilidad": "Apple iPhone 16 Pro Max (6.9\")"}',
35, 'DISPONIBLE', 0, NOW(), NOW()),

(34, 'A2669', 'Cargador de Pared Anker Prime 67W GaN Wall Charger 3 Puertos USB-C USB-A Black', 'cargador-de-pared-anker-prime-67w-gan-wall-charger-3-puertos-usb-c-usb-a-black',
'Carga rápida ultrainsustrial para tres dispositivos simultáneamente. Gracias a la tecnología GaNPrime de Anker y su tamaño compacto, ofrece una potencia de hasta 67W capaz de cargar una MacBook Pro, un iPhone y un iPad al mismo tiempo con monitoreo térmico ActiveShield 2.0.',
'{"Potencia Máxima": "67W", "Puertos": "2x USB-C + 1x USB-A", "Tecnología": "Anker GaNPrime (Gallium Nitride)", "Seguridad": "ActiveShield 2.0 monitoreo de temperatura", "Compatibilidad": "Laptops USB-C, Smartphones, Tablets, Consolas portátiles", "Diseño": "Enchufe plegable ultra compacto"}',
40, 'DISPONIBLE', 0, NOW(), NOW()),

(35, 'A8866', 'Cable USB-C a USB-C Anker 765 Nylon Trenzado 140W 1.8 Metros Black', 'cable-usb-c-a-usb-c-anker-765-nylon-trenzado-140w-18-metros-black',
'El cable USB-C más resistente de Anker con soporte para Power Delivery 3.1 de hasta 140W. Fabricado en nylon de alta densidad trenzado capaz de soportar más de 35.000 dobladuras, ideal para cargar laptops de alta potencia como MacBook Pro de 16 pulgadas y dispositivos móviles.',
'{"Conectores": "USB-C a USB-C", "Potencia Máxima": "140W PD 3.1 (28V/5A)", "Longitud": "1.8 metros (6 pies)", "Material": "Recubrimiento en Nylon ultrarresistente", "Durabilidad": "Probado con más de 35.000 curvas de resistencia", "Transferencia de Datos": "USB 2.0 480 Mbps"}',
50, 'DISPONIBLE', 0, NOW(), NOW());

-- ── Gaming (Cats 44, 45, 46, 47, 48, 49, 50, 51, 52) ─────────────

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(13, 'CFI-2015B', 'Consola Sony PlayStation 5 Slim Edición Digital 1TB SSD White', 'consola-sony-playstation-5-slim-edicion-digital-1tb-ssd-white',
'Disfruta de una carga ultra rápida con la unidad SSD de 1 TB de velocidad ultrarrápida, una inmersión más profunda con soporte para retroalimentación háptica, gatillos adaptativos y audio 3D, y una nueva generación de increíbles juegos de PlayStation® en un diseño de consola más delgado y compacto.',
'{"Almacenamiento": "1 TB SSD Personalizado (5.5 GB/s)", "Procesador": "AMD Zen 2 de 8 núcleos a 3.5 GHz", "Gráficos": "AMD RDNA 2 de 10.28 TFLOPs", "Resolución": "Hasta 4K 120Hz, compatible con 8K", "Mando incluido": "DualSense Inalámbrico White", "Edición": "Digital (sin lector de discos)"}',
12, 'DISPONIBLE', 0, NOW(), NOW()),

(14, '920-012118', 'Teclado Mecánico Gaming Logitech G PRO X TKL LIGHTSPEED RGB Tactile Black', 'teclado-mecanico-gaming-logitech-g-pro-x-tkl-lightspeed-rgb-tactile-black',
'Diseñado con los mejores profesionales de los eSports del mundo. El teclado inalámbrico para juegos Logitech G PRO X TKL ofrece conectividad Lightspeed inalámbrica ultrarrápida, switches mecánicos táctiles GX Brown, iluminación RGB LIGHTSYNC por tecla y controles multimedia dedicados.',
'{"Tipo de Switch": "Mecánico GX Táctil (Brown)", "Formato": "TKL (Tenkeyless sin teclado numérico)", "Conectividad": "Inalámbrico LIGHTSPEED, Bluetooth, USB-C", "Autonomía": "Hasta 50 horas", "Iluminación": "RGB LIGHTSYNC por tecla", "Compatibilidad": "Windows, macOS"}',
25, 'DISPONIBLE', 0, NOW(), NOW()),

(15, 'TB22-STEALTH-SW', 'Silla Gaming Secretlab TITAN Evo 2022 Stealth SoftWeave Fabric', 'silla-gaming-secretlab-titan-evo-2022-stealth-softweave-fabric',
'La silla gamer definitiva. Secretlab TITAN Evo combina ergonomía de nivel profesional con materiales de máxima calidad. Cuenta con soporte lumbar L-ADAPT regulable en 4 direcciones, almohada magnética de espuma viscoelástica para la cabeza, reposabrazos 4D totalmente metálicos y tela transpirable SoftWeave Plus.',
'{"Material": "Tela SoftWeave® Plus altamente transpirable", "Estructura": "Acero reinforced", "Soporte Lumbar": "Sistema L-ADAPT regulable en altura y profundidad", "Reposabrazos": "4D con cubierta magnética CloudSwap", "Pistón": "Clase 4 hidráulico", "Reclinación": "Hasta 165 grados"}',
8, 'DISPONIBLE', 0, NOW(), NOW()),

(23, 'RXR-00001', 'Consola Microsoft Xbox Series X 1TB SSD 4K Ultra HD Black', 'consola-microsoft-xbox-series-x-1tb-ssd-4k-ultra-hd-black',
'La Xbox más rápida y potente de la historia. Xbox Series X ofrece 12 teraflops de potencia de procesamiento gráfico, juegos en verdadero 4K de hasta 120 FPS, arquitectura Xbox Velocity con SSD personalizado de 1 TB y retrocompatibilidad con miles de juegos.',
'{"Potencia Gráfica": "12 TFLOPS AMD RDNA 2", "Procesador": "AMD Zen 2 de 8 núcleos a 3.8 GHz", "Almacenamiento": "1 TB NVMe SSD Personalizado", "Resolución": "4K Nativo a 60/120 FPS", "Lector Óptico": "Blu-ray 4K Ultra HD", "Mando": "Control Inalámbrico Xbox Carbon Black"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(24, '910-006928', 'Mouse Gamer Inalámbrico Logitech G PRO X SUPERLIGHT 2 LIGHTSPEED Black', 'mouse-gamer-inalambrico-logitech-g-pro-x-superlight-2-lightspeed-black',
'Evolución del mouse más icónico de los eSports. Con un peso ultraligero de solo 60 gramos, sensor HERO 2 de hasta 32.000 DPI con más de 500 IPS, switches híbridos LIGHTFORCE óptico-mecánicos y hasta 95 horas de batería continua.',
'{"Peso": "60 gramos", "Sensor": "HERO 2 (100 a 32.000 DPI)", "Switches": "LIGHTFORCE híbridos óptico-mecánicos", "Conectividad": "LIGHTSPEED inalámbrico + USB-C", "Polling Rate": "Hasta 2000 Hz (0.5 ms)", "Autonomía": "Hasta 95 horas"}',
30, 'DISPONIBLE', 0, NOW(), NOW()),

(36, 'HEG-S-RAAAA', 'Consola Nintendo Switch OLED Model Mario Red Edition', 'consola-nintendo-switch-oled-model-mario-red-edition',
'Edición especial en color rojo icónico de Mario. La Nintendo Switch Modelo OLED cuenta con una vibrante pantalla OLED de 7 pulgadas, un soporte ajustable ancho, base con puerto LAN por cable incorporado, 64 GB de almacenamiento interno y audio optimizado para juego portátil.',
'{"Pantalla": "7.0\" OLED Táctil (1280x720 en portátil / 1080p en TV)", "Almacenamiento": "64 GB interno (Expandible mediante MicroSD)", "Modos de Juego": "TV, Sobremesa y Portátil", "Base Dock": "Incluye puerto LAN Ethernet de alta velocidad", "Controles": "Joy-Con Mario Red Edition", "Batería": "4.5 a 9 horas de autonomía"}',
15, 'DISPONIBLE', 0, NOW(), NOW()),

(37, 'RZ04-04530100-R3U1', 'Audífonos Gamer Razer BlackShark V2 Pro Wireless 2023 Black', 'audifonos-gamer-razer-blackshark-v2-pro-wireless-2023-black',
'El auricular definitivo para eSports. Cuenta con micrófono de banda ultraancha Razer HyperClear, diafragmas de titanio TriForce de 50 mm, perfiles de audio afinados para FPS profesionales, tecnología inalámbrica Razer HyperSpeed de ultra baja latencia y hasta 70 horas de batería.',
'{"Diafragmas": "Razer™ TriForce de Titanio 50 mm", "Micrófono": "Razer™ HyperClear Super Wideband extraíble", "Conectividad": "Inalámbrico Razer HyperSpeed 2.4GHz + Bluetooth 5.2", "Cancelación de Ruido": "Aislamiento pasivo de ruido con almohadillas Ultra-Soft Memory Foam", "Autonomía": "Hasta 70 horas (Carga rápida por USB-C)", "Peso": "320 gramos"}',
16, 'DISPONIBLE', 0, NOW(), NOW()),

(38, 'ERK-EDK-E60-B', 'Escritorio Gamer Ajustable Eureka Ergonomic 60" Eléctrico de Altura Regulable Black', 'escritorio-gamer-ajustable-eureka-ergonomic-60-electrico-de-altura-regulable-black',
'Escritorio gamer inteligente motorizado de 60 pulgadas. Permite ajustar la altura eléctricamente entre 75cm y 122cm con memoria de 4 posiciones, tablero de fibra de carbono resistente a rayones, sistema de gestión de cables y mousepad gigante de superficie completa.',
'{"Dimensiones": "152 cm (60\") de ancho x 70 cm de profundidad", "Rango de Altura": "75 cm a 122 cm (Motor eléctrico suave de doble columna)", "Capacidad de Carga": "Hasta 100 kg", "Superficie": "Textura de fibra de carbono impermeable", "Panel de Control": "Pantalla LED con 4 ajustes preestablecidos de memoria", "Accesorios": "Mousepad completo + Soporte para auriculares y vaso"}',
5, 'DISPONIBLE', 0, NOW(), NOW()),

(39, 'CL-9011109-WW', 'Torres de Iluminación RGB Corsair iCUE LT100 Smart Lighting Towers Starter Kit', 'torres-de-iluminacion-rgb-corsair-icue-lt100-smart-lighting-towers-starter-kit',
'Ilumina tu espacio de juego con el kit de inicio Corsair iCUE LT100. Incluye dos torres de luz de 422 mm de altura con 46 LEDs RGB direccionables individualmente cada una, difusor de luz de silicona suave, soporte magnético para auriculares removible y sincronización total con el ecosistema iCUE.',
'{"Altura": "422 mm por torre", "Cantidad de LEDs": "92 LEDs RGB direccionables individualmente (46 por torre)", "Base": "Aluminio duradero con iluminación ambiental en la base", "Accesorios": "Incluye soporte extraíble para auriculares", "Sincronización": "Software CORSAIR iCUE con modos de audio visualizer e iluminación envolvente de pantalla"}',
12, 'DISPONIBLE', 0, NOW(), NOW());

-- ── Audio, Video y Foto (Cats 53, 54, 55, 56, 57, 58, 59, 60, 61, 62) ─

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(16, 'WH1000XM5/B', 'Auriculares Inalámbricos Sony WH-1000XM5 Noise Canceling Black', 'auriculares-inalambricos-sony-wh-1000xm5-noise-canceling-black',
'Los auriculares Sony WH-1000XM5 redefinen la escucha sin distracciones gracias a su cancelación de ruido líder en la industria con dos procesadores y ocho micrófonos. Ofrecen una calidad de sonido excepcional con unidades de diafragma de 30 mm, llamadas ultranítidas y hasta 30 horas de autonomía.',
'{"Tipo": "Over-Ear Inalámbricos", "Cancelación de Ruido": "Active Noise Canceling con chip HD QN1 y V1", "Códecs de Audio": "LDAC, AAC, SBC", "Autonomía": "Hasta 30 horas (ANC activado)", "Carga Rápida": "3 min para 3 horas de uso", "Conectividad": "Bluetooth 5.2, Multipunto, Cable 3.5mm"}',
18, 'DISPONIBLE', 0, NOW(), NOW()),

(17, 'OLED55C4PSA', 'Televisor LG OLED EVO C4 55" 4K Smart TV 144Hz AI Alpha 9 Gen7', 'televisor-lg-oled-evo-c4-55-4k-smart-tv-144hz-ai-alpha-9-gen7',
'El televisor LG OLED evo C4 ofrece negros perfectos y contraste infinito con píxeles autoiluminados potenciados por el procesador alpha 9 AI Gen7. Con tasa de refresco de 144 Hz, nVIDIA G-Sync, AMD FreeSync Premium, Dolby Vision y Dolby Atmos, es la mejor experiencia visual tanto para cine como para videojuegos de última generación.',
'{"Pantalla": "55.0\" OLED EVO 4K UHD (3840x2160)", "Tasa de Refresco": "144 Hz nativo", "Procesador": "Procesador Alpha 9 AI Gen7 4K", "Gaming": "NVIDIA G-Sync, AMD FreeSync Premium, 4x HDMI 2.1", "Sonido": "Dolby Atmos 2.2 canales 40W", "Sistema Operativo": "webOS 24"}',
6, 'DISPONIBLE', 0, NOW(), NOW()),

(25, 'CP.MA.00000735.01', 'Drone DJI Mini 4 Pro Fly More Combo con Control Remoto DJI RC 2', 'drone-dji-mini-4-pro-fly-more-combo-con-control-remoto-dji-rc-2',
'El mini drone con cámara definitivo. Pesa menos de 249g, graba video en 4K/60fps HDR con fotos de 48 MP, cuenta con detección de obstáculos omnidireccional, disparo vertical nativo, transmisión de video O4 hasta 20km y 3 baterías en el paquete Combo.',
'{"Peso": "< 249 gramos (Sin necesidad de licencia en muchos países)", "Cámara": "CMOS 1/1.3\" 48 MP 4K/60fps HDR", "Detección": "Omnidireccional de obstáculos", "Transmisión": "DJI O4 (Hasta 20 km FHD)", "Autonomía": "Hasta 34 minutos por batería", "Incluye": "Control DJI RC 2 con pantalla FHD, 3 baterías, hub de carga y bolsa"}',
7, 'DISPONIBLE', 0, NOW(), NOW()),

(26, 'BEAM2US1BLK', 'Barra de Sonido Sonos Beam Gen 2 Dolby Atmos Wi-Fi AirPlay 2 Black', 'barra-de-sonido-sonos-beam-gen-2-dolby-atmos-wi-fi-airplay-2-black',
'Enriquece tu experiencia de entretenimiento con la segunda generación de Sonos Beam. Ahora con Dolby Atmos para un sonido envolvente 3D, 5 amplificadores digitales de clase D, sintonización Trueplay, control por voz y conexión fácil mediante HDMI eARC.',
'{"Sonido": "Dolby Atmos 3D, 5 amplificadores Clase D", "Conexión TV": "HDMI eARC / ARC (cable HDMI incluido)", "Conectividad Inalámbrica": "Wi-Fi 2.4/5GHz, Apple AirPlay 2", "Control": "App Sonos, Control por Voz (Alexa / Sonos Voice Control)", "Sintonización": "Tecnología Trueplay"}',
12, 'DISPONIBLE', 0, NOW(), NOW()),

(40, '2727C002', 'Cámaras DSLR Canon EOS Rebel T7 con Lente EF-S 18-55mm IS II', 'camara-dslr-canon-eos-rebel-t7-con-lente-ef-s-18-55mm-is-ii',
'Ideal para principiantes y entusiastas de la fotografía. La Canon EOS Rebel T7 cuenta con un gran sensor CMOS APS-C de 24.1 megapíxeles, procesador DIGIC 4+, grabación de video Full HD 1080p, sistema de enfoque automático de 9 puntos y conectividad Wi-Fi con NFC para compartir al instante.',
'{"Sensor": "CMOS APS-C de 24.1 Megapíxeles", "Procesador de Imagen": "DIGIC 4+", "Lente Incluido": "Canon EF-S 18-55mm f/3.5-5.6 IS II con estabilizador óptico", "Pantalla": "LCD de 3.0 pulgadas (920.000 puntos)", "Video": "Full HD 1080p a 30 fps", "Conectividad": "Wi-Fi + NFC integrado"}',
9, 'DISPONIBLE', 0, NOW(), NOW()),

(41, 'ILCE-7M4/B', 'Cámaras Mirrorless Sony Alpha A7 IV Full-Frame Cuerpo Black', 'camara-mirrorless-sony-alpha-a7-iv-full-frame-cuerpo-black',
'La cámara híbrida de referencia para foto y video profesional. Equipada con un nuevo sensor CMOS Exmor R retroiluminado Full-Frame de 33 MP, procesador BIONZ XR, enfoque en tiempo real con IA para humanos, animales y aves, video 4K a 60p en 10-bit 4:2:2 y estabilización de imagen de 5 ejes integrada.',
'{"Sensor": "CMOS Exmor R Full-Frame de 33 Megapíxeles", "Procesador": "BIONZ XR de alta velocidad", "Enfoque AF": "759 puntos AF por detección de fase + Real-Time Eye AF", "Video": "4K 60p en Super 35mm / 4K 30p Full-Frame 7K Oversampling 10-bit 4:2:2", "Estabilización": "En el cuerpo de 5 ejes (Hasta 5.5 pasos)", "Pantalla": "Táctil abatible de ángulo variable"}',
5, 'DISPONIBLE', 0, NOW(), NOW()),

(42, 'MKBFRA4BK-BH', 'Trípode Profesional Manfrotto Befree Advanced de Aluminio con Rótula de Bola', 'tripode-profesional-manfrotto-befree-advanced-de-aluminio-con-rotula-de-bola',
'Diseñado para fotógrafos de viajes que buscan máximo rendimiento y estabilidad. El trípode Manfrotto Befree Advanced soporta hasta 9 kg de carga, alcanza una altura máxima de 150 cm y se pliega a tan solo 40 cm. Incluye la rotula de bola Manfrotto 494 con ajuste de fricción independiente.',
'{"Material": "Aluminio de alta resistencia", "Carga Máxima": "9 kg", "Altura Máxima": "150 cm (con columna extendida)", "Longitud Plegado": "40 cm", "Rótula": "Rótula de bola MH494-BH con plato de liberación rápida 200PL-PRO", "Peso": "1.59 kg"}',
15, 'DISPONIBLE', 0, NOW(), NOW()),

(43, 'MV7+-K', 'Micrófono Dinámico Shure MV7+ USB-C / XLR para Podcast y Streaming Black', 'microfono-dinamico-shure-mv7-usb-c-xlr-para-podcast-y-streaming-black',
'Inspirado en el legendario SM7B, el Shure MV7+ es un micrófono dinámico híbrido USB-C y XLR. Cuenta con panel táctil LED personalizable, tecnología de aislamiento de voz, supresor de ruido en tiempo real, denoiser DSP y salidas de audífonos para monitoreo sin latencia.',
'{"Tipo de Cápsula": "Dinámica con patrón polar Cardioide", "Conexiones": "USB-C y XLR analógico simultáneo", "Procesamiento DSP": "Denoiser en tiempo real, Auto Level Mode, Digital Popper Stopper™", "Panel Táctil": "LED RGB de colores personalizables con función Mute", "Calidad de Grabación": "Hasta 24-bit / 48 kHz"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(44, 'D2426111', 'Proyector Portátil Anker Nebula Capsule 3 Laser 1080p Smart Google TV', 'proyector-portatil-anker-nebula-capsule-3-laser-1080p-smart-google-tv',
'Cine en casa del tamaño de una lata de refresco. El Nebula Capsule 3 utiliza tecnología láser de 300 lúmenes ANSI para ofrecer imágenes Full HD 1080p de hasta 120 pulgadas, sistema inteligente Google TV con Netflix certificado nativo, altavoz Dolby Digital de 8W y batería interna.',
'{"Resolución": "Full HD 1080p (1920x1080) tecnología Láser", "Brillo": "300 ANSI Lúmenes", "Tamaño de Proyección": "Hasta 120 pulgadas", "Sistema Operativo": "Google TV certificado con Netflix nativo", "Enfoque/Keystone": "Autoenfoque y corrección trapezoidal automática instantánea", "Autonomía": "Hasta 2.5 horas de reproducción de video"}',
8, 'DISPONIBLE', 0, NOW(), NOW()),

(51, 'VLF728-B2', 'Soporte de Pared Articulado Sanus Premium para TV de 42 a 90 Pulgadas Premium Full-Motion', 'soporte-de-pared-articulado-sanus-premium-para-tv-de-42-a-90-pulgadas-premium-full-motion',
'Soporte articulado de gama alta para televisores grandes de 42" a 90". El Sanus VLF728 permite extender el televisor hasta 70 cm de la pared, inclinarlo y girarlo suavemente con la punta de un dedo gracias a la tecnología Virtual Axis, con canaletas internas para ocultar cables.',
'{"Tamaño de TV Compatible": "42\" a 90\" (106 cm a 228 cm)", "Capacidad de Carga": "125 lbs (56.7 kg)", "Extensión de Pared": "Hasta 70 cm", "Inclinación/Giro": "+5° / -15° de inclinación, 57° de giro", "Compatibilidad VESA": "200x200 mm a 600x400 mm", "Canal de Cables": "Gestión de cables integrada en brazos de acero"}',
10, 'DISPONIBLE', 0, NOW(), NOW());

-- ── Hogar Inteligente (Cats 63, 64, 65, 66, 67, 68, 69, 70, 71) ──

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(18, 'TAPO-C210', 'Cámaras de Seguridad IP TP-Link Tapo C210 Wi-Fi 3MP Pan/Tilt Detección de Movimiento', 'camara-de-seguridad-ip-tp-link-tapo-c210-wi-fi-3mp-pan-tilt-deteccion-de-movimiento',
'Vigila lo que más te importa con la cámara IP inteligente TP-Link Tapo C210. Graba en ultra alta definición de 3MP (2304x1296), cuenta con rotación de 360° horizontal y 114° vertical, visión nocturna avanzada de hasta 9 metros, audio bidireccional y detección de movimiento con alertas en tiempo real.',
'{"Resolución": "3MP (2304 x 1296) 2K", "Movimiento": "360° Horizontal / 114° Vertical", "Visión Nocturna": "Infrarroja de 850 nm (hasta 9m)", "Audio": "Bidireccional (Micrófono y altavoz incorporados)", "Almacenamiento": "Tarjeta MicroSD hasta 512GB / Tapo Care Cloud", "Conectividad": "Wi-Fi 2.4 GHz"}',
40, 'DISPONIBLE', 0, NOW(), NOW()),

(19, 'B101GL', 'Robot Aspirador y Trapeador Xiaomi Robot Vacuum X20+ con Base Autolimpiable', 'robot-aspirador-y-trapeador-xiaomi-robot-vacuum-x20-con-base-autolimpiable',
'El Xiaomi Robot Vacuum X20+ simplifica la limpieza de tu hogar con una potente succión de 6000 Pa, navegación láser LDS de alta precisión, evasión de obstáculos S-Cross y una estación base inteligente de autovaciado del polvo, lavado automático de mopas y secado con aire caliente.',
'{"Potencia de Succión": "6000 Pa", "Navegación": "LDS Láser + Sensor de evasión de obstáculos S-Cross", "Estación Base": "Vaciado automático de 2.5L / Depósito de agua limpia 4L", "Trapeado": "Doble mopa giratoria a alta velocidad", "Batería": "5200 mAh (hasta 180 min)", "Control App": "Mi Home / Xiaomi Home (Google Assistant y Alexa)"}',
14, 'DISPONIBLE', 0, NOW(), NOW()),

(27, 'MQJ73LL/A', 'Altavoz Inteligente Apple HomePod 2da Generación Midnight Siri', 'altavoz-inteligente-apple-homepod-2da-generacion-midnight-siri',
'El HomePod ofrece un sonido acústico de alta fidelidad con graves profundos e agudos cristalinos. Impulsado por el chip Apple S7 y audio computacional, incluye compatibilidad con Audio Espacial, asistente inteligente Siri, sensores de temperatura y humedad, y soporte Matter.',
'{"Audio": "Woofer de alta excursión + 5 tweeters en array con bocina", "Chip": "Apple S7", "Audio Espacial": "Sí con Dolby Atmos", "Sensores": "Temperatura, Humedad, Reconocimiento de Sonido de alarmas", "Conectividad": "Wi-Fi 802.11n, Bluetooth 5.0, Thread, Matter"}',
15, 'DISPONIBLE', 0, NOW(), NOW()),

(28, '563288', 'Kit de Inicio Philips Hue White and Color Ambiance 3 Bulbos E26 + Hue Bridge', 'kit-de-inicio-philips-hue-white-and-color-ambiance-3-bulbos-e26-hue-bridge',
'Transforma la iluminación de tu hogar con 16 millones de colores y tonos de blanco regulables. El kit incluye 3 bombillas LED inteligentes E26 (75W equivalente) y el puente Hue Bridge para desbloquear automatizaciones, control fuera de casa y sincronización con juegos y música.',
'{"Potencia": "10.5W (Equivalente a 75W incandescente, 1100 lúmenes por foco)", "Colores": "16 millones de colores + Blanco cálido a frío (2000K-6500K)", "Rosca": "E26", "Incluye": "3 Bombillas Smart A19 + 1 Hue Bridge + Cable Ethernet", "Compatibilidad": "Apple Home, Alexa, Google Assistant, Matter"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(45, 'HM-G01E', 'Hub Domótico Aqara Hub M3 Zigbee 3.0 / Matter / Thread / IR Control', 'hub-domotico-aqara-hub-m3-zigbee-3-0-matter-thread-ir-control',
'El centro neurálgico definitivo para el hogar inteligente. El Aqara Hub M3 es compatible con Matter, Zigbee 3.0, Thread, Bluetooth y control infrarrojo (IR) de 360°. Permite ejecutar automatizaciones locales sin conexión a internet y se conecta vía Wi-Fi o puerto Ethernet PoE.',
'{"Protocolos Inalámbricos": "Zigbee 3.0, Thread, Bluetooth 5.1, Wi-Fi Dual Band, Infrarrojos IR 360°", "Soporte Matter": "Funciona como Matter Bridge y Controller", "Conexión": "Ethernet RJ45 con soporte PoE (Power over Ethernet) + USB-C", "Altavoz Integrado": "95dB para sirena de alarma y tonos de timbre", "Almacenamiento Local": "Ejecución de automatizaciones e historiales locales"}',
12, 'DISPONIBLE', 0, NOW(), NOW()),

(46, '4AK1S7-0FC0', 'Kit de Sistema de Alarma Ring Alarm 5 Piezas 2da Generación Wi-Fi', 'kit-de-sistema-de-alarma-ring-alarm-5-piezas-2da-generacion-wi-fi',
'Protección completa para tu hogar. El kit Ring Alarm incluye estación base, teclado numérico de control, un sensor de contacto para puertas o ventanas, un sensor de movimiento y un amplificador de alcance Z-Wave. Se controla fácilmente desde la App de Ring con alertas al instante.',
'{"Incluye": "Estación Base, Teclado, 1 Sensor de Contacto, 1 Sensor de Movimiento, 1 Extensor de Alcance", "Conectividad": "Wi-Fi, Ethernet, Z-Wave (Batería de respaldo de 24 horas)", "Sirena": "104 dB integrada en la Estación Base", "Compatibilidad": "Funciona con cámaras Ring y asistentes de voz Alexa"}',
10, 'DISPONIBLE', 0, NOW(), NOW()),

(47, 'YRD420-WF1-619', 'Cerradura Inteligente Yale Assure Lock 2 Wi-Fi Touchscreen Nickel', 'cerradura-inteligente-yale-assure-lock-2-wi-fi-touchscreen-nickel',
'Acceso sin llaves inteligente y seguro. La Yale Assure Lock 2 con pantalla táctil incluye módulo Wi-Fi integrado para controlar el cerrojo desde cualquier lugar. Ofrece múltiples métodos de acceso: código PIN táctil, llaves digitales compartidas, desboqueo por Bluetooth o asistente de voz.',
'{"Conectividad": "Wi-Fi 2.4GHz + Bluetooth integrado (Sin necesidad de hub adicional)", "Métodos de Apertura": "Pantalla Táctil retroiluminada, App Yale Access, Desbloqueo Automático", "Integración": "Apple Home, Google Home, Amazon Alexa, SmartThings", "Tecnología DoorSense": "Sensor que confirma si la puerta está bien cerrada", "Alimentación": "4 Baterías AA (Duración aprox. 6-9 meses)"}',
14, 'DISPONIBLE', 0, NOW(), NOW()),

(48, 'T3007ES', 'Termostato Inteligente Nest Learning Thermostat 3ra Generación Stainless Steel', 'termostato-inteligente-nest-learning-thermostat-3ra-generacion-stainless-steel',
'El termostato que aprende tus hábitos de temperatura. Nest memoriza tus preferencias en pocos días y se programa automáticamente para ahorrar energía cuando no estás en casa. Pantalla brillante Farsight, control remoto Wi-Fi y monitoreo de climatización.',
'{"Pantalla": "LCD de 2.0\" a color (480x480 píxeles a 229 ppi)", "Aprendizaje": "Auto-programación inteligente sin necesidad de configuración manual", "Conectividad": "Wi-Fi 802.11b/g/n 2.4/5GHz, Bluetooth Low Energy", "Ahorro": "Función Eco Temperature e historial de energía en la App Nest / Google Home", "Compatibilidad": "La mayoría de sistemas de calefacción y aire acondicionado de 24V"}',
18, 'DISPONIBLE', 0, NOW(), NOW()),

(52, 'GA01331-US', 'Pantalla Inteligente Google Nest Hub 2da Generación Charcoal con Asistente de Google', 'pantalla-inteligente-google-nest-hub-2da-generacion-charcoal-con-asistente-de-google',
'El centro de control visual para tu hogar inteligente. Google Nest Hub cuenta con pantalla táctil HD de 7 pulgadas, altavoz mejorado con 50% más de graves, sensor Soli para análisis del sueño Sleep Sensing, control gestual sin tocar la pantalla y automatización de luces y cámaras.',
'{"Pantalla": "7.0\" Táctil LCD (1024x600)", "Altavoz": "Altavoz de rango completo con diafragma de 43.5mm", "Microfónos": "3 micrófonos de campo lejano con interruptor de apagado físico", "Sensores": "Radar Soli (Sleep Sensing), Ambient EQ, Temperatura", "Conectividad": "Wi-Fi Dual Band, Bluetooth 5.0, Chromecast integrado, Matter"}',
16, 'DISPONIBLE', 0, NOW(), NOW());

-- ── Redes y Conectividad (Cats 72, 73, 74, 75, 76, 77, 78, 79, 80) 

INSERT INTO productos (id, sku, nombre, slug, descripcion, specs, stock, estado, version, created_at, updated_at)
VALUES
(20, 'RT-AX58U', 'Router Wi-Fi 6 Dual Band ASUS RT-AX58U AX3000 AiMesh AiProtection Pro', 'router-wi-fi-6-dual-band-asus-rt-ax58u-ax3000-aimesh-aiprotection-pro',
'Aumenta la velocidad y capacidad de tu red doméstica con el router ASUS RT-AX58U Wi-Fi 6 (802.11ax). Ofrece velocidades de hasta 3000 Mbps (574 Mbps en 2.4GHz + 2402 Mbps en 5GHz), tecnologías OFDMA y MU-MIMO, seguridad AiProtection Pro con tecnología Trend Micro y compatibilidad con ASUS AiMesh.',
'{"Estándar Wi-Fi": "Wi-Fi 6 (802.11ax) Dual Band", "Velocidad": "AX3000 (2402 Mbps a 5GHz / 574 Mbps a 2.4GHz)", "Puertos": "1x WAN Gigabit, 4x LAN Gigabit, 1x USB 3.2 Gen 1", "Antenas": "4 Antenas externas de alta ganancia", "Seguridad": "WPA3, AiProtection Pro permanente sin costo", "Tecnología Mesh": "ASUS AiMesh compatible"}',
22, 'DISPONIBLE', 0, NOW(), NOW()),

(29, 'DECO-X55-3PACK', 'Sistema Wi-Fi 6 Mesh TP-Link Deco X55 AX3000 Pack de 3 Nodos Cobertura 600m²', 'sistema-wi-fi-6-mesh-tp-link-deco-x55-ax3000-pack-de-3-nodos-cobertura-600m2',
'Elimina las zonas muertas de Wi-Fi en toda tu casa. El sistema Deco X55 utiliza Wi-Fi 6 de doble banda con velocidades de hasta 3000 Mbps, cubre hasta 600 metros cuadrados, soporta más de 150 dispositivos conectados simultáneamente y cuenta con tecnología Mesh impulsada por IA.',
'{"Estándar": "Wi-Fi 6 (AX3000: 2402 Mbps en 5GHz + 574 Mbps en 2.4GHz)", "Cobertura": "Hasta 600 m² (Pack de 3 unidades)", "Puertos": "3 Puertos Gigabit Ethernet por nodo (Auto-Sensing WAN/LAN)", "Capacidad": "Más de 150 dispositivos conectados", "Seguridad": "TP-Link HomeShield con antivirus integrado"}',
16, 'DISPONIBLE', 0, NOW(), NOW()),

(30, 'MU-PE2T0S/AM', 'Unidad SSD Portátil Samsung T7 Shield 2TB USB 3.2 Gen 2 IP65 Black', 'unidad-ssd-portatil-samsung-t7-shield-2tb-usb-3-2-gen-2-ip65-black',
'Rendimiento de alta velocidad y máxima durabilidad para profesionales en movimiento. La unidad Samsung T7 Shield ofrece velocidades de lectura/escritura de hasta 1050/1000 MB/s, resistencia a caídas de hasta 3 metros, y certificación IP65 contra agua y polvo.',
'{"Capacidad": "2 TB", "Velocidad de Lectura": "Hasta 1.050 MB/s", "Velocidad de Escritura": "Hasta 1.000 MB/s", "Interfaz": "USB 3.2 Gen 2 (10 Gbps)", "Protección": "IP65 (Agua y polvo) + Resistencia a caídas de 3m", "Cifrado": "AES de 256 bits por hardware", "Compatibilidad": "PC, Mac, Android, Consolas"}',
25, 'DISPONIBLE', 0, NOW(), NOW()),

(49, 'USW-LITE-16-POE', 'Switch Gigabit Administrable Ubiquiti UniFi Switch Lite 16 PoE', 'switch-gigabit-administrable-ubiquiti-unifi-switch-lite-16-poe',
'Switch capa 2 totalmente administrable con 16 puertos Gigabit Ethernet, de los cuales 8 puertos ofrecen PoE+ (802.3at) autodetectable con un presupuesto total de 45W. Diseño compacto sin ventilador para un funcionamiento silencioso en red UniFi.',
'{"Puertos": "16 Puertos RJ45 10/100/1000 Mbps", "Puertos PoE": "8 Puertos PoE+ 802.3af/at (Hasta 30W por puerto, presupuesto total 45W)", "Capacidad de Conmutación": "16 Gbps no bloqueante", "Administración": "Software UniFi Network Controller", "Refrigeración": "Diseño sin ventilador (Fanless silencioso)"}',
12, 'DISPONIBLE', 0, NOW(), NOW()),

(50, 'WDBPKJ0050BBK-WESN', 'Disco Duro Externo 5TB WD My Passport USB 3.2 Gen 1 Portable Black', 'disco-duro-externo-5tb-wd-my-passport-usb-3-2-gen-1-portable-black',
'Gran capacidad de almacenamiento portátil con respaldo automático y protección mediante contraseña con cifrado por hardware AES de 256 bits. El WD My Passport de 5 TB ofrece un diseño delgado y elegante listo para usar en Windows y Mac.',
'{"Capacidad": "5 TB", "Interfaz": "USB 3.2 Gen 1 (Compatible con USB 2.0)", "Seguridad": "Cifrado por hardware AES de 256 bits con software WD Security", "Software": "WD Backup para respaldos programados automáticos", "Formato": "2.5 pulgadas portátil de tamaño compacto"}',
30, 'DISPONIBLE', 0, NOW(), NOW()),

(53, 'U6-PLUS', 'Access Point Inalámbrico Ubiquiti UniFi 6 Plus Wi-Fi 6 Dual Band PoE', 'access-point-inalambrico-ubiquiti-unifi-6-plus-wi-fi-6-dual-band-poe',
'Punto de acceso compacto de alto rendimiento con Wi-Fi 6 (802.11ax). El UniFi 6+ ofrece una tasa de agregación de hasta 2975 Mbps, tecnología 2x2 MIMO en 2.4 GHz y 5 GHz, cobertura de hasta 140 m² y soporte para más de 300 clientes conectados con alimentación PoE.',
'{"Estándar Wi-Fi": "Wi-Fi 6 (802.11ax) 2x2 MIMO", "Velocidad": "Hasta 2402 Mbps en 5GHz / 573.5 Mbps en 2.4GHz", "Puertos": "1x RJ45 Gigabit Ethernet", "Alimentación": "Power over Ethernet 48V PoE (802.3af)", "Capacidad": "Más de 300 dispositivos concurrentes", "Cobertura": "Hasta 140 m²"}',
15, 'DISPONIBLE', 0, NOW(), NOW()),

(54, 'FG-40F', 'Firewall de Seguridad Fortinet FortiGate 40F Next-Generation Firewall', 'firewall-de-seguridad-fortinet-fortigate-40f-next-generation-firewall',
'Solución de seguridad de red NGFW y SD-WAN para pequeñas y medianas empresas. El FortiGate 40F cuenta con el procesador SOC4 dedicado de Fortinet, inspección de firewall de 5 Gbps, VPN IPSec de 4.4 Gbps, protección contra amenazas avanzadas y prevención de intrusiones IPS.',
'{"Rendimiento Firewall": "5 Gbps", "Rendimiento VPN IPSec": "4.4 Gbps", "Inspección SSL": "1 Gbps", "Puertos": "5x RJ45 GE (1x WAN, 1x DMZ, 3x Internal)", "Procesador": "FortiASIC SOC4 System-on-a-Chip", "Funciones": "SD-WAN integrado, Antivirus, Web Filtering, IPS, DLP"}',
4, 'DISPONIBLE', 0, NOW(), NOW()),

(55, 'PUP6004BU-UY', 'Bobina de Cable UTP Categoría 6 Panduit TX6000 305m 100% Cobre Azul', 'bobina-de-cable-utp-categoria-6-panduit-tx6000-305m-100-cobre-azul',
'Bobina de cable de red profesional Categoría 6 U/UTP de 305 metros (1000 pies). Fabricado con conductores de cobre sólido de calibre 23 AWG, cruceta separadora central y chaqueta CM retardante a la flama. Diseñado para redes Gigabit Ethernet de alta velocidad en proyectos estructurados corporativos.',
'{"Categoría": "Cat 6 U/UTP", "Conductor": "100% Cobre Sólido 23 AWG", "Longitud": "305 metros (1000 pies en caja easy-payout)", "Chaqueta": "CM Retardante a la flama PVC Azul", "Frecuencia": "Probado hasta 550 MHz", "Estándares": "ISO 11801, ANSI/TIA-568.2-D Cat 6"}',
20, 'DISPONIBLE', 0, NOW(), NOW()),

(56, 'SDSQXAV-256G-GN6MA', 'Tarjeta de Memoria SanDisk Extreme PRO MicroSDXC 256GB V30 A2 200MB/s con Adaptador', 'tarjeta-de-memoria-sandisk-extreme-pro-microsdxc-256gb-v30-a2-200mb-s-con-adaptador',
'Rendimiento extremo para grabación de video 4K UHD en drones, cámaras de acción y smartphones. La SanDisk Extreme PRO ofrece velocidades de lectura de hasta 200 MB/s con tecnología SanDisk QuickFlow, velocidad de escritura de 140 MB/s, clasificación V30 y rendimiento de aplicaciones A2.',
'{"Capacidad": "256 GB", "Velocidad de Lectura": "Hasta 200 MB/s", "Velocidad de Escritura": "Hasta 140 MB/s", "Clasificación de Video": "V30 / UHS Speed Class 3 (U3) para video 4K UHD", "Clasificación de Apps": "A2 (Carga rápida de aplicaciones)", "Protección": "Resistente a golpes, agua, rayos X y temperaturas extremas"}',
50, 'DISPONIBLE', 0, NOW(), NOW());

-- 3. INSERCIÓN DE IMÁGENES
-- IDs secuenciales desde 1. La columna 'principal' indica la imagen principal del producto.
-- Nota: Solo los productos 1 al 10 cuentan con registros de imágenes precargados.
INSERT INTO producto_imagenes (id, producto_id, url, principal)
VALUES
-- Producto 1 (Dell Ultrabook)
(1, 1, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/2uao9ivfd3uzw8b8q433ffrmh929?_a=BACCd2Ev', true),
(2, 1, 'https://media.spdigital.cl/thumbnails/products/1756737149160-U7LNL321TBWPS-02_e3e31969_05faaa94_thumbnail_512.jpg', false),
(3, 1, 'https://media.spdigital.cl/thumbnails/products/1756737161926-U7LNL321TBWPS-06_aa48972b_b23647b7_thumbnail_4096.jpg', false),
-- Producto 2 (HP Victus Gaming)
(4, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/ij1yd3s3dmjwa5ozwfes75m8dhd0?_a=BACCd2Ev', true),
(5, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/rbjveemb2kkfqzlfvd8tp6mhbywa?_a=BACCd2Ev', false),
(6, 2, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/eaw9r90ikafg2713fqlbq8szgj6u?_a=BACCd2Ev', false),
-- Producto 3 (HP ZBook Workstation)
(7, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/gh10i3duy6896vl51ij5ws5zcn34?_a=BACCd2Ev', true),
(8, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/jb8clvuqhcfzx0qch47hkvas16q5?_a=BACCd2Ev', false),
(9, 3, 'https://res.cloudinary.com/djx6viedj/image/upload/t_trimmed_square_2048/lvlmnj20eoryz8ivohztt3ynyjko?_a=BACCd2Ev', false),
-- Producto 4 (Lenovo All-In-One)
(10, 4, 'https://media.spdigital.cl/thumbnails/products/1786031283067-A100a_60178bc9_5a8f1ff1_thumbnail_512.jpg', true),
(11, 4, 'https://media.spdigital.cl/thumbnails/products/1786031295715-A100c_36eb0932_f86e790e_thumbnail_512.jpg', false),
(12, 4, 'https://media.spdigital.cl/thumbnails/products/1786031289018-A100b_ac383ac1_6a53e233_thumbnail_512.jpg', false),
-- Producto 5 (PC Armado Code 5)
(13, 5, 'https://media.spdigital.cl/thumbnails/products/1787242207044-Thumbnail_L_Tasking_06ff7355_332ac68d_thumbnail_512.jpg', true),
(14, 5, 'https://media.spdigital.cl/thumbnails/products/1787242209338-Thumbnail_L_Tasking_2eb22f84_9a19dfdd_thumbnail_512.jpg', false),
-- Producto 6 (NAS QNAP)
(15, 6, 'https://media.spdigital.cl/thumbnails/products/orapl0ln_a8efdbc4_thumbnail_512.jpg', true),
(16, 6, 'https://media.spdigital.cl/thumbnails/products/nhcaikxz_9bea5f08_thumbnail_512.jpg', false),
(17, 6, 'https://media.spdigital.cl/thumbnails/products/n6fgqxvr_bfe953bb_thumbnail_512.jpg', false),
-- Producto 7 (Intel i5-12400)
(18, 7, 'https://media.spdigital.cl/thumbnails/products/ijr8slav_42e15bcb_thumbnail_512.jpeg', true),
(19, 7, 'https://media.spdigital.cl/thumbnails/products/xd67fbsj_3b46b84a_thumbnail_512.jpg', false),
(20, 7, 'https://media.spdigital.cl/thumbnails/products/cpuntdj7_1e750731_thumbnail_512.png', false),
-- Producto 8 (Kingston Fury Beast RGB)
(21, 8, 'https://media.spdigital.cl/thumbnails/products/icpdcgvy_b02983d1_thumbnail_512.jpg', true),
(22, 8, 'https://media.spdigital.cl/thumbnails/products/qt9kn18m_60055d57_thumbnail_512.jpg', false),
(23, 8, 'https://media.spdigital.cl/thumbnails/products/gia_spcr_ba722a1b_thumbnail_512.jpg', false),
-- Producto 9 (MSI RTX 5060)
(24, 9, 'https://media.spdigital.cl/thumbnails/products/1760967019645-c8_76e05a3a_cfd6dc5c_thumbnail_512.png', true),
(25, 9, 'https://media.spdigital.cl/thumbnails/products/1761257748783-g1_ad9e70e6_e2cc3414_thumbnail_512.png', false),
(26, 9, 'https://media.spdigital.cl/thumbnails/products/1761257752996-g2_a54a6acc_23a73ff2_thumbnail_512.png', false),
-- Producto 10 (WD_BLACK SN850P)
(27, 10, 'https://media.spdigital.cl/thumbnails/products/1783633157059-wd1_e4ca1a79_c563ea07_thumbnail_512.jpg', true),
(28, 10, 'https://media.spdigital.cl/thumbnails/products/1783633170661-wd5_98b40dfa_e509d402_thumbnail_512.jpg', false),
(29, 10, 'https://media.spdigital.cl/thumbnails/products/1783633323273-wd3_5694e891_1c336599_thumbnail_512.jpg', false);

-- 4. INSERCIÓN DE PRECIOS VIGENTES
-- Se inserta SOLO el precio actual (fecha_fin NULL) para evitar historial innecesario en el seed.
INSERT INTO precio_historial (producto_id, precio_venta, precio_costo, moneda, fecha_inicio, fecha_fin)
VALUES
(1, 1900.00, 1900.00, 'USD', NOW(), NULL),
(2,  999.00,  999.00, 'USD', NOW(), NULL),
(3, 2199.00, 2199.00, 'USD', NOW(), NULL),
(4,  649.00,  649.00, 'USD', NOW(), NULL),
(5,  499.00,  499.00, 'USD', NOW(), NULL),
(6, 1820.00, 1820.00, 'USD', NOW(), NULL),
(7,  210.00,  210.00, 'USD', NOW(), NULL),
(8,  125.00,  125.00, 'USD', NOW(), NULL),
(9,  430.00,  430.00, 'USD', NOW(), NULL),
(10, 400.00,  400.00, 'USD', NOW(), NULL),
(11, 1199.00, 1199.00, 'USD', NOW(), NULL),
(12,  599.00,  599.00, 'USD', NOW(), NULL),
(13,  449.00,  449.00, 'USD', NOW(), NULL),
(14,  199.00,  199.00, 'USD', NOW(), NULL),
(15,  549.00,  549.00, 'USD', NOW(), NULL),
(16,  399.00,  399.00, 'USD', NOW(), NULL),
(17, 1399.00, 1399.00, 'USD', NOW(), NULL),
(18,   35.00,   35.00, 'USD', NOW(), NULL),
(19,  499.00,  499.00, 'USD', NOW(), NULL),
(20,  129.00,  129.00, 'USD', NOW(), NULL),
(21,  429.00,  429.00, 'USD', NOW(), NULL),
(22,  449.00,  449.00, 'USD', NOW(), NULL),
(23,  499.00,  499.00, 'USD', NOW(), NULL),
(24,  159.00,  159.00, 'USD', NOW(), NULL),
(25, 1099.00, 1099.00, 'USD', NOW(), NULL),
(26,  499.00,  499.00, 'USD', NOW(), NULL),
(27,  299.00,  299.00, 'USD', NOW(), NULL),
(28,  179.00,  179.00, 'USD', NOW(), NULL),
(29,  229.00,  229.00, 'USD', NOW(), NULL),
(30,  179.00,  179.00, 'USD', NOW(), NULL),
(31,  149.00,  149.00, 'USD', NOW(), NULL),
(32, 1199.00, 1199.00, 'USD', NOW(), NULL),
(33,   39.00,   39.00, 'USD', NOW(), NULL),
(34,   59.00,   59.00, 'USD', NOW(), NULL),
(35,   29.00,   29.00, 'USD', NOW(), NULL),
(36,  349.00,  349.00, 'USD', NOW(), NULL),
(37,  199.00,  199.00, 'USD', NOW(), NULL),
(38,  399.00,  399.00, 'USD', NOW(), NULL),
(39,  139.00,  139.00, 'USD', NOW(), NULL),
(40,  479.00,  479.00, 'USD', NOW(), NULL),
(41, 2499.00, 2499.00, 'USD', NOW(), NULL),
(42,  189.00,  189.00, 'USD', NOW(), NULL),
(43,  279.00,  279.00, 'USD', NOW(), NULL),
(44,  799.00,  799.00, 'USD', NOW(), NULL),
(45,  129.00,  129.00, 'USD', NOW(), NULL),
(46,  199.00,  199.00, 'USD', NOW(), NULL),
(47,  259.00,  259.00, 'USD', NOW(), NULL),
(48,  249.00,  249.00, 'USD', NOW(), NULL),
(49,  199.00,  199.00, 'USD', NOW(), NULL),
(50,  129.00,  129.00, 'USD', NOW(), NULL),
(51,  299.00,  299.00, 'USD', NOW(), NULL),
(52,   99.00,   99.00, 'USD', NOW(), NULL),
(53,  129.00,  129.00, 'USD', NOW(), NULL),
(54,  599.00,  599.00, 'USD', NOW(), NULL),
(55,  219.00,  219.00, 'USD', NOW(), NULL),
(56,   45.00,   45.00, 'USD', NOW(), NULL);

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
(56, 6), (56, 24), (56, 80);

-- 6. REINICIO DE SECUENCIAS
-- CRÍTICO: Ajusta las secuencias para que el próximo ID automático sea el correcto.
-- Esto evita errores de "duplicate key" al crear nuevos productos desde la aplicación.

-- Secuencia de Productos (último ID: 56, siguiente será 57)
SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos));

-- Secuencia de Imágenes (último ID: 29, siguiente será 30)
SELECT setval('producto_imagenes_id_seq', (SELECT MAX(id) FROM producto_imagenes));

-- Secuencia de Precios (si usa secuencia propia)
-- SELECT setval('precio_historial_id_seq', (SELECT MAX(id) FROM precio_historial));

-- Fin del script