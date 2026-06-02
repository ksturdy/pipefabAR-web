import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  const [wpFormData, setWpFormData] = useState({ name: '', package_number: '', status: 'Not Started' })
  const [spoolFormData, setSpoolFormData] = useState({ name: '', system_type: '', work_package_id: '' })

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
      setSpoolList(data.spools || [])
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
      await workPackages.create(id, wpFormData.name, wpFormData.package_number, wpFormData.status)
      setWpFormData({ name: '', package_number: '', status: 'Not Started' })
      setShowWpForm(false)
      loadProject()
    } catch (err) {
      setError('Failed to create work package')
    }
  }

  const handleCreateSpool = async (e) => {
    e.preventDefault()
    try {
      await spools.create(id, spoolFormData.work_package_id || null, spoolFormData.name, spoolFormData.system_type)
      setSpoolFormData({ name: '', system_type: '', work_package_id: '' })
      setShowSpoolForm(false)
      loadProject()
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

      <div className="detail-sections">
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
              <input
                type="text"
                placeholder="Package number"
                value={wpFormData.package_number}
                onChange={(e) => setWpFormData({ ...wpFormData, package_number: e.target.value })}
              />
              <select
                value={wpFormData.status}
                onChange={(e) => setWpFormData({ ...wpFormData, status: e.target.value })}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
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

        <div className="section">
          <div className="section-header">
            <h2>Spools</h2>
            <button onClick={() => setShowSpoolForm(!showSpoolForm)} className="btn-primary">
              {showSpoolForm ? 'Cancel' : 'Add'}
            </button>
          </div>

          {showSpoolForm && (
            <form onSubmit={handleCreateSpool} className="form">
              <input
                type="text"
                placeholder="Spool name"
                value={spoolFormData.name}
                onChange={(e) => setSpoolFormData({ ...spoolFormData, name: e.target.value })}
                required
              />
              <select
                value={spoolFormData.system_type}
                onChange={(e) => setSpoolFormData({ ...spoolFormData, system_type: e.target.value })}
              >
                <option value="">Select system type</option>
                <option value="hotWater">Hot Water</option>
                <option value="coldWater">Cold Water</option>
                <option value="gas">Gas</option>
              </select>
              <select
                value={spoolFormData.work_package_id}
                onChange={(e) => setSpoolFormData({ ...spoolFormData, work_package_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {wpList.map((wp) => (
                  <option key={wp.id} value={wp.id}>
                    {wp.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary">Create</button>
            </form>
          )}

          <div className="list">
            {spoolList.map((spool) => (
              <Link
                key={spool.id}
                to={`/spools/${spool.id}`}
                className="list-item spool-item"
              >
                <div>
                  <h4>{spool.name}</h4>
                  <span className="status">{spool.status}</span>
                </div>
                <button
                  className="btn-delete-small"
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeleteSpool(spool.id)
                  }}
                >
                  ×
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
