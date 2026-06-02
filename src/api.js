import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://pipefabar-backend-dq7l.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
}

export const projects = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (name, job_number, color, spool_naming_template) =>
    api.post('/projects', { name, job_number, color, spool_naming_template }),
  update: (id, name, job_number, color, spool_naming_template) =>
    api.put(`/projects/${id}`, { name, job_number, color, spool_naming_template }),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const workPackages = {
  list: (projectId) => api.get(`/workPackages/project/${projectId}`),
  create: (project_id, name, package_number, status, due_date, notes) =>
    api.post('/workPackages', { project_id, name, package_number, status, due_date, notes }),
  update: (id, name, package_number, status, due_date, notes) =>
    api.put(`/workPackages/${id}`, { name, package_number, status, due_date, notes }),
  delete: (id) => api.delete(`/workPackages/${id}`),
}

export const spools = {
  list: (workPackageId) => api.get(`/spools/workPackage/${workPackageId}`),
  get: (id) => api.get(`/spools/${id}`),
  create: (project_id, work_package_id, name, system_type, status, pipe_points_data) =>
    api.post('/spools', { project_id, work_package_id, name, system_type, status, pipe_points_data }),
  update: (id, name, system_type, status, pipe_points_data, zoom_scale, pan_offset_x, pan_offset_y, work_package_id) =>
    api.put(`/spools/${id}`, { name, system_type, status, pipe_points_data, zoom_scale, pan_offset_x, pan_offset_y, work_package_id }),
  delete: (id) => api.delete(`/spools/${id}`),
}

export const specifications = {
  list: () => api.get('/specifications'),
  init: () => api.post('/specifications/init'),
  create: (spec_description, abbreviation) =>
    api.post('/specifications', { spec_description, abbreviation }),
  update: (id, spec_description, abbreviation, sort_order) =>
    api.put(`/specifications/${id}`, { spec_description, abbreviation, sort_order }),
  setDefault: (id) => api.post(`/specifications/${id}/set-default`),
  delete: (id) => api.delete(`/specifications/${id}`),
}

export const profile = {
  get: () => api.get('/profile'),
  update: (name, phone_number, email) =>
    api.put('/profile', { name, phone_number, email }),
}

export default api
