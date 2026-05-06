import React, { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { Camera, Eye, Brain, Sparkles } from 'lucide-react'
import EmotionCard from './emotion/EmotionCard.jsx'
import AttentionMeter from './emotion/AttentionMeter.jsx'
import EngagementRing from './emotion/EngagementRing.jsx'
import EmotionTimeline from './emotion/EmotionTimeline.jsx'
import TeacherAnalyticsView from './emotion/TeacherAnalyticsView.jsx'
import { emotionEngine } from '../utils/emotionEngine.js'
import { drawFaceBoundingBox, drawTrackingPoints, drawFaceMesh, drawScanningEffect, generateTrackingPoints, smoothLandmarks, smoothBox } from '../utils/faceTrackingUtils.js'

export default function EmotionTracker() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const faceApiRef = useRef(null)
  const lastDetectionRef = useRef({ landmarks: null, box: null, expressions: null })
  const lastDetectAtRef = useRef(0)
  const lastEmotionUpdateRef = useRef(0)
  const smoothedLandmarksRef = useRef(null)
  const smoothedBoxRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [trackingMode, setTrackingMode] = useState('loading')
  const [sheetSnap, setSheetSnap] = useState(2)
  const [emotionState, setEmotionState] = useState({
    emotion: 'neutral',
    confidence: 0,
    metrics: {
      attentionLevel: 0,
      eyeMovement: 0,
      engagementScore: 0,
    },
  })
  const [expressionDebug, setExpressionDebug] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const snapPoints = [0, 220, 420]
  const sheetY = useMotionValue(snapPoints[2])

  // Initialize webcam
  useEffect(() => {
    let stream

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setIsActive(true)
        setLoading(false)
      } catch (err) {
        console.error('Camera access denied:', err)
        setLoading(false)
      }
    }

    setupCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Load face-api.js models (falls back to mock tracking if unavailable)
  useEffect(() => {
    let cancelled = false

    async function loadModels() {
      try {
        const tf = await import('@tensorflow/tfjs')
        await import('@tensorflow/tfjs-backend-webgl')
        await tf.setBackend('webgl')
        await tf.ready()

        const faceapi = await import('face-api.js')
        faceApiRef.current = faceapi

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models/emotion'),
        ])

        if (!cancelled) setTrackingMode('real')
      } catch (err) {
        console.warn('Face models unavailable, using simulated tracking.', err)
        if (!cancelled) setTrackingMode('mock')
      }
    }

    loadModels()
    return () => { cancelled = true }
  }, [])

  // Real-time face detection + tracking (face-api.js with mock fallback)
  useEffect(() => {
    let animationFrame
    let time = 0

    function animate() {
      time += 16

      if (canvasRef.current && videoRef.current && isActive) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        // Resize canvas to match video
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight

        let landmarks = null
        let faceBox = null
        let externalEmotion = null

        const now = performance.now()
        const canDetect = now - lastDetectAtRef.current > 120
        const faceapi = faceApiRef.current
        const videoReady = videoRef.current.readyState >= 2

        if (trackingMode === 'real' && faceapi && videoReady && canDetect) {
          lastDetectAtRef.current = now
          faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }),
            )
            .withFaceLandmarks()
            .withFaceExpressions()
            .then((result) => {
              if (!result) {
                lastDetectionRef.current = { landmarks: null, box: null, expressions: null }
                return
              }

              lastDetectionRef.current = {
                landmarks: result.landmarks.positions.map((p) => ({ x: p.x, y: p.y })),
                box: result.detection.box,
                expressions: result.expressions || null,
              }
            })
            .catch(() => {
              lastDetectionRef.current = { landmarks: null, box: null, expressions: null }
            })
        }

        if (trackingMode === 'mock') {
          landmarks = generateMockLandmarks(canvas.width, canvas.height)
          faceBox = {
            x: canvas.width * 0.3,
            y: canvas.height * 0.2,
            width: canvas.width * 0.4,
            height: canvas.height * 0.5,
          }
        } else {
          landmarks = lastDetectionRef.current.landmarks
          faceBox = lastDetectionRef.current.box
          const expressions = lastDetectionRef.current.expressions
          if (expressions) {
            const ranked = Object.entries(expressions)
              .map(([label, score]) => ({ label, score }))
              .sort((a, b) => b.score - a.score)
            const top = ranked[0]
            if (top) {
              externalEmotion = {
                emotion: mapExpressionToDivyam(top.label),
                confidence: top.score,
              }
            }
            setExpressionDebug(ranked)
          }
        }

        if (landmarks && faceBox) {
          smoothedLandmarksRef.current = smoothLandmarks(smoothedLandmarksRef.current, landmarks, 0.7)
          smoothedBoxRef.current = smoothBox(smoothedBoxRef.current, faceBox, 0.6)
          landmarks = smoothedLandmarksRef.current
          faceBox = smoothedBoxRef.current
        }

        if (now - lastEmotionUpdateRef.current > 140) {
          lastEmotionUpdateRef.current = now
          const analysis = emotionEngine.analyzeEmotion(landmarks || [], {
            yaw: Math.sin(time * 0.001) * 5,
            pitch: Math.cos(time * 0.001) * 8,
            roll: Math.sin(time * 0.001) * 3,
          }, externalEmotion)

          setEmotionState(analysis)
        }

        // Draw overlays
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (landmarks && landmarks.length) {
          const points = generateTrackingPoints(landmarks, canvas.width, canvas.height)
          drawFaceMesh(ctx, landmarks)
          drawTrackingPoints(ctx, points, time)
          drawFaceBoundingBox(ctx, faceBox, time)
        }
        drawScanningEffect(ctx, canvas.width, canvas.height, time)
      }

      animationFrame = requestAnimationFrame(animate)
    }

    if (isActive) {
      animationFrame = requestAnimationFrame(animate)
    }

    return () => cancelAnimationFrame(animationFrame)
  }, [isActive])

  // Voice announcements for emotion changes
  useEffect(() => {
    if (!voiceEnabled || !emotionState.emotion) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const utterance = new SpeechSynthesisUtterance(`Emotion detected: ${emotionState.emotion}`)
    utterance.rate = 1
    utterance.pitch = 1.1
    utterance.volume = 0.7

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [emotionState.emotion, voiceEnabled])

  function snapTo(index) {
    setSheetSnap(index)
    animate(sheetY, snapPoints[index], { type: 'spring', stiffness: 260, damping: 28 })
  }

  function getClosestSnap(currentY, velocityY) {
    if (velocityY > 700) return 2
    if (velocityY < -700) return 0

    let closest = 0
    let minDistance = Infinity
    snapPoints.forEach((point, idx) => {
      const distance = Math.abs(point - currentY)
      if (distance < minDistance) {
        minDistance = distance
        closest = idx
      }
    })

    return closest
  }


  return (
    <div className="space-y-6">
      {/* Main Emotion Tracking UI */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Webcam Feed + Tracking */}
        <motion.div
          className="relative rounded-3xl border border-purple-200/40 bg-white/60 p-4 backdrop-blur-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-purple-200/50 bg-white/70 px-3 py-1 text-sm text-purple-700 shadow">
            <Camera size={16} />
            {isActive ? (trackingMode === 'real' ? 'Live Tracking' : 'Live Tracking (Simulated)') : 'Camera Off'}
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-purple-200/50 bg-white/70 px-3 py-1 text-sm text-purple-700 shadow">
            <Sparkles size={16} />
            AI Emotion Scan
          </div>

          {loading ? (
            <div className="flex h-[360px] items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100/50 to-indigo-100/50">
              <div className="space-y-4 text-center">
                <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-purple-400/30" />
                <p className="text-sm text-gray-600">Initializing AI Vision...</p>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                aria-label="Live webcam feed"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute left-0 top-0 h-full w-full"
                aria-hidden="true"
              />

              {expressionDebug && expressionDebug.length > 0 && (
                <div
                  className="absolute right-3 top-14 w-36 rounded-xl border border-purple-200/40 bg-white/80 p-2 text-[10px] text-gray-700 shadow-lg backdrop-blur"
                  aria-label="Expression debug scores"
                >
                  <div className="mb-1 text-[10px] font-semibold text-purple-700">Expression Scores</div>
                  {expressionDebug.slice(0, 5).map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-semibold">{Math.round(item.score * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Floating Emotion Indicator */}
              <motion.div
                className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-purple-200/40 bg-purple-900/70 px-3 py-2 text-sm text-white backdrop-blur"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-lg">{emotionEngine.getEmotionInfo(emotionState.emotion).emoji}</span>
                {emotionState.emotion.toUpperCase()}
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Analytics Panel (Desktop) */}
        <motion.div
          className="hidden space-y-4 rounded-3xl border border-purple-200/40 bg-white/70 p-5 backdrop-blur-lg lg:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <AnalyticsPanel
            emotionState={emotionState}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(prev => !prev)}
          />
        </motion.div>
      </div>

      {/* Mobile Bottom Sheet Analytics */}
      <div className="lg:hidden">
        {sheetSnap < 2 && (
          <motion.div
            className="fixed inset-0 z-10 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => snapTo(2)}
          />
        )}
        <motion.button
          type="button"
          className="fixed bottom-24 right-4 z-30 rounded-full border border-purple-200/50 bg-white/80 px-4 py-2 text-xs font-semibold text-purple-700 shadow-lg backdrop-blur"
          onClick={() => snapTo(sheetSnap === 2 ? 1 : 2)}
          whileTap={{ scale: 0.98 }}
        >
          {sheetSnap === 2 ? 'Show Analytics' : 'Hide Analytics'}
        </motion.button>

        <motion.div
          className="fixed inset-x-0 bottom-0 z-20 rounded-t-3xl border border-purple-200/50 bg-white/85 p-4 pb-24 shadow-2xl backdrop-blur"
          style={{ y: sheetY }}
          drag="y"
          dragConstraints={{ top: 0, bottom: snapPoints[2] }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const nextSnap = getClosestSnap(sheetY.get(), info.velocity.y)
            snapTo(nextSnap)
          }}
          role="dialog"
          aria-label="Analytics panel"
        >
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-purple-300/60" />
          <div className="mb-3 flex items-center justify-center gap-2 text-[10px] text-gray-500">
            {['Full', 'Compact', 'Hidden'].map((label, idx) => (
              <button
                key={label}
                type="button"
                className={`flex items-center gap-1 rounded-full px-2 py-1 ${sheetSnap === idx ? 'bg-purple-100 text-purple-700' : 'bg-white/60'}`}
                onClick={() => snapTo(idx)}
              >
                <span className={`h-2 w-2 rounded-full ${sheetSnap === idx ? 'bg-purple-500' : 'bg-purple-200'}`} />
                {label}
              </button>
            ))}
          </div>

          {sheetSnap === 1 ? (
            <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <span className="text-lg">{emotionEngine.getEmotionInfo(emotionState.emotion).emoji}</span>
                  {emotionState.emotion.toUpperCase()}
                </div>
                <button
                  type="button"
                  className="rounded-full border border-purple-200/50 bg-white px-3 py-1 text-[11px] font-semibold text-purple-700"
                  onClick={() => snapTo(0)}
                >
                  Expand
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-purple-200/30 bg-white/70 px-2 py-2">
                  <div className="text-[10px] text-gray-500">Confidence</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{Math.round(emotionState.confidence * 100)}%</div>
                </div>
                <div className="rounded-xl border border-purple-200/30 bg-white/70 px-2 py-2">
                  <div className="text-[10px] text-gray-500">Attention</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{Math.round(emotionState.metrics.attentionLevel)}%</div>
                </div>
                <div className="rounded-xl border border-purple-200/30 bg-white/70 px-2 py-2">
                  <div className="text-[10px] text-gray-500">Engage</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{Math.round(emotionState.metrics.engagementScore)}%</div>
                </div>
              </div>
            </div>
          ) : sheetSnap === 0 ? (
            <AnalyticsPanel
              emotionState={emotionState}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(prev => !prev)}
            />
          ) : (
            <div className="text-center text-xs text-gray-500">Swipe up to view analytics</div>
          )}
        </motion.div>
      </div>

      {/* Emotion Timeline + Teacher Analytics */}
      <motion.div
        className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <EmotionTimeline history={emotionEngine.getEmotionHistory()} />
        <TeacherAnalyticsView emotionState={emotionState} />
      </motion.div>
    </div>
  )
}

function AnalyticsPanel({ emotionState, voiceEnabled, onToggleVoice }) {
  return (
    <>
      <EmotionCard emotionState={emotionState} />
      <AttentionMeter level={emotionState.metrics.attentionLevel} />
      <EngagementRing score={emotionState.metrics.engagementScore} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-3">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <Eye size={16} />
            Eye Movement
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-800">
            {Math.round(emotionState.metrics.eyeMovement)}%
          </p>
        </div>
        <div className="rounded-2xl border border-purple-200/30 bg-white/70 p-3">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <Brain size={16} />
            Focus Level
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-800">
            {Math.round(emotionState.metrics.attentionLevel)}%
          </p>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
        onClick={onToggleVoice}
      >
        {voiceEnabled ? 'Disable Voice Alerts' : 'Enable Voice Alerts'}
      </button>
    </>
  )
}

function mapExpressionToDivyam(expression) {
  const map = {
    happy: 'happy',
    neutral: 'neutral',
    sad: 'tired',
    angry: 'confused',
    disgusted: 'confused',
    fearful: 'confused',
    surprised: 'confused',
  }

  return map[expression] || 'neutral'
}

// Generate mock face landmarks for demo
function generateMockLandmarks(width, height) {
  const landmarks = []
  const centerX = width / 2
  const centerY = height / 2

  for (let i = 0; i < 68; i++) {
    const angle = (i / 68) * Math.PI * 2
    const radius = Math.min(width, height) * 0.15

    landmarks.push({
      x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 5,
      y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 5,
    })
  }

  return landmarks
}
