package com.divyam.service;

import com.divyam.model.Lecture;
import com.divyam.model.User;
import com.divyam.repository.LectureRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Lecture use-cases.
 */
@Service
public class LectureService {

  private final LectureRepository lectureRepository;

  public LectureService(LectureRepository lectureRepository) {
    this.lectureRepository = lectureRepository;
  }

  public List<Lecture> listAll() {
    return lectureRepository.findAll();
  }

  public Lecture createLecture(User teacher, String title, String description, String url) {
    Lecture lecture = new Lecture();
    lecture.setTeacher(teacher);
    lecture.setTitle(title);
    lecture.setDescription(description);
    lecture.setUrl(url);
    return lectureRepository.save(lecture);
  }
}
