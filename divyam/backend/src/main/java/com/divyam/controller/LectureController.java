package com.divyam.controller;

import com.divyam.model.Lecture;
import com.divyam.model.User;
import com.divyam.repository.UserRepository;
import com.divyam.service.LectureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Lecture APIs.
 *
 * Routes:
 * - GET  /api/videos
 * - POST /api/videos (TEACHER) multipart upload
 */
@RestController
@CrossOrigin
@RequestMapping("/api/videos")
public class LectureController {

  private final LectureService lectureService;
  private final UserRepository userRepository;

  public LectureController(LectureService lectureService, UserRepository userRepository) {
    this.lectureService = lectureService;
    this.userRepository = userRepository;
  }

  @GetMapping
  public ResponseEntity<?> list() {
    List<Lecture> lectures = lectureService.listAll();

    List<Map<String, Object>> items = lectures.stream().map(l -> {
      Map<String, Object> m = new HashMap<>();
      m.put("id", "lec-" + l.getId());
      m.put("title", l.getTitle());
      m.put("description", l.getDescription());
      // Return absolute URL for dev frontend at :5173.
      m.put("src", l.getUrl() != null && (l.getUrl().startsWith("http://") || l.getUrl().startsWith("https://"))
          ? l.getUrl()
          : "http://localhost:8080" + l.getUrl());
      m.put("teacherId", l.getTeacher() != null ? l.getTeacher().getId() : null);
      return m;
    }).toList();

    return ResponseEntity.ok(Map.of("lectures", items));
  }

  @PreAuthorize("hasRole('TEACHER')")
  @PostMapping(consumes = {"multipart/form-data"})
  public ResponseEntity<?> upload(Authentication authentication,
                                  @RequestParam("title") String title,
                                  @RequestParam(value = "description", required = false) String description,
                                  @RequestParam("file") MultipartFile file) throws IOException {
    if (authentication == null) {
      return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }

    String email = authentication.getName();
    User teacher = userRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

    if (title == null || title.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
    }
    if (file == null || file.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
    }

    // Save uploaded file to ./uploads
    Path uploadsDir = Paths.get("uploads");
    Files.createDirectories(uploadsDir);

    String originalFilename = file.getOriginalFilename();
    if (originalFilename == null || originalFilename.isBlank()) {
      originalFilename = "lecture.mp4";
    }
    String original = StringUtils.cleanPath(originalFilename);
    String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
    String filename = Instant.now().toEpochMilli() + "_" + safeName;

    Path target = uploadsDir.resolve(filename);
    Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

    String url = "/uploads/" + filename;

    Lecture created = lectureService.createLecture(teacher, title.trim(), description, url);

    Map<String, Object> response = new HashMap<>();
    response.put("id", "lec-" + created.getId());
    response.put("title", created.getTitle());
    response.put("description", created.getDescription());
    response.put("src", "http://localhost:8080" + created.getUrl());

    return ResponseEntity.ok(response);
  }
}
