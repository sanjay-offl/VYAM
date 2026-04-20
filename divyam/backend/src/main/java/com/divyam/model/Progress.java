package com.divyam.model;

import jakarta.persistence.*;

/**
 * Progress entity.
 *
 * Schema requirement:
 * progress(id, user_id, lecture_id, completion)
 */
@Entity
@Table(
    name = "progress",
    uniqueConstraints = @UniqueConstraint(name = "uk_progress_user_lecture", columnNames = {"user_id", "lecture_id"})
)
public class Progress {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "lecture_id", nullable = false)
  private Lecture lecture;

  /**
   * Completion percentage expressed as 0..1.
   */
  @Column(nullable = false)
  private double completion;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public Lecture getLecture() {
    return lecture;
  }

  public void setLecture(Lecture lecture) {
    this.lecture = lecture;
  }

  public double getCompletion() {
    return completion;
  }

  public void setCompletion(double completion) {
    this.completion = completion;
  }
}
