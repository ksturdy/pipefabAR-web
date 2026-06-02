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
  const [drawingFromPointId, setDrawingFromPointId] = useState(null)
  const [history, setHistory] = useState([])
  const [currentPipeSize, setCurrentPipeSize] = useState(PipeSize.ONE)

  const canvas = canvasRef.current

  // Fit all points in view
  const handleZoomExtent = () => {
    if (!canvas || pipePoints.length === 0) {
      setZoom(1.0)
      setPan({ x: 0, y: 0 })
      return
    }

    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity

    pipePoints.forEach((p) => {
      minX = Math.min(minX, p.position.x)
      maxX = Math.max(maxX, p.position.x)
      minY = Math.min(minY, p.position.y)
      maxY = Math.max(maxY, p.position.y)
    })

    const width = maxX - minX || 100
    const height = maxY - minY || 100
    const padding = 60

    const zoomX = (canvas.width - padding * 2) / width
    const zoomY = (canvas.height - padding * 2) / height
    const newZoom = Math.min(zoomX, zoomY, 3)

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    const newPanX = canvas.width / 2 - centerX * newZoom
    const newPanY = canvas.height / 2 - centerY * newZoom

    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }

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
      // Account for canvas being resized by CSS (displayed size vs internal size)
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      // Convert to canvas internal coordinates
      const clickX = (e.clientX - rect.left) * scaleX
      const clickY = (e.clientY - rect.top) * scaleY

      // Account for pan and zoom
      const canvasX = (clickX - pan.x) / zoom
      const canvasY = (clickY - pan.y) / zoom

      // Check if clicking on existing point
      const clickedPoint = pipePoints.find((p) => {
        const dist = Math.sqrt(
          (p.position.x - canvasX) ** 2 + (p.position.y - canvasY) ** 2
        )
        return dist < 20 / zoom
      })

      if (clickedPoint) {
        // Resume drawing from this point
        setDrawingFromPointId(clickedPoint.id)
        setSelectedPointId(clickedPoint.id)
        return
      }

      // Normal mode: add new point
      if (mode === 'normal') {
        const newPoint = new PipePoint(
          uuid(),
          { x: canvasX, y: canvasY },
          FittingType.NONE,
          currentPipeSize
        )

        // Snap to isometric angles
        if (pipePoints.length > 0) {
          // Use drawingFromPointId if set, otherwise last point
          const lastPoint = drawingFromPointId
            ? pipePoints.find((p) => p.id === drawingFromPointId)
            : pipePoints[pipePoints.length - 1]
          const angle = angleBetweenPoints(lastPoint.position, newPoint.position)
          const snappedAngle = snapToIsometricAngle(angle)

          // Calculate distance and apply snapped angle
          const distance = Math.sqrt(
            (newPoint.position.x - lastPoint.position.x) ** 2 +
            (newPoint.position.y - lastPoint.position.y) ** 2
          )
          const radians = (snappedAngle * Math.PI) / 180
          newPoint.position.x = lastPoint.position.x + Math.cos(radians) * distance
          newPoint.position.y = lastPoint.position.y + Math.sin(radians) * distance
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
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clickX = (e.clientX - rect.left) * scaleX
    const clickY = (e.clientY - rect.top) * scaleY

    // Zoom towards mouse cursor
    const delta = e.deltaY > 0 ? 0.95 : 1.05
    const newZoom = Math.max(0.1, Math.min(8, zoom * delta))
    const zoomRatio = newZoom / zoom

    // Adjust pan so zoom happens around cursor
    const newPan = {
      x: clickX - (clickX - pan.x) * zoomRatio,
      y: clickY - (clickY - pan.y) * zoomRatio,
    }

    setZoom(newZoom)
    setPan(newPan)
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
      setSelectedPointId(null)
      setDrawingFromPointId(null)
    }
  }

  const handleContextMenu = (e) => {
    if (e.cancelable) {
      e.preventDefault()
    }
    setSelectedPointId(null)
    setDrawingFromPointId(null)
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
        <select value={currentPipeSize} onChange={(e) => setCurrentPipeSize(e.target.value)} style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}>
          {Object.entries(PipeSizeInfo).map(([key, info]) => (
            <option key={key} value={key}>
              {info.shortName}
            </option>
          ))}
        </select>
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
        <button onClick={handleZoomExtent}>Fit</button>
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
