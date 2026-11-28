package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.Categoria;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tests de ProductoBuscador")
class ProductoBuscadorTest {

    private static final Map<String, Set<String>> SINONIMOS = ProductoBuscador.construirMapaSinonimos(List.of(
            List.of("laptop", "notebook", "portatil", "ultrabook"),
            List.of("pantalla", "monitor", "display"),
            List.of("raton", "mouse"),
            List.of("audifono", "auricular", "headset", "headphone"),
            List.of("celular", "telefono", "smartphone", "movil"),
            List.of("altavoz", "parlante", "bocina", "speaker")
    ));

    private Producto crearProducto(
            Long id,
            String sku,
            String nombre,
            String descripcion,
            Map<String, Object> specs,
            List<Categoria> categorias,
            EstadoProducto estado) {
        return new Producto(
                id,
                sku,
                nombre,
                Producto.generarSlug(nombre),
                descripcion,
                specs,
                estado == EstadoProducto.DISPONIBLE ? 10 : 0,
                estado,
                0,
                LocalDateTime.now(),
                LocalDateTime.now(),
                categorias,
                new ArrayList<>(),
                new ArrayList<>()
        );
    }

    private Categoria categoria(Long id, String nombre) {
        return new Categoria(id, nombre, Categoria.generarSlug(nombre), null, new ArrayList<>());
    }

    @Nested
    @DisplayName("Normalización diacrítica, plurales y tokens compuestos")
    class NormalizacionTests {

        @Test
        @DisplayName("Encuentra productos ignorando tildes y ñ")
        void buscar_sinTildes_coincideConTextoAcentuado() {
            Producto mouse = crearProducto(
                    1L, "MS-01", "Ratón Inalámbrico Ergonómico",
                    "Diseño compacto para oficina",
                    Map.of("Conectividad", "Bluetooth"),
                    List.of(categoria(1L, "Periféricos")),
                    EstadoProducto.DISPONIBLE);

            var consulta = ProductoBuscador.prepararConsulta("raton inalambrico diseno", SINONIMOS);
            assertThat(ProductoBuscador.calcularRelevancia(mouse, consulta)).isPositive();
        }

        @Test
        @DisplayName("Coincide códigos técnicos con y sin espacio o guion (RTX 4050, Wi-Fi, 32GB)")
        void buscar_codigosTecnicos_coincideEntreFormatos() {
            Producto laptop = crearProducto(
                    2L, "A14LPLA", "Notebook Gamer HP Victus RAM32GB RTX4050",
                    "Conectividad Wi-Fi 6E avanzada",
                    Map.of("RAM", "32 GB DDR5"),
                    List.of(categoria(7L, "Laptops y portátiles")),
                    EstadoProducto.DISPONIBLE);

            assertThat(ProductoBuscador.calcularRelevancia(
                    laptop, ProductoBuscador.prepararConsulta("rtx 4050 wifi 32gb", SINONIMOS))).isPositive();
            assertThat(ProductoBuscador.calcularRelevancia(
                    laptop, ProductoBuscador.prepararConsulta("rtx4050 32 gb", SINONIMOS))).isPositive();
        }

        @Test
        @DisplayName("Lematiza plurales regulares en español y los cruza con sinónimos")
        void buscar_pluralesConSinonimos_coincide() {
            Producto mouse = crearProducto(
                    3L, "GPRO-1", "Mouse Logitech G Pro",
                    "Sensor óptico preciso",
                    Map.of("Marca", "Logitech"),
                    List.of(categoria(48L, "Ratones y pads")),
                    EstadoProducto.DISPONIBLE);
            Producto parlante = crearProducto(
                    4L, "JBL-01", "Bocina Bluetooth JBL Flip",
                    "Sonido potente portátil",
                    Map.of("Marca", "JBL"),
                    List.of(categoria(58L, "Altavoces y soundbars")),
                    EstadoProducto.DISPONIBLE);

            assertThat(ProductoBuscador.calcularRelevancia(
                    mouse, ProductoBuscador.prepararConsulta("ratones logitech", SINONIMOS))).isPositive();
            assertThat(ProductoBuscador.calcularRelevancia(
                    parlante, ProductoBuscador.prepararConsulta("altavoces jbl", SINONIMOS))).isPositive();
        }
    }

    @Nested
    @DisplayName("Búsqueda multicampo (SKU, nombre, categorías, specs y descripción) y lógica AND")
    class MulticampoTests {

        @Test
        @DisplayName("Encuentra por SKU, categoría asignada, valor de specs y descripción")
        void buscar_todosLosCampos_coinciden() {
            Producto dell = crearProducto(
                    1L, "U7LNL321TB", "Notebook Dell Pro Plus 14",
                    "Ideal para programación profesional",
                    Map.of("Marca", "Dell", "Procesador", "Intel Core Ultra 7", "Color", "Gris Titanio"),
                    List.of(categoria(26L, "Ultrabooks")),
                    EstadoProducto.DISPONIBLE);

            assertThat(ProductoBuscador.calcularRelevancia(
                    dell, ProductoBuscador.prepararConsulta("U7LNL321TB", SINONIMOS))).isPositive();
            assertThat(ProductoBuscador.calcularRelevancia(
                    dell, ProductoBuscador.prepararConsulta("ultrabooks dell", SINONIMOS))).isPositive();
            assertThat(ProductoBuscador.calcularRelevancia(
                    dell, ProductoBuscador.prepararConsulta("titanio ultra 7", SINONIMOS))).isPositive();
            assertThat(ProductoBuscador.calcularRelevancia(
                    dell, ProductoBuscador.prepararConsulta("programacion", SINONIMOS))).isPositive();
        }

        @Test
        @DisplayName("Exige coincidencia AND de todos los tokens e ignora stop-words")
        void buscar_andYStopWords() {
            Producto mouse = crearProducto(
                    1L, "MS-01", "Mouse Gamer Logitech",
                    "Ideal para juegos competitivos",
                    Map.of("Marca", "Logitech"),
                    List.of(categoria(14L, "Periféricos gaming")),
                    EstadoProducto.DISPONIBLE);

            assertThat(ProductoBuscador.calcularRelevancia(
                    mouse, ProductoBuscador.prepararConsulta("raton para gamer", SINONIMOS))).isPositive();
            assertThat(ProductoBuscador.calcularRelevancia(
                    mouse, ProductoBuscador.prepararConsulta("raton asus", SINONIMOS))).isZero();
        }
    }

    @Nested
    @DisplayName("Prevención de falsos positivos y ranking de relevancia")
    class RelevanciaYAntiRuidoTests {

        @Test
        @DisplayName("Evita falsos positivos en tokens cortos (lg vs algunos, pc vs opción) y llaves JSON de specs")
        void buscar_tokensCortosYLlavesSpecs_noGeneraFalsosPositivos() {
            Producto laptop = crearProducto(
                    1L, "HP-01", "Notebook HP Victus",
                    "Excelente opción para algunos juegos modernos de programación",
                    Map.of("Pantalla", "15.6 pulgadas FHD", "Audio", "Estéreo"),
                    List.of(categoria(7L, "Laptops")),
                    EstadoProducto.DISPONIBLE);

            assertThat(ProductoBuscador.calcularRelevancia(
                    laptop, ProductoBuscador.prepararConsulta("lg", SINONIMOS))).isZero();
            assertThat(ProductoBuscador.calcularRelevancia(
                    laptop, ProductoBuscador.prepararConsulta("pc", SINONIMOS))).isZero();
            assertThat(ProductoBuscador.calcularRelevancia(
                    laptop, ProductoBuscador.prepararConsulta("ram", SINONIMOS))).isZero();
            // La palabra "Pantalla" está solo como LLAVE del mapa specs, no en el valor ni nombre ni descripción
            assertThat(ProductoBuscador.calcularRelevancia(
                    laptop, ProductoBuscador.prepararConsulta("pantalla", SINONIMOS))).isZero();
        }

        @Test
        @DisplayName("Asigna mayor relevancia a SKU > Nombre > Categoría > Specs > Descripción")
        void ranking_priorizaCamposPrincipales() {
            Producto porSku = crearProducto(
                    1L, "MONITOR27", "Equipo Genérico",
                    "Sin texto extra", Map.of(), List.of(), EstadoProducto.DISPONIBLE);
            Producto porNombre = crearProducto(
                    2L, "SKU-2", "Monitor Gamer 27 IPS",
                    "Alta frecuencia", Map.of(), List.of(), EstadoProducto.DISPONIBLE);
            Producto porDescripcion = crearProducto(
                    3L, "SKU-3", "Notebook Dell 14",
                    "Compatible con monitor externo 4K", Map.of(), List.of(), EstadoProducto.DISPONIBLE);

            var consultaNombre = ProductoBuscador.prepararConsulta("monitor", SINONIMOS);
            int scoreNombre = ProductoBuscador.calcularRelevancia(porNombre, consultaNombre);
            int scoreDescripcion = ProductoBuscador.calcularRelevancia(porDescripcion, consultaNombre);

            assertThat(scoreNombre).isGreaterThan(scoreDescripcion);

            var consultaSku = ProductoBuscador.prepararConsulta("MONITOR27", SINONIMOS);
            assertThat(ProductoBuscador.calcularRelevancia(porSku, consultaSku)).isGreaterThan(200);
        }

        @Test
        @DisplayName("Acota consultas excesivamente largas sin lanzar excepciones")
        void buscar_consultaMuyLarga_acotaCorrectamente() {
            String gigante = "laptop ".repeat(60);
            var consulta = ProductoBuscador.prepararConsulta(gigante, SINONIMOS);

            assertThat(consulta.tokens().size()).isLessThanOrEqualTo(ProductoBuscador.MAX_TOKENS_CONSULTA);
        }
    }
}
