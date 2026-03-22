package com.jeplabs.ecommerce.domain.usuario;

// DTO con datos que devuelve al usuario al entrar a perfil
// No expone la contraseña, ni el hash de la contraseña.
public record DatosRespuestaUsuario(
        Long id,
        String nombre,
        String apellido,
        String email,
        String pais,
        String rol
) {
    public DatosRespuestaUsuario(Usuario usuario) {
        this(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getPais(),
                usuario.getRol().name());
    }
}
