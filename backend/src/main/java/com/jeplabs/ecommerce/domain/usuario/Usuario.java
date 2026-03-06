package com.jeplabs.ecommerce.domain.usuario;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

// Entidad Usuario, representa la tabla usuarios en la base de datos.
// Implementa UserDetails para que Spring Security pueda usarlos directamente
// en la autenticación.
@Entity
@Table(name = "usuarios")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String apellido;

    private String pais;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    private boolean activo;

    private Integer intentosFallidos;

    private boolean bloqueado;

    private LocalDateTime ultimoIntentoFallido;

    public Usuario(DatosRegistro datos, String passwordHash) {
        this.nombre = datos.nombre();
        this.apellido = datos.apellido();
        this.pais = datos.pais();
        this.email = datos.email();
        this.password = passwordHash;
        this.rol = Rol.ROLE_CUSTOMER; // siempre CUSTOMER por defecto
        this.activo = true;
        this.intentosFallidos = 0;
        this.bloqueado = false;
        this.ultimoIntentoFallido = null;
    }

    public void actualizarRol(Rol nuevoRol) {
        this.rol = nuevoRol;
    }

    public void registrarIntentoFallido() {
        this.ultimoIntentoFallido = LocalDateTime.now();
        this.intentosFallidos++;
        if (this.intentosFallidos >= 3) {
            this.bloqueado = true;
        }
    }

    public void resetearIntentos() {
        this.intentosFallidos = 0;
        this.bloqueado = false;
        this.ultimoIntentoFallido = null;
    }

    // Verificar si el bloqueo temporal ya expiró (30 minutos)
    public boolean bloqueoExpirado(long minutos) {
        if (ultimoIntentoFallido == null) return false;
        return LocalDateTime.now().isAfter(ultimoIntentoFallido.plusMinutes(minutos));
    }

    // Metodo para actualizar perfil
    public void actualizarPerfil(DatosActualizarPerfil datos) {
        this.nombre = datos.nombre();
        this.apellido = datos.apellido();
        this.pais = datos.pais();
    }

    // UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(rol.name()));
    }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    // Devuelve el valor actual de bloqueado.
    @Override
    public boolean isAccountNonLocked() {
        return !bloqueado;
    }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return activo; }
}