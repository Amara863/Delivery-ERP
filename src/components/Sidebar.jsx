import { NavLink, useNavigate } from 'react-router-dom'
import { DRIVER_SESSION_KEY } from '../pages/DriverLogin'

const links = [
  { to: '/overview', icon: '▦', label: 'Overview' },
  { to: '/deliveries', icon: '▤', label: 'My Deliveries' },
  { to: '/route', icon: '⌖', label: 'Delivery Route' },
  { to: '/history', icon: '◷', label: 'Delivery History' },
  { to: '/profile', icon: '♙', label: 'My Profile' },
]

function Sidebar() {
  const navigate = useNavigate()

  let driver = null
  try {
    driver = JSON.parse(localStorage.getItem(DRIVER_SESSION_KEY) || 'null')
  } catch {
    driver = null
  }

  const handleLogout = () => {
    localStorage.removeItem(DRIVER_SESSION_KEY)
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div>
          <h2>Pinjrapole</h2>
          <p>Gaushala · Jaipur</p>
        </div>
      </div>

      {driver && (
        <div className="driver-chip">
          <strong>{driver.name}</strong>
          <span>{driver.email || driver.staffId || driver.role}</span>
        </div>
      )}

      <p className="menu-label">DELIVERY WORKSPACE</p>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

        <div className="help-card">
          <span>Need assistance?</span>
          <p>Contact your delivery manager for support.</p>
          <button type="button">Contact Support</button>
        </div>

        <p className="sidebar-footer">
          Pinjrapole Gaushala · Delivery Portal
        </p>
      </div>
    </aside>
  )
}

export default Sidebar