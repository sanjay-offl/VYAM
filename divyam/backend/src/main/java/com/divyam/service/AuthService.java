package com.divyam.service;

import com.divyam.dto.AuthResponse;
import com.divyam.dto.LoginRequest;
import com.divyam.model.User;
import com.divyam.repository.UserRepository;
import com.divyam.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Authentication use-cases:
 * - login (issue JWT)
 * - register (create user + issue JWT)
 */
@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  public AuthService(UserRepository userRepository,
                     PasswordEncoder passwordEncoder,
                     JwtUtil jwtUtil) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
  }

  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    return toAuthResponse(user);
  }

  public AuthResponse register(String name, String email, String password, String role) {
    String normalizedEmail = Objects.requireNonNull(email, "email").trim().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
      throw new IllegalArgumentException("Email already registered");
    }

    User user = new User();
    user.setName(Objects.requireNonNull(name, "name").trim());
    user.setEmail(normalizedEmail);
    user.setPassword(passwordEncoder.encode(Objects.requireNonNull(password, "password")));

    User.Role parsedRole;
    try {
      parsedRole = User.Role.valueOf(Objects.requireNonNull(role, "role").trim().toUpperCase());
    } catch (Exception ex) {
      parsedRole = User.Role.STUDENT;
    }
    user.setRole(parsedRole);

    userRepository.save(user);

    return toAuthResponse(user);
  }

  public AuthResponse toAuthResponse(User user) {
    String token = jwtUtil.generateToken(user);

    AuthResponse.UserInfo info = new AuthResponse.UserInfo();
    info.setId(user.getId());
    info.setName(user.getName());
    info.setEmail(user.getEmail());
    info.setRole(user.getRole().name());

    return new AuthResponse(token, info);
  }
}
