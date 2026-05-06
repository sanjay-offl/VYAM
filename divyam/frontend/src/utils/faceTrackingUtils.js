/**
 * KLT-style Feature Point Tracking and Canvas Utilities
 * Simulates tracking points around eyes, nose, and mouth
 */

// Generate KLT-style tracking points for facial landmarks
export function generateTrackingPoints(landmarks, canvasWidth, canvasHeight) {
  if (!landmarks || landmarks.length === 0) return []

  const points = []

  // Key face regions (approximate indices for face-api.js landmarks)
  const regions = [
    { name: 'leftEye', indices: [36, 37, 38, 39, 40, 41], color: '#8B5CF6' },
    { name: 'rightEye', indices: [42, 43, 44, 45, 46, 47], color: '#8B5CF6' },
    { name: 'nose', indices: [27, 28, 29, 30, 31, 32, 33, 34, 35], color: '#A78BFA' },
    { name: 'mouth', indices: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59], color: '#C4B5FD' },
  ]

  regions.forEach(region => {
    region.indices.forEach(idx => {
      if (landmarks[idx]) {
        points.push({
          x: landmarks[idx].x,
          y: landmarks[idx].y,
          region: region.name,
          color: region.color,
          id: `${region.name}-${idx}`,
        })
      }
    })
  })

  return points
}

// Draw animated face bounding box with glow effect
export function drawFaceBoundingBox(ctx, box, time) {
  if (!ctx || !box) return

  const { x, y, width, height } = box

  // Pulsing glow effect
  const pulse = Math.sin(time * 0.005) * 0.3 + 0.7

  ctx.save()
  ctx.strokeStyle = `rgba(139, 92, 246, ${pulse})`
  ctx.lineWidth = 2
  ctx.shadowBlur = 15
  ctx.shadowColor = 'rgba(139, 92, 246, 0.6)'
  ctx.setLineDash([8, 4])
  ctx.lineDashOffset = -(time * 0.01)

  ctx.strokeRect(x - 5, y - 5, width + 10, height + 10)
  ctx.restore()
}

// Draw KLT feature points with animated effects
export function drawTrackingPoints(ctx, points, time) {
  if (!ctx || !points) return

  points.forEach((point, index) => {
    const pulse = Math.sin(time * 0.01 + index) * 0.5 + 0.5
    const radius = 2 + pulse * 2

    ctx.save()
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = point.color
    ctx.shadowBlur = 10
    ctx.shadowColor = point.color
    ctx.fill()

    // Outer ring
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius + 3, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(139, 92, 246, ${pulse * 0.3})`
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  })
}

// Draw face mesh overlay
export function drawFaceMesh(ctx, landmarks) {
  if (!ctx || !landmarks || landmarks.length === 0) return

  ctx.save()
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)'
  ctx.lineWidth = 1

  // Draw mesh lines between consecutive points
  for (let i = 0; i < landmarks.length - 1; i++) {
    const current = landmarks[i]
    const next = landmarks[i + 1]

    ctx.beginPath()
    ctx.moveTo(current.x, current.y)
    ctx.lineTo(next.x, next.y)
    ctx.stroke()
  }

  ctx.restore()
}

// Draw scanning effect overlay
export function drawScanningEffect(ctx, width, height, time) {
  if (!ctx) return

  const scanY = (time * 0.05) % height

  ctx.save()
  const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
  gradient.addColorStop(0, 'rgba(139, 92, 246, 0)')
  gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)')
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, scanY - 20, width, 40)
  ctx.restore()
}

// Temporal smoothing for landmarks (EMA-style)
export function smoothLandmarks(previous, next, alpha = 0.65) {
  if (!next || !next.length) return null
  if (!previous || previous.length !== next.length) return next

  return next.map((point, idx) => {
    const prev = previous[idx] || point
    return {
      x: prev.x * alpha + point.x * (1 - alpha),
      y: prev.y * alpha + point.y * (1 - alpha),
    }
  })
}

// Temporal smoothing for bounding box
export function smoothBox(previous, next, alpha = 0.6) {
  if (!next) return null
  if (!previous) return next

  return {
    x: previous.x * alpha + next.x * (1 - alpha),
    y: previous.y * alpha + next.y * (1 - alpha),
    width: previous.width * alpha + next.width * (1 - alpha),
    height: previous.height * alpha + next.height * (1 - alpha),
  }
}
