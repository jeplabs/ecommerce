package com.jeplabs.ecommerce.domain.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutenticacionService implements UserDetailsService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repositorio.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    public DatosRespuestaUsuario registrar(DatosRegistro datos) {
        if (repositorio.existsByEmail(datos.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        String hash = passwordEncoder.encode(datos.password());
        Usuario usuario = new Usuario(datos, hash);
        repositorio.save(usuario);
        return new DatosRespuestaUsuario(usuario);
    }

    public DatosRespuestaUsuario actualizarRol(Long id, DatosActualizarRol datos) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuario.actualizarRol(datos.rol());
        return new DatosRespuestaUsuario(usuario);
    }
}