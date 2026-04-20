package com.divyam.security;

import com.divyam.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * JWT utility for issuing and validating tokens.
 */
@Component
public class JwtUtil {

  private final SecretKey secretKey;
  private final long expirationSeconds;

  public JwtUtil(@Value("${divyam.jwt.secret}") String secret,
                 @Value("${divyam.jwt.expirationSeconds}") long expirationSeconds) {
    // Ensure key length is sufficient for HS256.
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationSeconds = expirationSeconds;
  }

  public String generateToken(User user) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(expirationSeconds);

    return Jwts.builder()
        .setSubject(user.getEmail())
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(exp))
        .claim("role", user.getRole().name())
        .signWith(secretKey, SignatureAlgorithm.HS256)
        .compact();
  }

  public boolean validateToken(String token) {
    try {
      getAllClaims(token);
      return true;
    } catch (Exception ex) {
      return false;
    }
  }

  public String extractEmail(String token) {
    return getAllClaims(token).getSubject();
  }

  public String extractRole(String token) {
    Object role = getAllClaims(token).get("role");
    return role != null ? role.toString() : "";
  }

  private Claims getAllClaims(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody();
  }
}
