import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import SpoolDetail from './pages/SpoolDetail'
import Navigation from './components/Navigation'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <Router>
      {token && <Navigation onLogout={handleLogout} user={user} />}
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
        <Route path="/" element={token ? <ProjectList /> : <Navigate to="/login" />} />
        <Route path="/projects/:id" element={token ? <ProjectDetail /> : <Navigate to="/login" />} />
        <Route path="/spools/:id" element={token ? <SpoolDetail /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}
