package com.divyam.controller;

import com.divyam.dto.AuthResponse;
import com.divyam.dto.LoginRequest;
import com.divyam.model.User;
import com.divyam.repository.UserRepository;
import com.divyam.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Auth endpoints.
 *
 * Routes:
 * - POST /api/auth/login
 * - POST /api/auth/register
 *
 * Also provides:
 * - GET /api/users/me (kept here to match the required file list)
 */
@RestController
@CrossOrigin
@RequestMapping("/api")
public class AuthController {

  private final AuthService authService;
  private final UserRepository userRepository;

  public AuthController(AuthService authService, UserRepository userRepository) {
    this.authService = authService;
    this.userRepository = userRepository;
  }

  @PostMapping("/auth/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    try {
      AuthResponse response = authService.login(request);
      return ResponseEntity.ok(response);
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "Invalid credentials"));
    }
  }

  @PostMapping("/auth/register")
  public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
    try {
      String name = String.valueOf(body.getOrDefault("name", "")).trim();
      String email = String.valueOf(body.getOrDefault("email", "")).trim();
      String password = String.valueOf(body.getOrDefault("password", "")).trim();
      String role = String.valueOf(body.getOrDefault("role", "STUDENT")).trim();

      if (name.isBlank() || email.isBlank() || password.isBlank()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Missing fields"));
      }

      AuthResponse response = authService.register(name, email, password, role);
      return ResponseEntity.ok(response);
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
  }

  @GetMapping(path = "/users/me")
  public ResponseEntity<?> me(Authentication authentication) {
    if (authentication == null || authentication.getName() == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
    }

    String email = authentication.getName();
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    AuthResponse.UserInfo info = new AuthResponse.UserInfo();
    info.setId(user.getId());
    info.setName(user.getName());
    info.setEmail(user.getEmail());
    info.setRole(user.getRole().name());

    Map<String, Object> response = new HashMap<>();
    response.put("user", info);

    return ResponseEntity.ok(response);
  }
}
