package com.divyam.service;

import com.divyam.model.Progress;
import com.divyam.model.User;
import com.divyam.repository.ProgressRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Analytics + AI-ready endpoints.
 *
 * For hackathon prototype:
 * - compute a simple summary from Progress records
 * - return mock AI predictions (emotion / engagement)
 */
@Service
public class AnalyticsService {

  private final ProgressRepository progressRepository;

  public AnalyticsService(ProgressRepository progressRepository) {
    this.progressRepository = progressRepository;
  }

  public Map<String, Object> summaryFor(User user) {
    List<Progress> progressList = progressRepository.findAllByUser(user);

    long completed = progressList.stream().filter(p -> p.getCompletion() >= 1.0).count();
    double avgCompletion = progressList.isEmpty()
        ? 0.25
        : progressList.stream().mapToDouble(Progress::getCompletion).average().orElse(0.25);

    // Keep a stable, demo-friendly number.
    int minutesWatched = Math.max(15, (int) Math.round(progressList.size() * 18 + avgCompletion * 40));
    double engagementScore = Math.min(0.95, Math.max(0.35, avgCompletion * 0.9 + 0.1));

    Map<String, Object> summary = new HashMap<>();
    summary.put("completedLectures", completed);
    summary.put("minutesWatched", minutesWatched);
    summary.put("engagementScore", engagementScore);

    Map<String, Object> wrapper = new HashMap<>();
    wrapper.put("summary", summary);
    return wrapper;
  }

  public Map<String, Object> emotionMock() {
    Map<String, Object> result = new HashMap<>();
    result.put("model", "tensorflow-placeholder");
    result.put("emotion", "focused");
    result.put("confidence", 0.78);

    Map<String, Object> wrapper = new HashMap<>();
    wrapper.put("result", result);
    return wrapper;
  }

  public Map<String, Object> engagementMock() {
    Map<String, Object> result = new HashMap<>();
    result.put("model", "opencv-placeholder");
    result.put("engagement", "high");
    result.put("score", 0.81);

    Map<String, Object> wrapper = new HashMap<>();
    wrapper.put("result", result);
    return wrapper;
  }
}
