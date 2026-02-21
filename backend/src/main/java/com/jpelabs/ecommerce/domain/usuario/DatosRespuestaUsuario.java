package com.jpelabs.ecommerce.domain.usuario;

public record DatosRespuestaUsuario(
        Long id,
        String nombre,
        String email,
        String rol
) {
    public DatosRespuestaUsuario(Usuario usuario) {
        this(usuario.getId(), usuario.getNombre(), usuario.getEmail(), usuario.getRol().name());
    }
}
