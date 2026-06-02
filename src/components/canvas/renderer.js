import { PipeSizeInfo } from '../../types/fittings'

const ISOMETRIC_ANGLES = [30, 45, 90, 135, 150, 210, 225, 270, 315, 330]
const ANGLE_SNAP_TOLERANCE = 8
const SCALE_PER_INCH = 2.0

// Isometric projection: standard 30° angles
export function project3DPoint(x, y, z) {
  const angle1 = (30 * Math.PI) / 180
  const angle2 = (30 * Math.PI) / 180

  const screenX = x * Math.cos(angle1) - z * Math.cos(angle2)
  const screenY = y + x * Math.sin(angle1) + z * Math.sin(angle2)

  return { x: screenX, y: screenY }
}

// Snap angle to nearest isometric direction
export function snapToIsometricAngle(angle) {
  let normalizedAngle = angle % 360
  if (normalizedAngle < 0) normalizedAngle += 360

  let closest = ISOMETRIC_ANGLES[0]
  let minDiff = Math.abs(normalizedAngle - closest)

  for (let i = 1; i < ISOMETRIC_ANGLES.length; i++) {
    const diff = Math.abs(normalizedAngle - ISOMETRIC_ANGLES[i])
    if (diff < minDiff) {
      minDiff = diff
      closest = ISOMETRIC_ANGLES[i]
    }
  }

  return closest
}

// Calculate angle between two points
export function angleBetweenPoints(p1, p2) {
  return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI
}

// Render pipe segment between two points
export function drawPipeSegment(ctx, fromPoint, toPoint, pipeSize, scale, color = '#2ECC71') {
  const pipeInfo = PipeSizeInfo[pipeSize]
  const pipeWidth = pipeInfo.outerDiameter * SCALE_PER_INCH * scale

  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(2, pipeWidth)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(fromPoint.x, fromPoint.y)
  ctx.lineTo(toPoint.x, toPoint.y)
  ctx.stroke()
}

// Draw 90° elbow
export function drawElbow(ctx, position, inAngle, outAngle, pipeSize, scale) {
  const pipeInfo = PipeSizeInfo[pipeSize]
  const radius = pipeInfo.outerDiameter * SCALE_PER_INCH * scale * 1.5

  ctx.strokeStyle = '#2ECC71'
  ctx.lineWidth = Math.max(2, pipeInfo.outerDiameter * SCALE_PER_INCH * scale)
  ctx.lineCap = 'round'

  const startAngle = (inAngle * Math.PI) / 180
  const endAngle = (outAngle * Math.PI) / 180

  ctx.beginPath()
  ctx.arc(position.x, position.y, radius, startAngle, endAngle, false)
  ctx.stroke()
}

// Draw tee fitting
export function drawTee(ctx, position, mainAngle, branchAngle, pipeSize, scale) {
  const pipeInfo = PipeSizeInfo[pipeSize]
  const size = pipeInfo.outerDiameter * SCALE_PER_INCH * scale

  ctx.fillStyle = '#2ECC71'
  ctx.beginPath()
  ctx.arc(position.x, position.y, size * 1.2, 0, Math.PI * 2)
  ctx.fill()

  // Draw branch outlet
  if (branchAngle !== null) {
    const branchLength = size * 1.5
    const radians = (branchAngle * Math.PI) / 180
    const endX = position.x + Math.cos(radians) * branchLength
    const endY = position.y + Math.sin(radians) * branchLength

    ctx.strokeStyle = '#2ECC71'
    ctx.lineWidth = size * 0.8
    ctx.beginPath()
    ctx.moveTo(position.x, position.y)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }
}

// Draw reducer fitting
export function drawReducer(ctx, position, angle, enterSize, exitSize, scale) {
  const enterInfo = PipeSizeInfo[enterSize]
  const exitInfo = PipeSizeInfo[exitSize]
  const enterWidth = enterInfo.outerDiameter * SCALE_PER_INCH * scale
  const exitWidth = exitInfo.outerDiameter * SCALE_PER_INCH * scale
  const length = 15 * scale

  ctx.strokeStyle = '#2ECC71'
  ctx.lineWidth = 2

  const radians = (angle * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  const start = {
    x: position.x - cos * (length / 2),
    y: position.y - sin * (length / 2),
  }
  const end = {
    x: position.x + cos * (length / 2),
    y: position.y + sin * (length / 2),
  }

  ctx.beginPath()
  ctx.moveTo(start.x - sin * (enterWidth / 2), start.y + cos * (enterWidth / 2))
  ctx.lineTo(end.x - sin * (exitWidth / 2), end.y + cos * (exitWidth / 2))
  ctx.moveTo(start.x + sin * (enterWidth / 2), start.y - cos * (enterWidth / 2))
  ctx.lineTo(end.x + sin * (exitWidth / 2), end.y - cos * (exitWidth / 2))
  ctx.stroke()
}

// Draw cap
export function drawCap(ctx, position, angle, pipeSize, scale) {
  const pipeInfo = PipeSizeInfo[pipeSize]
  const size = pipeInfo.outerDiameter * SCALE_PER_INCH * scale

  ctx.fillStyle = '#E74C3C'
  ctx.beginPath()
  ctx.arc(position.x, position.y, size * 0.8, 0, Math.PI * 2)
  ctx.fill()
}

// Draw point marker
export function drawPointMarker(ctx, position, color, size = 6) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(position.x, position.y, size, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(position.x, position.y, size, 0, Math.PI * 2)
  ctx.stroke()
}

// Draw dimension label
export function drawLabel(ctx, text, position, offset = { x: 0, y: 0 }) {
  const x = position.x + offset.x
  const y = position.y + offset.y

  ctx.font = '12px Arial'
  ctx.fillStyle = '#000'
  const metrics = ctx.measureText(text)
  const width = metrics.width
  const height = 12

  ctx.fillStyle = '#FFF'
  ctx.fillRect(x - width / 2 - 2, y - height / 2 - 2, width + 4, height + 4)

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x - width / 2 - 2, y - height / 2 - 2, width + 4, height + 4)

  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

// Draw point number bubble
export function drawBubble(ctx, number, position) {
  const radius = 10

  ctx.fillStyle = '#3498DB'
  ctx.beginPath()
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(number, position.x, position.y)
}

// Draw isometric grid background (30°, 90°, 150° angles)
export function drawGrid(ctx, width, height, spacing = 40) {
  ctx.strokeStyle = '#E0E0E0'
  ctx.lineWidth = 0.5

  const angle30 = 30 * Math.PI / 180
  const angle150 = 150 * Math.PI / 180

  // Lines at 30° (lower-left to upper-right)
  for (let i = -height; i < width + height; i += spacing) {
    const x1 = i
    const y1 = 0
    const x2 = i + height * Math.cos(angle30)
    const y2 = height * Math.sin(angle30)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Lines at 150° (lower-right to upper-left)
  for (let i = -height; i < width + height; i += spacing) {
    const x1 = i
    const y1 = 0
    const x2 = i + height * Math.cos(angle150)
    const y2 = height * Math.sin(angle150)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Vertical lines at 90°
  for (let y = -height; y < height + height; y += spacing) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}
