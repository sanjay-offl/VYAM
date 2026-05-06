import * as tf from '@tensorflow/tfjs'

export const EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
let modelPromise = null

export async function loadEmotionModel() {
  if (modelPromise) return modelPromise
  modelPromise = tf.loadGraphModel('/models/emotion/model.json').catch((err) => {
    console.warn('Emotion model failed to load:', err)
    return null
  })
  return modelPromise
}

export async function predictEmotionFromVideo(video, box) {
  if (!video || !box) return null

  const model = await loadEmotionModel()
  if (!model) return null

  const { videoWidth, videoHeight } = video
  if (!videoWidth || !videoHeight) return null

  const x1 = Math.max(0, box.x / videoWidth)
  const y1 = Math.max(0, box.y / videoHeight)
  const x2 = Math.min(1, (box.x + box.width) / videoWidth)
  const y2 = Math.min(1, (box.y + box.height) / videoHeight)

  const result = await tf.tidy(async () => {
    const input = tf.browser.fromPixels(video)
    const boxTensor = tf.tensor2d([[y1, x1, y2, x2]])
    const boxIndex = tf.tensor1d([0], 'int32')

    const crop = tf.image.cropAndResize(input.expandDims(0), boxTensor, boxIndex, [48, 48])
    const gray = crop.mean(3).expandDims(-1)
    const normalized = gray.div(255)

    const logits = model.predict(normalized)
    const scores = await logits.data()

    tf.dispose([input, boxTensor, boxIndex, crop, gray, normalized, logits])

    return Array.from(scores)
  })

  if (!result || !result.length) return null

  let topIndex = 0
  let topScore = result[0]
  result.forEach((score, idx) => {
    if (score > topScore) {
      topScore = score
      topIndex = idx
    }
  })

  return {
    label: EMOTION_LABELS[topIndex] || 'Neutral',
    confidence: topScore,
    scores: result,
  }
}

export function mapTfjsEmotionToDivyam(label) {
  const map = {
    Happy: 'happy',
    Neutral: 'neutral',
    Sad: 'tired',
    Angry: 'confused',
    Disgust: 'confused',
    Fear: 'confused',
    Surprise: 'confused',
  }

  return map[label] || 'neutral'
}
