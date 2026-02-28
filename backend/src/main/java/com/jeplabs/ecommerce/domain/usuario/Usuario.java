package com.jeplabs.ecommerce.domain.usuario;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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

    private Boolean activo;

    public Usuario(DatosRegistro datos, String passwordHash) {
        this.nombre = datos.nombre();
        this.email = datos.email();
        this.password = passwordHash;
        this.rol = Rol.ROLE_CUSTOMER; // siempre CUSTOMER por defecto
        this.activo = true;
    }

    public void actualizarRol(Rol nuevoRol) {
        this.rol = nuevoRol;
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

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return activo; }
}