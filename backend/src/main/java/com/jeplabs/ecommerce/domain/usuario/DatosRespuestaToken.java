package com.jeplabs.ecommerce.domain.usuario;

// DTO de respuesta al hacer login, devuel token y los otros datos necesarios para frontend.
public record DatosRespuestaToken(
        String token,
        String tipo,
        Long id,
        String nombre,
        String apellido,
        String email,
        String rol
) {
    public DatosRespuestaToken(String token, Usuario usuario) {
        this(
                token,
                "Bearer",
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getRol().name()
        );
    }
}