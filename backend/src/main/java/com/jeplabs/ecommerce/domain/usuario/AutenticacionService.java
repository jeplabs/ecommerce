package com.jeplabs.ecommerce.domain.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Este es el cerebro de usuarios. Contiene la lógica de negocio:
@Service
@RequiredArgsConstructor
public class AutenticacionService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;

    // Verifica que el email no este duplicado, hashea la contraseña con BCrypt antes de guardarla.
    @Transactional // no es necesario, llama explicitamente a repositorio.save(usuario), pero es buena práctica
    public DatosRespuestaUsuario registrar(DatosRegistro datos) {
        if (repositorio.existsByEmail(datos.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        String hash = passwordEncoder.encode(datos.password());
        Usuario usuario = new Usuario(datos, hash);
        repositorio.save(usuario);
        return new DatosRespuestaUsuario(usuario);
    }

    // Cambia roles
    @Transactional // Necesario para persistencia de datos, porque no tiene un repositorio.save() explicitamente
    public DatosRespuestaUsuario actualizarRol(Long id, DatosActualizarRol datos) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.actualizarRol(datos.rol());
        return new DatosRespuestaUsuario(usuario);
    }

    // Metodo que lista usuarios registrados
    public List<DatosRespuestaUsuario> listarUsuarios() {
        return repositorio.findAll()
                .stream()
                .map(DatosRespuestaUsuario::new)
                .toList();
    }

    // Metodo que busca al usuario por ID, si no existe lanza una excepcion.
    public DatosRespuestaUsuario buscarPorId(Long id) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        return new DatosRespuestaUsuario(usuario);
    }

    // Método que es llamado si el login es exitoso
    public void procesarLoginExitoso(String email) {
        loginAttemptService.loginExitoso(email);
    }

    // Método que es llamado si el login es fallido
    public void procesarLoginFallido(String email) {
        loginAttemptService.loginFallido(email);
    }

    // Llamar la verificacion antes de login
    public void verificarBloqueoExpirado(String email) {
        loginAttemptService.verificarBloqueoExpirado(email);
    }

    // Metodo para ver perfil, el email se extrae del token por medio de Authentication
    public DatosRespuestaUsuario verPerfil(String email) {
        Usuario usuario = repositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return new DatosRespuestaUsuario(usuario);
    }

    // Metodo para actualizar perfil, el email se extrae del token por medio de Authentication
    @Transactional  // Necesario para persistencia de datos, porque no tiene un repositorio.save() explicitamente
    public DatosRespuestaUsuario actualizarPerfil(String email, DatosActualizarPerfil datos) {
        Usuario usuario = repositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.actualizarPerfil(datos);
        return new DatosRespuestaUsuario(usuario);
    }

    // Actualizar estado del usuario activar/desactivar
    // email del admin autenticado viene como parámetro desde el controller, extraído del token
    @Transactional
    public DatosRespuestaUsuario actualizarEstado(
            Long id,
            DatosActualizarEstadoUsuario datos,
            String emailAdminAutenticado) {

        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        if (!datos.activo()) {

            // Validación 1: ¿Desactivar este usuario dejaría el sistema sin admins activos?
            if (usuario.getRol() == Rol.ROLE_ADMIN) {
                long adminsActivos = repositorio.countByRolAndActivo(Rol.ROLE_ADMIN, true);
                if (adminsActivos <= 1) {
                    throw new IllegalArgumentException(
                            "No es posible desactivar esta cuenta porque dejaría el sistema sin administradores activos");
                }
            }

            // Validación 2: ¿Es su propia cuenta?
            if (usuario.getEmail().equals(emailAdminAutenticado)) {
                throw new IllegalArgumentException("No puedes desactivar tu propia cuenta");
            }

            usuario.desactivar();
        } else {
            usuario.activar();
        }

        return new DatosRespuestaUsuario(usuario);
    }
}