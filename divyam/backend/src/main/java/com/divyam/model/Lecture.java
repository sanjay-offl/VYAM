package com.divyam.model;

import jakarta.persistence.*;

/**
 * Lecture entity.
 *
 * Schema requirement:
 * lectures(id, title, url, teacher_id)
 */
@Entity
@Table(name = "lectures")
public class Lecture {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  /**
   * Optional: useful for the UI (not strictly required by the schema).
   */
  @Column
  private String description;

  /**
   * Public URL or local static path (e.g., /uploads/...).
   */
  @Column(nullable = false)
  private String url;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "teacher_id", nullable = false)
  private User teacher;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public User getTeacher() {
    return teacher;
  }

  public void setTeacher(User teacher) {
    this.teacher = teacher;
  }
}
