import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { spools } from '../api'
import IsometricCanvas from '../components/canvas/IsometricCanvas'
import '../styles/SpoolDetail.css'

export default function SpoolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [spool, setSpool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canvasError, setCanvasError] = useState('')
  const [tab, setTab] = useState('canvas') // canvas, bom, preview
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSpool()
  }, [id])

  const loadSpool = async () => {
    try {
      setLoading(true)
      const { data } = await spools.get(id)
      setSpool(data)
    } catch (err) {
      setError('Failed to load spool')
    } finally {
      setLoading(false)
    }
  }

  const handlePipePointsChange = async (pipePointsData) => {
    if (!spool) return

    // Auto-save
    setIsSaving(true)
    try {
      const updatedSpool = {
        ...spool,
        pipe_points_data: JSON.stringify(pipePointsData),
      }
      await spools.update(id, spool.name, spool.system_type, spool.status, pipePointsData, spool.zoom_scale, spool.pan_offset_x, spool.pan_offset_y, spool.work_package_id)
      setSpool(updatedSpool)
    } catch (err) {
      setError('Failed to save spool')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!spool) return <div className="container"><p>Spool not found</p></div>
  if (error) return <div className="container"><p className="error">{error}</p></div>

  const pipePointsData = (() => {
    const raw = spool.pipe_points_data
    if (!raw) return []
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : []
  })()

  return (
    <div className="spool-detail-page">
      <div className="spool-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Back
        </button>
        <div className="spool-title">
          <h1>{spool.name}</h1>
          <span className={`status ${spool.status}`}>{spool.status}</span>
        </div>
        <span className="save-indicator">{isSaving ? 'Saving...' : 'Auto-saved'}</span>
      </div>

      <div className="spool-tabs">
        <button
          className={`tab ${tab === 'canvas' ? 'active' : ''}`}
          onClick={() => setTab('canvas')}
        >
          Draw
        </button>
        <button className={`tab ${tab === 'bom' ? 'active' : ''}`} onClick={() => setTab('bom')}>
          BOM
        </button>
        <button
          className={`tab ${tab === 'preview' ? 'active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Print Preview
        </button>
      </div>

      <div className="spool-content">
        {tab === 'canvas' && (
          <div className="canvas-tab">
            {canvasError ? (
              <div style={{ padding: '24px', background: '#fff3cd', borderRadius: '4px', margin: '16px' }}>
                <p style={{ color: '#856404', marginBottom: '12px' }}><strong>Canvas Error:</strong> {canvasError}</p>
                <button
                  onClick={() => setCanvasError('')}
                  style={{ padding: '8px 12px', background: '#856404', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <IsometricCanvas
                initialPipePoints={pipePointsData}
                onPointsChange={handlePipePointsChange}
                onError={(err) => setCanvasError(err.message)}
              />
            )}
          </div>
        )}

        {tab === 'bom' && (
          <div className="bom-content">
            <h2>Bill of Materials</h2>
            <p>BOM view coming soon...</p>
          </div>
        )}

        {tab === 'preview' && (
          <div className="preview-content">
            <h2>Print Preview</h2>
            <p>Print preview coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
