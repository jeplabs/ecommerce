package com.jeplabs.ecommerce.domain.favorito;

import com.jeplabs.ecommerce.domain.producto.*;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de FavoritoService")
class FavoritoServiceTest {

    @Mock
    private FavoritoRepository favoritoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private FavoritoService favoritoService;

    private Usuario usuario;
    private Favorito favorito;

    @BeforeEach
    void setUp() {
        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(7L);

        List<PrecioHistorial> precios = new ArrayList<>();
        List<ProductoImagen> imagenes = new ArrayList<>();
        Producto producto = new Producto(
                100L,
                "SKU-FAV-100",
                "Mouse Gamer",
                "mouse-gamer",
                "Mouse inalámbrico",
                Map.of("dpi", "16000"),
                10,
                EstadoProducto.DISPONIBLE,
                1,
                LocalDateTime.now(),
                LocalDateTime.now(),
                List.of(),
                precios,
                imagenes
        );
        precios.add(new PrecioHistorial(
                1L, producto, new BigDecimal("350.00"), new BigDecimal("200.00"),
                "GTQ", LocalDateTime.now(), null
        ));
        imagenes.add(new ProductoImagen(1L, producto, "https://cdn.example.com/mouse.jpg", true));

        favorito = new Favorito(usuario, producto);
    }

    @Nested
    @DisplayName("listarFavoritos")
    class ListarFavoritosTests {

        @Test
        @DisplayName("Retorna página de favoritos con metadatos de paginación")
        void listarFavoritos_paginado_retornaPage() {
            Pageable pageable = PageRequest.of(0, 12, Sort.by(Sort.Direction.DESC, "creadoAt"));
            when(usuarioRepository.findByEmail("cliente@example.com")).thenReturn(Optional.of(usuario));
            when(favoritoRepository.findByUsuarioId(7L, pageable))
                    .thenReturn(new PageImpl<>(List.of(favorito), pageable, 25));

            Page<DatosRespuestaFavorito> resultado = favoritoService.listarFavoritos("cliente@example.com", pageable);

            verify(favoritoRepository).findByUsuarioId(7L, pageable);
            assertThat(resultado.getTotalElements()).isEqualTo(25);
            assertThat(resultado.getTotalPages()).isEqualTo(3);
            assertThat(resultado.getContent()).hasSize(1);
            assertThat(resultado.getContent().get(0).productId()).isEqualTo(100L);
            assertThat(resultado.getContent().get(0).precioVenta()).isEqualByComparingTo("350.00");
        }
    }

    @Nested
    @DisplayName("listarIdsFavoritos")
    class ListarIdsFavoritosTests {

        @Test
        @DisplayName("Retorna solo la lista de IDs de productos favoritos")
        void listarIdsFavoritos_retornaListaIds() {
            when(usuarioRepository.findByEmail("cliente@example.com")).thenReturn(Optional.of(usuario));
            when(favoritoRepository.findProductoIdsByUsuarioId(7L)).thenReturn(List.of(100L, 105L, 110L));

            List<Long> ids = favoritoService.listarIdsFavoritos("cliente@example.com");

            verify(favoritoRepository).findProductoIdsByUsuarioId(7L);
            assertThat(ids).containsExactly(100L, 105L, 110L);
        }
    }
}
