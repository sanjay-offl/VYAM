package com.divyam;

import com.divyam.model.Lecture;
import com.divyam.model.User;
import com.divyam.repository.LectureRepository;
import com.divyam.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

/**
 * DIVYAM Backend entry point.
 *
 * Provides:
 * - JWT-secured REST APIs
 * - PostgreSQL persistence via JPA/Hibernate
 * - Seed data for hackathon/demo usage
 */
@SpringBootApplication
public class DivyamApplication {

  public static void main(String[] args) {
    SpringApplication.run(DivyamApplication.class, args);
  }

  /**
   * Seed demo users and one lecture for a smooth hackathon setup.
   */
  @Bean
  CommandLineRunner seed(UserRepository userRepository,
                         LectureRepository lectureRepository,
                         PasswordEncoder passwordEncoder) {
    return args -> {
      Optional<User> maybeStudent = userRepository.findByEmail("student@divyam.local");
      User student = maybeStudent.orElseGet(() -> {
        User u = new User();
        u.setName("Demo Student");
        u.setEmail("student@divyam.local");
        u.setRole(User.Role.STUDENT);
        u.setPassword(passwordEncoder.encode("student123"));
        return userRepository.save(u);
      });

      Optional<User> maybeTeacher = userRepository.findByEmail("teacher@divyam.local");
      User teacher = maybeTeacher.orElseGet(() -> {
        User u = new User();
        u.setName("Demo Teacher");
        u.setEmail("teacher@divyam.local");
        u.setRole(User.Role.TEACHER);
        u.setPassword(passwordEncoder.encode("teacher123"));
        return userRepository.save(u);
      });

      // Add one lecture only if none exist yet.
      if (lectureRepository.count() == 0) {
        Lecture lec = new Lecture();
        lec.setTitle("Basics of Computers (Accessible Notes)");
        lec.setDescription("Keyboard shortcuts, screen reader navigation, and safe browsing.");
        lec.setUrl("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4");
        lec.setTeacher(teacher);
        lectureRepository.save(lec);
      }

      // Keep references to avoid unused warnings in some IDEs.
      if (student.getId() == null || teacher.getId() == null) {
        throw new IllegalStateException("Seed users not created");
      }
    };
  }
}
