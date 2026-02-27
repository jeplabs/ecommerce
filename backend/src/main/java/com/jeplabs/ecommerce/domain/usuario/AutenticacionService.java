package com.jeplabs.ecommerce.domain.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

// Este es el cerebro de usuarios. Contiene la lógica de negocio:
@Service
@RequiredArgsConstructor
public class AutenticacionService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;

    // Verifica que el email no este duplicado, hashea la contraseña con BCrypt antes de guardarla.
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
}