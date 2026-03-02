package com.jeplabs.ecommerce.infra.exceptions;

import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

// Intercepta excepciones globalmente.
@RestControllerAdvice
public class GestorDeErrores {

    // MethodArgumentNotValidException es la excepcion que lanza todas las validaciones
    // incluyendo @NotBlank, @Size y @ValidPassword, y más.
    // Envía un JSON, por ejemplo:
    // {
    //    "password": "La contrasena debe tener al menos una mayúscula, un numero y un caracter especial",
    //    "confirmarPassword": "Las contraseñas no coinciden"
    // }
    // o
    // {
    //    "password": La contrasena debe tener al menos 8 caracteres | La contrasena debe tener al menos
    // una mayuscula, un numero y un caracter especial"
    // }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(
            MethodArgumentNotValidException ex) {
        Map<String, String> errores = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (mensajeExistente, mensajeNuevo) -> mensajeExistente + " | " + mensajeNuevo
                ));

        return ResponseEntity.badRequest().body(errores);
    }

    // Maneja credenciales incorrectas en Login.
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> manejarCredencialesInvalidas(
            BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Email o contraseña incorrectos"));
    }

    // Devuelve un JSON con los campos inválidos, como email duplicado
    // Devuelve un JSON cuando no encuentra un usuario con un determinado ID
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> manejarIllegalArgument(
            IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // Manejo para usuario desactivado
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> manejarUsuarioDesactivado(
            DisabledException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tu cuenta ha sido desactivada, contacta al administrador"));
    }

    // Manejo de errores al enviar un JSON con error en su formato esperado, en registro usuarios.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> manejarJsonInvalido(
            HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "El JSON enviado tiene un error de formato, verifica que tenga comas, llaves y comillas correctas"));
    }
}