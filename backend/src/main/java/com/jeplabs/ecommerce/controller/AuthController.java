package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.usuario.AutenticacionService;
import com.jeplabs.ecommerce.domain.usuario.DatosActualizarRol;
import com.jeplabs.ecommerce.domain.usuario.DatosRegistro;
import com.jeplabs.ecommerce.domain.usuario.DatosRespuestaUsuario;
import com.jpelabs.ecommerce.domain.usuario.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AutenticacionService service;

    @PostMapping("/register")
    public ResponseEntity<DatosRespuestaUsuario> registrar(
            @RequestBody @Valid DatosRegistro datos,
            UriComponentsBuilder uriBuilder) {

        DatosRespuestaUsuario respuesta = service.registrar(datos);
        var uri = uriBuilder.path("/api/usuarios/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    // Solo ADMIN puede cambiar roles
    @PatchMapping("/usuarios/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaUsuario> actualizarRol(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarRol datos) {
        return ResponseEntity.ok(service.actualizarRol(id, datos));
    }
}
