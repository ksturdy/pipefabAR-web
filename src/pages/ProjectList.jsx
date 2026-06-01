import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../api'
import '../styles/ProjectList.css'

export default function ProjectList() {
  const [projectList, setProjectList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data } = await projects.list()
      setProjectList(data)
    } catch (err) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await projects.create(formData.name, formData.description)
      setFormData({ name: '', description: '' })
      setShowForm(false)
      loadProjects()
    } catch (err) {
      setError('Failed to create project')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      try {
        await projects.delete(id)
        loadProjects()
      } catch (err) {
        setError('Failed to delete project')
      }
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (error) return <div className="container"><p className="error">{error}</p></div>

  return (
    <div className="container">
      <div className="header">
        <h1>Projects</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="form">
          <input
            type="text"
            placeholder="Project name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <button type="submit" className="btn-primary">Create</button>
        </form>
      )}

      <div className="projects-grid">
        {projectList.length === 0 ? (
          <p>No projects yet. Create one to get started!</p>
        ) : (
          projectList.map((project) => (
            <div key={project.id} className="project-card">
              <Link to={`/projects/${project.id}`}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </Link>
              <button
                className="btn-delete"
                onClick={() => handleDelete(project.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
