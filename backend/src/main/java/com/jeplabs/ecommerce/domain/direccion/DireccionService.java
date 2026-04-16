package com.jeplabs.ecommerce.domain.direccion;

import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DireccionService {

    private final DireccionRepository direccionRepositorio;
    private final UsuarioRepository usuarioRepositorio;

    // Lista direcciones activas del usuario autenticado
    public List<DatosRespuestaDireccion> listar(String email) {
        Usuario usuario = buscarUsuarioPorEmail(email);
        return direccionRepositorio
                .findByUsuarioIdAndActivoTrueOrderByPrincipalDesc(usuario.getId())
                .stream()
                .map(DatosRespuestaDireccion::new)
                .toList();
    }

    // Lista direcciones de cualquier usuario (solo admin)
    public List<DatosRespuestaDireccion> listarPorUsuario(Long usuarioId) {
        buscarUsuarioPorId(usuarioId);
        return direccionRepositorio
                .findByUsuarioIdAndActivoTrueOrderByPrincipalDesc(usuarioId)
                .stream()
                .map(DatosRespuestaDireccion::new)
                .toList();
    }

    @Transactional
    public DatosRespuestaDireccion crear(String email, DatosCrearDireccion datos) {
        Usuario usuario = buscarUsuarioPorEmail(email);

        // Si se marca como principal o es la primera dirección, resetea las demás
        boolean esPrimera = !direccionRepositorio.existsByUsuarioIdAndActivoTrue(usuario.getId());
        if (datos.principal() || esPrimera) {
            direccionRepositorio.resetearPrincipal(usuario.getId());
        }

        Direccion direccion = new Direccion(usuario, datos);

        // Si es la primera dirección siempre será principal
        if (esPrimera) {
            direccion.marcarComoPrincipal();
        }

        direccionRepositorio.save(direccion);
        return new DatosRespuestaDireccion(direccion);
    }

    @Transactional
    public DatosRespuestaDireccion actualizar(String email, Long id, DatosActualizarDireccion datos) {
        Usuario usuario = buscarUsuarioPorEmail(email);
        Direccion direccion = buscarDireccionDelUsuario(id, usuario.getId());
        direccion.actualizar(datos);
        return new DatosRespuestaDireccion(direccion);
    }

    @Transactional
    public DatosRespuestaDireccion cambiarPrincipal(String email, Long id) {
        Usuario usuario = buscarUsuarioPorEmail(email);
        Direccion direccion = buscarDireccionDelUsuario(id, usuario.getId());

        direccionRepositorio.resetearPrincipal(usuario.getId());
        direccion.marcarComoPrincipal();

        return new DatosRespuestaDireccion(direccion);
    }

    // Borrado lógico
    @Transactional
    public void eliminar(String email, Long id) {
        Usuario usuario = buscarUsuarioPorEmail(email);
        Direccion direccion = buscarDireccionDelUsuario(id, usuario.getId());
        direccion.desactivar();

        // Si era la principal y hay otras, asigna la más reciente como principal
        List<Direccion> restantes = direccionRepositorio
                .findByUsuarioIdAndActivoTrueOrderByPrincipalDesc(usuario.getId());

        if (!restantes.isEmpty()) {
            restantes.get(0).marcarComoPrincipal();
        }
    }

    // Métodos privados reutilizables
    private Usuario buscarUsuarioPorEmail(String email) {
        return usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private Usuario buscarUsuarioPorId(Long id) {
        return usuarioRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
    }

    private Direccion buscarDireccionDelUsuario(Long direccionId, Long usuarioId) {
        return direccionRepositorio.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Dirección no encontrada con ID: " + direccionId));
    }
}