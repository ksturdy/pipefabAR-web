import { useNavigate } from 'react-router-dom'
import '../styles/Navigation.css'

export default function Navigation({ onLogout, user }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="navigation">
      <div className="nav-left">
        <h2>PipeFabAR</h2>
      </div>
      <div className="nav-right">
        <span>{user?.email}</span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  )
}
