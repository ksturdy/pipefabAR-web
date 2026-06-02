import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { spools } from '../api'
import '../styles/SpoolDetail.css'

export default function SpoolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [spool, setSpool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  const pipePointsData = spool.pipe_points_data ? JSON.parse(spool.pipe_points_data) : []

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
          <div style={{ padding: '24px', background: 'white' }}>
            <h2>{spool.name}</h2>
            <p><strong>Status:</strong> {spool.status}</p>
            <p><strong>System Type:</strong> {spool.system_type || 'None'}</p>
            <p style={{ marginTop: '16px', color: '#999' }}>Drawing canvas coming soon...</p>
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
