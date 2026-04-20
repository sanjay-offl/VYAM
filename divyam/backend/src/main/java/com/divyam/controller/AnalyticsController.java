package com.divyam.controller;

import com.divyam.model.User;
import com.divyam.repository.UserRepository;
import com.divyam.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Analytics + AI-ready APIs.
 *
 * Routes:
 * - GET /api/analytics/summary
 * - GET /api/analytics/ai/emotion (TensorFlow placeholder)
 * - GET /api/analytics/ai/engagement (OpenCV placeholder)
 *
 * Also provides:
 * - GET /api/health
 */
@RestController
@CrossOrigin
public class AnalyticsController {

  private final AnalyticsService analyticsService;
  private final UserRepository userRepository;

  public AnalyticsController(AnalyticsService analyticsService, UserRepository userRepository) {
    this.analyticsService = analyticsService;
    this.userRepository = userRepository;
  }

  @GetMapping("/api/health")
  public ResponseEntity<?> health() {
    return ResponseEntity.ok(Map.of("status", "ok", "service", "divyam-backend"));
  }

  @GetMapping("/api/analytics/summary")
  public ResponseEntity<?> summary(Authentication authentication) {
    if (authentication == null) {
      return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    User user = userRepository.findByEmail(authentication.getName())
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    return ResponseEntity.ok(analyticsService.summaryFor(user));
  }

  @GetMapping("/api/analytics/ai/emotion")
  public ResponseEntity<?> emotion() {
    return ResponseEntity.ok(analyticsService.emotionMock());
  }

  @GetMapping("/api/analytics/ai/engagement")
  public ResponseEntity<?> engagement() {
    return ResponseEntity.ok(analyticsService.engagementMock());
  }

}
