import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projects, workPackages, spools } from '../api'
import '../styles/ProjectDetail.css'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [wpList, setWpList] = useState([])
  const [spoolList, setSpoolList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWpForm, setShowWpForm] = useState(false)
  const [showSpoolForm, setShowSpoolForm] = useState(false)
  const [selectedWp, setSelectedWp] = useState(null)
  const [wpFormData, setWpFormData] = useState({ name: '', status: 'pending' })
  const [spoolFormData, setSpoolFormData] = useState({ size: '', material: '', quantity: 1 })

  useEffect(() => {
    loadProject()
  }, [id])

  useEffect(() => {
    if (selectedWp) {
      loadSpools(selectedWp.id)
    }
  }, [selectedWp])

  const loadProject = async () => {
    try {
      setLoading(true)
      const { data } = await projects.get(id)
      setProject(data)
      setWpList(data.work_packages || [])
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const loadSpools = async (wpId) => {
    try {
      const { data } = await spools.list(wpId)
      setSpoolList(data)
    } catch (err) {
      setError('Failed to load spools')
    }
  }

  const handleCreateWp = async (e) => {
    e.preventDefault()
    try {
      await workPackages.create(id, wpFormData.name, wpFormData.status)
      setWpFormData({ name: '', status: 'pending' })
      setShowWpForm(false)
      loadProject()
    } catch (err) {
      setError('Failed to create work package')
    }
  }

  const handleCreateSpool = async (e) => {
    e.preventDefault()
    if (!selectedWp) return
    try {
      await spools.create(selectedWp.id, spoolFormData.size, spoolFormData.material, spoolFormData.quantity)
      setSpoolFormData({ size: '', material: '', quantity: 1 })
      setShowSpoolForm(false)
      loadSpools(selectedWp.id)
    } catch (err) {
      setError('Failed to create spool')
    }
  }

  const handleDeleteWp = async (wpId) => {
    if (confirm('Delete this work package?')) {
      try {
        await workPackages.delete(wpId)
        loadProject()
        setSelectedWp(null)
      } catch (err) {
        setError('Failed to delete work package')
      }
    }
  }

  const handleDeleteSpool = async (spoolId) => {
    if (confirm('Delete this spool?')) {
      try {
        await spools.delete(spoolId)
        if (selectedWp) loadSpools(selectedWp.id)
      } catch (err) {
        setError('Failed to delete spool')
      }
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!project) return <div className="container"><p>Project not found</p></div>

  return (
    <div className="container project-detail">
      <button onClick={() => navigate('/')} className="btn-back">← Back</button>

      <div className="project-header">
        <h1>{project.name}</h1>
        <p>{project.description}</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="detail-grid">
        <div className="section">
          <div className="section-header">
            <h2>Work Packages</h2>
            <button onClick={() => setShowWpForm(!showWpForm)} className="btn-primary">
              {showWpForm ? 'Cancel' : 'Add'}
            </button>
          </div>

          {showWpForm && (
            <form onSubmit={handleCreateWp} className="form">
              <input
                type="text"
                placeholder="Work package name"
                value={wpFormData.name}
                onChange={(e) => setWpFormData({ ...wpFormData, name: e.target.value })}
                required
              />
              <select
                value={wpFormData.status}
                onChange={(e) => setWpFormData({ ...wpFormData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button type="submit" className="btn-primary">Create</button>
            </form>
          )}

          <div className="list">
            {wpList.map((wp) => (
              <div
                key={wp.id}
                className={`list-item ${selectedWp?.id === wp.id ? 'selected' : ''}`}
                onClick={() => setSelectedWp(wp)}
              >
                <div>
                  <h4>{wp.name}</h4>
                  <span className="status">{wp.status}</span>
                </div>
                <button
                  className="btn-delete-small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteWp(wp.id)
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedWp && (
          <div className="section">
            <div className="section-header">
              <h2>Spools: {selectedWp.name}</h2>
              <button onClick={() => setShowSpoolForm(!showSpoolForm)} className="btn-primary">
                {showSpoolForm ? 'Cancel' : 'Add'}
              </button>
            </div>

            {showSpoolForm && (
              <form onSubmit={handleCreateSpool} className="form">
                <input
                  type="text"
                  placeholder="Size"
                  value={spoolFormData.size}
                  onChange={(e) => setSpoolFormData({ ...spoolFormData, size: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Material"
                  value={spoolFormData.material}
                  onChange={(e) => setSpoolFormData({ ...spoolFormData, material: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={spoolFormData.quantity}
                  onChange={(e) => setSpoolFormData({ ...spoolFormData, quantity: parseInt(e.target.value) })}
                  min="1"
                />
                <button type="submit" className="btn-primary">Create</button>
              </form>
            )}

            <div className="list">
              {spoolList.map((spool) => (
                <div key={spool.id} className="list-item">
                  <div>
                    <h4>{spool.material} - {spool.size}</h4>
                    <p>Qty: {spool.quantity}</p>
                  </div>
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDeleteSpool(spool.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
