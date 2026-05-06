/**
 * Emotion Detection Engine
 * Simulates real-time emotion analysis with realistic data patterns
 */

// Emotion confidence baseline (can be enhanced with real ML models later)
const emotionMap = {
  happy: { emoji: '😊', color: '#10B981', borderColor: '#059669' },
  focused: { emoji: '🎯', color: '#3B82F6', borderColor: '#1D4ED8' },
  confused: { emoji: '😕', color: '#F59E0B', borderColor: '#D97706' },
  tired: { emoji: '😴', color: '#8B5CF6', borderColor: '#6D28D9' },
  neutral: { emoji: '😐', color: '#6B7280', borderColor: '#4B5563' },
}

// Simulate real-time emotion detection with face tracking
export class EmotionEngine {
  constructor() {
    this.emotionHistory = []
    this.currentEmotion = 'neutral'
    this.confidenceScore = 0.75
    this.smoothedConfidence = 0.75
    this.pendingEmotion = null
    this.pendingCount = 0
    this.lastSwitchAt = 0
    this.faceLandmarks = []
    this.eyeAspectRatio = 0.3
    this.headPose = { yaw: 0, pitch: 0, roll: 0 }
    this.attentionLevel = 70
    this.engagementScore = 75
  }

  // Analyze emotion based on face landmarks, head pose, and optional external emotion
  analyzeEmotion(landmarks, headPose = {}, externalEmotion = null) {
    if (!landmarks || landmarks.length === 0) {
      return {
        emotion: 'neutral',
        confidence: 0,
        metrics: this.getDefaultMetrics(),
      }
    }

    this.faceLandmarks = landmarks
    this.headPose = headPose

    // Calculate eye aspect ratio (blink detection)
    const eyeAspectRatio = this.calculateEyeAspectRatio(landmarks)
    this.eyeAspectRatio = eyeAspectRatio

    // Determine emotion based on external model if available
    const externalResult = this.normalizeExternalEmotion(externalEmotion, landmarks, eyeAspectRatio)
    const candidateEmotion = externalResult?.emotion || this.classifyEmotion(landmarks, eyeAspectRatio, headPose)
    const rawConfidence = externalResult?.confidence ?? (Math.random() * 0.3 + 0.65) // 0.65-0.95 confidence

    // Smooth confidence to avoid jitter
    this.smoothedConfidence = this.smoothedConfidence * 0.7 + rawConfidence * 0.3

    // Hysteresis: require repeated high-confidence detections to switch
    const now = Date.now()
    let emotion = this.currentEmotion

    if (candidateEmotion !== this.currentEmotion) {
      if (this.pendingEmotion !== candidateEmotion) {
        this.pendingEmotion = candidateEmotion
        this.pendingCount = 1
      } else {
        this.pendingCount += 1
      }

      const canSwitch = this.smoothedConfidence >= 0.6
        && this.pendingCount >= 3
        && now - this.lastSwitchAt > 900

      if (canSwitch) {
        emotion = candidateEmotion
        this.currentEmotion = candidateEmotion
        this.lastSwitchAt = now
        this.pendingEmotion = null
        this.pendingCount = 0
      }
    } else {
      this.pendingEmotion = null
      this.pendingCount = 0
    }

    const confidence = this.smoothedConfidence

    // Update metrics
    this.updateMetrics(emotion, eyeAspectRatio, headPose)

    this.emotionHistory.push({
      emotion,
      confidence,
      timestamp: Date.now(),
    })

    // Keep history manageable
    if (this.emotionHistory.length > 300) {
      this.emotionHistory.shift()
    }

    this.currentEmotion = emotion
    this.confidenceScore = confidence

    return {
      emotion,
      confidence,
      metrics: {
        eyeMovement: this.eyeAspectRatio * 100,
        attentionLevel: this.attentionLevel,
        engagementScore: this.engagementScore,
        headPose: this.headPose,
      },
    }
  }

  // Normalize external emotion predictions into DIVYAM labels
  normalizeExternalEmotion(external, landmarks, eyeAspectRatio) {
    if (!external || typeof external !== 'object') return null
    if (!external.emotion) return null

    const mouthOpen = this.isMouthOpen(landmarks)
    let emotion = external.emotion
    let confidence = typeof external.confidence === 'number' ? external.confidence : null

    // If neutral but attentive, bias toward focused
    if (emotion === 'neutral' && eyeAspectRatio > 0.25 && !mouthOpen) {
      emotion = 'focused'
    }

    return { emotion, confidence }
  }

  // Calculate eye aspect ratio for blink/fatigue detection
  calculateEyeAspectRatio(landmarks) {
    if (landmarks.length < 48) return 0.3

    // Approximate eye region from landmarks
    // This is simplified; in production use proper eye landmark indices
    const leftEyeAvg = landmarks.slice(36, 42).reduce((sum, p) => sum + p.y, 0) / 6
    const rightEyeAvg = landmarks.slice(42, 48).reduce((sum, p) => sum + p.y, 0) / 6

    const ratio = Math.abs(leftEyeAvg - rightEyeAvg) * 0.01
    return Math.min(ratio, 1)
  }

  // Classify emotion based on facial features
  classifyEmotion(landmarks, eyeAspectRatio, headPose) {
    // Mouth region (48-68)
    const mouthOpen = this.isMouthOpen(landmarks)
    const smileStrength = this.detectSmile(landmarks)

    // Eye state
    const eyesClosed = eyeAspectRatio < 0.15
    const eyesWide = eyeAspectRatio > 0.4

    // Head position
    const lookingDown = headPose.pitch > 20
    const lookingUp = headPose.pitch < -20
    const headTilt = Math.abs(headPose.roll) > 15

    // Emotion logic
    if (eyesClosed || eyeAspectRatio < 0.2) {
      this.attentionLevel = Math.max(20, this.attentionLevel - 5)
      return 'tired'
    }

    if (smileStrength > 0.6) {
      this.attentionLevel = Math.min(100, this.attentionLevel + 3)
      return 'happy'
    }

    if (headTilt || eyesWide) {
      return 'confused'
    }

    if (lookingDown || !mouthOpen) {
      this.attentionLevel = Math.min(100, this.attentionLevel + 2)
      return 'focused'
    }

    return 'neutral'
  }

  // Detect if mouth is open
  isMouthOpen(landmarks) {
    if (landmarks.length < 68) return false
    const mouthPoints = landmarks.slice(48, 68)
    const topY = Math.min(...mouthPoints.map(p => p.y))
    const bottomY = Math.max(...mouthPoints.map(p => p.y))
    return Math.abs(bottomY - topY) > 15
  }

  // Detect smile strength
  detectSmile(landmarks) {
    if (landmarks.length < 68) return 0

    // Mouth corners (48, 54) and center (51)
    const leftCorner = landmarks[48]
    const rightCorner = landmarks[54]
    const centerMouth = landmarks[51]

    if (!leftCorner || !rightCorner || !centerMouth) return 0

    // Higher smile = corners lift up (lower Y) from center
    const leftLift = centerMouth.y - leftCorner.y
    const rightLift = centerMouth.y - rightCorner.y
    const avgLift = (leftLift + rightLift) / 2

    return Math.max(0, Math.min(1, avgLift / 10))
  }

  // Update attention and engagement metrics
  updateMetrics(emotion, eyeAspectRatio, headPose) {
    // Attention level influenced by eye aspect ratio
    const eyeAttention = eyeAspectRatio * 100
    this.attentionLevel = this.attentionLevel * 0.7 + eyeAttention * 0.3

    // Engagement based on emotional state
    const emotionEngagement = {
      happy: 85,
      focused: 95,
      confused: 40,
      tired: 20,
      neutral: 60,
    }

    this.engagementScore = this.engagementScore * 0.6 + (emotionEngagement[emotion] || 50) * 0.4

    // Clamp values
    this.attentionLevel = Math.max(0, Math.min(100, this.attentionLevel))
    this.engagementScore = Math.max(0, Math.min(100, this.engagementScore))
  }

  // Get emotion info (emoji, colors, etc.)
  getEmotionInfo(emotion = this.currentEmotion) {
    return emotionMap[emotion] || emotionMap.neutral
  }

  // Get historical data for charts
  getEmotionHistory(minutes = 5) {
    const now = Date.now()
    const timeWindow = minutes * 60 * 1000

    return this.emotionHistory
      .filter(h => now - h.timestamp < timeWindow)
      .map((h, idx) => ({
        time: idx,
        emotion: h.emotion,
        confidence: h.confidence,
        timestamp: h.timestamp,
      }))
  }

  // Get emotion distribution
  getEmotionDistribution() {
    const counts = {}
    const history = this.emotionHistory.slice(-100) // Last 100 entries

    history.forEach(h => {
      counts[h.emotion] = (counts[h.emotion] || 0) + 1
    })

    return Object.entries(counts).map(([emotion, count]) => ({
      emotion,
      percentage: ((count / history.length) * 100).toFixed(1),
      ...emotionMap[emotion],
    }))
  }

  // Get default metrics when no face detected
  getDefaultMetrics() {
    return {
      eyeMovement: 0,
      attentionLevel: 0,
      engagementScore: 0,
      headPose: { yaw: 0, pitch: 0, roll: 0 },
    }
  }

  // Reset engine
  reset() {
    this.emotionHistory = []
    this.currentEmotion = 'neutral'
    this.confidenceScore = 0
    this.smoothedConfidence = 0
    this.pendingEmotion = null
    this.pendingCount = 0
    this.lastSwitchAt = 0
    this.faceLandmarks = []
    this.eyeAspectRatio = 0.3
    this.attentionLevel = 70
    this.engagementScore = 75
  }
}

// Singleton instance
export const emotionEngine = new EmotionEngine()
