package com.jeplabs.ecommerce.domain.sucursal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de SucursalService")
class SucursalServiceTest {

    @Mock
    private SucursalRepository repositorio;

    @InjectMocks
    private SucursalService sucursalService;

    private Sucursal sucursalCentro;
    private Sucursal sucursalZona10;

    @BeforeEach
    void setUp() {
        sucursalCentro = new Sucursal(
                1L,
                "Tienda Centro",
                "Av. Principal 123, Ciudad de Guatemala",
                "Ciudad de Guatemala",
                "Guatemala",
                "01001",
                "GT",
                "+502 2345-6789",
                "Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00",
                "Zona 1, Centro Histórico",
                "https://maps.google.com/?q=centro",
                true,
                1,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        sucursalZona10 = new Sucursal(
                2L,
                "Tienda Zona 10",
                "Boulevard Los Proceres 5-50, Zona 10",
                "Ciudad de Guatemala",
                "Guatemala",
                "01010",
                "GT",
                "+502 2456-7890",
                "Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00",
                "Plaza Comercial Zona 10",
                null,
                false,
                2,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("Listar sucursales")
    class ListarSucursalesTests {

        @Test
        @DisplayName("listarActivas devuelve únicamente las sucursales activas en orden")
        void listarActivas_debeRetornarSucursalesActivas() {
            when(repositorio.findByActivoTrueOrderByOrdenVisualizacionAscIdAsc())
                    .thenReturn(List.of(sucursalCentro));

            List<DatosRespuestaSucursal> resultado = sucursalService.listarActivas();

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).nombre()).isEqualTo("Tienda Centro");
            assertThat(resultado.get(0).activo()).isTrue();
            verify(repositorio).findByActivoTrueOrderByOrdenVisualizacionAscIdAsc();
        }

        @Test
        @DisplayName("listarTodas devuelve activas e inactivas para ADMIN")
        void listarTodas_debeRetornarTodasLasSucursales() {
            when(repositorio.findAllByOrderByOrdenVisualizacionAscIdAsc())
                    .thenReturn(List.of(sucursalCentro, sucursalZona10));

            List<DatosRespuestaSucursal> resultado = sucursalService.listarTodas();

            assertThat(resultado).hasSize(2);
            assertThat(resultado).extracting(DatosRespuestaSucursal::nombre)
                    .containsExactly("Tienda Centro", "Tienda Zona 10");
        }
    }

    @Nested
    @DisplayName("Crear y actualizar sucursal")
    class CrearActualizarTests {

        @Test
        @DisplayName("crear guarda una nueva sucursal activa con valores por defecto")
        void crear_datosValidos_debeGuardarYRetornarSucursal() {
            DatosCrearSucursal datos = new DatosCrearSucursal(
                    "Tienda Miraflores",
                    "21 Avenida 4-32, Zona 11",
                    "Ciudad de Guatemala",
                    "Guatemala",
                    "01011",
                    "GT",
                    "+502 2200-1122",
                    "Lun-Dom: 10:00-20:00",
                    "Segundo nivel, local 204",
                    "https://maps.google.com/?q=miraflores",
                    3
            );

            when(repositorio.save(any(Sucursal.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            DatosRespuestaSucursal respuesta = sucursalService.crear(datos);

            assertThat(respuesta.nombre()).isEqualTo("Tienda Miraflores");
            assertThat(respuesta.ciudad()).isEqualTo("Ciudad de Guatemala");
            assertThat(respuesta.horario()).isEqualTo("Lun-Dom: 10:00-20:00");
            assertThat(respuesta.activo()).isTrue();
            assertThat(respuesta.ordenVisualizacion()).isEqualTo(3);
            verify(repositorio).save(any(Sucursal.class));
        }

        @Test
        @DisplayName("actualizar modifica parcialmente los campos de la sucursal")
        void actualizar_sucursalExistente_debeModificarCampos() {
            when(repositorio.findById(1L)).thenReturn(Optional.of(sucursalCentro));

            DatosActualizarSucursal cambios = new DatosActualizarSucursal(
                    "Tienda Centro Renovada",
                    null,
                    null,
                    null,
                    null,
                    null,
                    "+502 2300-9999",
                    "Lun-Sab: 8:00-18:00",
                    "   ", // debe limpiarse a null
                    null,
                    2
            );

            DatosRespuestaSucursal actualizada = sucursalService.actualizar(1L, cambios);

            assertThat(actualizada.nombre()).isEqualTo("Tienda Centro Renovada");
            assertThat(actualizada.direccion()).isEqualTo("Av. Principal 123, Ciudad de Guatemala");
            assertThat(actualizada.telefono()).isEqualTo("+502 2300-9999");
            assertThat(actualizada.horario()).isEqualTo("Lun-Sab: 8:00-18:00");
            assertThat(actualizada.referencias()).isNull();
            assertThat(actualizada.ordenVisualizacion()).isEqualTo(2);
        }

        @Test
        @DisplayName("actualizar sucursal inexistente lanza IllegalArgumentException")
        void actualizar_sucursalInexistente_debeLanzarExcepcion() {
            when(repositorio.findById(99L)).thenReturn(Optional.empty());

            DatosActualizarSucursal cambios = new DatosActualizarSucursal(
                    "Nombre", null, null, null, null, null, null, null, null, null, null
            );

            assertThatThrownBy(() -> sucursalService.actualizar(99L, cambios))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Sucursal no encontrada con ID: 99");
        }
    }

    @Nested
    @DisplayName("Activar y desactivar sucursal")
    class EstadoSucursalTests {

        @Test
        @DisplayName("desactivar cambia activo a false")
        void desactivar_sucursalActiva_debeMarcarInactiva() {
            when(repositorio.findById(1L)).thenReturn(Optional.of(sucursalCentro));

            sucursalService.desactivar(1L);

            assertThat(sucursalCentro.isActivo()).isFalse();
        }

        @Test
        @DisplayName("activar cambia activo a true")
        void activar_sucursalInactiva_debeMarcarActiva() {
            when(repositorio.findById(2L)).thenReturn(Optional.of(sucursalZona10));

            sucursalService.activar(2L);

            assertThat(sucursalZona10.isActivo()).isTrue();
        }
    }
}
