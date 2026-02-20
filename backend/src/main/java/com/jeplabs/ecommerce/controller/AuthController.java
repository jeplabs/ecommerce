package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.dto.AuthResponse;
import com.jeplabs.ecommerce.dto.RegisterRequest;
import com.jeplabs.ecommerce.entity.User;
import com.jeplabs.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Indica que esta clase maneja peticiones HTTP y retorna JSON automáticamente
@RequestMapping("/api/auth") // Prefijo base para todos los endpoints de este controlador
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // POST /api/auth/register
    // Recibe los datos del nuevo usuario y lo registra en la DB
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    // POST /api/auth/login
    // Recibe email y contraseña, verifica las credenciales y retorna confirmación
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    // GET /api/auth/users
    // Retorna la lista de todos los usuarios registrados en la DB
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/auth/users/{id}
    // Busca y retorna un usuario específico por su ID
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // DELETE /api/auth/users/{id}
    // Elimina un usuario de la DB por su ID
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Usuario eliminado correctamente");
    }
}