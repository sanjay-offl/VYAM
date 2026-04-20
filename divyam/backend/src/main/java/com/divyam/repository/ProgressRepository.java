package com.divyam.repository;

import com.divyam.model.Progress;
import com.divyam.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
  List<Progress> findAllByUser(User user);
}
