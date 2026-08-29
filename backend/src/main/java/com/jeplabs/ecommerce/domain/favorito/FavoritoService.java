package com.jeplabs.ecommerce.domain.favorito;

import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<DatosRespuestaFavorito> listarFavoritos(String email) {
        Usuario usuario = buscarUsuario(email);
        return favoritoRepository.findByUsuarioIdOrderByCreadoAtDesc(usuario.getId())
                .stream()
                .map(DatosRespuestaFavorito::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean esFavorito(String email, Long productoId) {
        Usuario usuario = buscarUsuario(email);
        return favoritoRepository.existsByUsuarioIdAndProductoId(usuario.getId(), productoId);
    }

    @Transactional
    public DatosRespuestaFavorito agregarFavorito(String email, Long productoId) {
        Usuario usuario = buscarUsuario(email);
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + productoId));

        // Si ya existe, devolver el favorito existente sin duplicar
        if (favoritoRepository.existsByUsuarioIdAndProductoId(usuario.getId(), productoId)) {
            Favorito existente = favoritoRepository.findById(new FavoritoId(usuario.getId(), productoId))
                    .orElseThrow();
            return new DatosRespuestaFavorito(existente);
        }

        Favorito favorito = new Favorito(usuario, producto);
        favoritoRepository.save(favorito);
        return new DatosRespuestaFavorito(favorito);
    }

    @Transactional
    public void eliminarFavorito(String email, Long productoId) {
        Usuario usuario = buscarUsuario(email);
        if (!favoritoRepository.existsByUsuarioIdAndProductoId(usuario.getId(), productoId)) {
            throw new IllegalArgumentException("El producto no está en tus favoritos");
        }
        favoritoRepository.deleteByUsuarioIdAndProductoId(usuario.getId(), productoId);
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }
}
