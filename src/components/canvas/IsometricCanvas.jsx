import React, { useRef, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { PipePoint, Olet } from '../../types/pipePoint'
import { PipeSize, FittingType, FittingTypeInfo, PipeSizeInfo } from '../../types/fittings'
import {
  snapToIsometricAngle,
  angleBetweenPoints,
  drawPipeSegment,
  drawElbow,
  drawTee,
  drawReducer,
  drawCap,
  drawPointMarker,
  drawLabel,
  drawBubble,
  drawGrid,
} from './renderer'
import '../styles/IsometricCanvas.css'

export default function IsometricCanvas({ initialPipePoints = [], onPointsChange, onError }) {
  const canvasRef = useRef(null)
  const [pipePoints, setPipePoints] = useState(() => {
    try {
      const points = Array.isArray(initialPipePoints) ? initialPipePoints : []
      return points.map((p) => PipePoint.fromJSON(p))
    } catch (err) {
      if (onError) onError(err)
      return []
    }
  })
  const [selectedPointId, setSelectedPointId] = useState(null)
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [mode, setMode] = useState('normal') // normal, break, branch, olet
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [history, setHistory] = useState([])

  const canvas = canvasRef.current

  // Attach keyboard and context menu listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Render canvas
  useEffect(() => {
    if (!canvas) return

    canvas.addEventListener('contextmenu', handleContextMenu)
    return () => canvas.removeEventListener('contextmenu', handleContextMenu)
  }, [canvas])

  useEffect(() => {
    if (!canvas) return

    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas 2D context')

      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.fillStyle = '#FFF'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.save()
      ctx.translate(pan.x, pan.y)
      ctx.scale(zoom, zoom)
      drawGrid(ctx, width / zoom, height / zoom, 40)

      // Draw pipe segments
      pipePoints.forEach((point, idx) => {
        if (idx < pipePoints.length - 1 && !pipePoints[idx + 1].branchParentId) {
          const nextPoint = pipePoints[idx + 1]
          drawPipeSegment(ctx, point.position, nextPoint.position, point.pipeSize, zoom)
        }
      })

      // Draw branch segments
      pipePoints.forEach((point) => {
        if (point.branchParentId) {
          const parent = pipePoints.find((p) => p.id === point.branchParentId)
          if (parent) {
            drawPipeSegment(ctx, parent.position, point.position, point.pipeSize, zoom)
          }
        }
      })

      // Draw points
      pipePoints.forEach((point, idx) => {
        let color = '#2ECC71'
        if (idx === 0) color = '#2ECC71'
        if (idx === pipePoints.length - 1 && !point.branchParentId) color = '#E74C3C'
        if (point.fittingType !== FittingType.NONE) color = '#3498DB'

        drawPointMarker(ctx, point.position, color)
        drawBubble(ctx, idx + 1, {
          x: point.position.x + 20,
          y: point.position.y - 10,
        })

        // Draw labels
        drawLabel(ctx, PipeSizeInfo[point.pipeSize].shortName, {
          x: point.position.x - 25,
          y: point.position.y + 15,
        })
      })

      ctx.restore()
    } catch (err) {
      if (onError) onError(err)
    }
  }, [canvas, pipePoints, pan, zoom, onError])

  // Canvas events
  const handleCanvasClick = (e) => {
    try {
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      // Account for pan and zoom, but not isometric projection (we draw in 2D screen space)
      const canvasX = (e.clientX - rect.left - pan.x) / zoom
      const canvasY = (e.clientY - rect.top - pan.y) / zoom

      // Check if clicking on existing point
      const clickedPoint = pipePoints.find((p) => {
        const dist = Math.sqrt(
          (p.position.x - canvasX) ** 2 + (p.position.y - canvasY) ** 2
        )
        return dist < 10 / zoom
      })

      if (clickedPoint) {
        setSelectedPointId(clickedPoint.id)
        return
      }

      // Normal mode: add new point
      if (mode === 'normal') {
        const newPoint = new PipePoint(
          uuid(),
          { x: canvasX, y: canvasY },
          FittingType.NONE,
          PipeSize.ONE
        )

        // Auto-detect fitting if there's a previous point
        if (pipePoints.length > 0) {
          const lastPoint = pipePoints[pipePoints.length - 1]
          const angle = angleBetweenPoints(lastPoint.position, newPoint.position)
          const snappedAngle = snapToIsometricAngle(angle)
          newPoint.fittingOrientation = snappedAngle

          if (pipePoints.length > 1) {
            const secondLastPoint = pipePoints[pipePoints.length - 2]
            const incomingAngle = angleBetweenPoints(
              secondLastPoint.position,
              lastPoint.position
            )
            const incomingSnapped = snapToIsometricAngle(incomingAngle)
            const angleDiff = Math.abs(incomingSnapped - snappedAngle)

            if (angleDiff > 20) {
              lastPoint.fittingType = FittingType.ELBOW_90
            }
          }
        }

        const newPoints = [...pipePoints, newPoint]
        setPipePoints(newPoints)
        setSelectedPointId(newPoint.id)
        onPointsChange(newPoints.map((p) => p.toJSON()))
      }
    } catch (err) {
      if (onError) onError(err)
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(8, zoom * delta))
    setZoom(newZoom)
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setPan({
      x: pan.x + deltaX,
      y: pan.y + deltaY,
    })

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSelectedPointId(null)
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    setSelectedPointId(null)
  }

  const selectedPoint = pipePoints.find((p) => p.id === selectedPointId)

  return (
    <div className="isometric-canvas-container">
      <div className="canvas-toolbar">
        <button onClick={() => setMode('normal')} className={mode === 'normal' ? 'active' : ''}>
          Normal
        </button>
        <button onClick={() => setMode('break')} className={mode === 'break' ? 'active' : ''}>
          Break
        </button>
        <button onClick={() => setMode('branch')} className={mode === 'branch' ? 'active' : ''}>
          Branch
        </button>
        <button onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}>−</button>
        <span>{(zoom * 100).toFixed(0)}%</span>
        <button onClick={() => setZoom(Math.min(8, zoom + 0.2))}>+</button>
        <button
          onClick={() => {
            setPipePoints([])
            setSelectedPointId(null)
            onPointsChange([])
          }}
          className="danger"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
      />

      {selectedPoint && (
        <div className="point-inspector">
          <h4>Point {pipePoints.indexOf(selectedPoint) + 1}</h4>
          <label>
            Fitting:
            <select
              value={selectedPoint.fittingType}
              onChange={(e) => {
                selectedPoint.fittingType = e.target.value
                setPipePoints([...pipePoints])
                onPointsChange(pipePoints.map((p) => p.toJSON()))
              }}
            >
              {Object.entries(FittingTypeInfo).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.displayName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Pipe Size:
            <select
              value={selectedPoint.pipeSize}
              onChange={(e) => {
                selectedPoint.pipeSize = e.target.value
                setPipePoints([...pipePoints])
                onPointsChange(pipePoints.map((p) => p.toJSON()))
              }}
            >
              {Object.entries(PipeSizeInfo).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.shortName}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => {
              setPipePoints(pipePoints.filter((p) => p.id !== selectedPointId))
              setSelectedPointId(null)
            }}
            className="danger"
          >
            Delete Point
          </button>
        </div>
      )}
    </div>
  )
}
