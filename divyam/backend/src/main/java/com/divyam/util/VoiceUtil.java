package com.divyam.util;

/**
 * Utility helpers for voice-related features.
 *
 * In the hackathon prototype we keep it minimal; in production you would
 * integrate ASR/NLU to map commands to actions.
 */
public final class VoiceUtil {

  private VoiceUtil() {
  }

  /**
   * Normalizes text so it can be compared against known voice commands.
   */
  public static String normalizeCommand(String input) {
    if (input == null) return "";
    return input
        .trim()
        .toLowerCase()
        .replaceAll("[^a-z0-9 ]", " ")
        .replaceAll("\\s+", " ");
  }
}
