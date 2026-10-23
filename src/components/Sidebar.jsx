
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/overview', icon: '▦', label: 'Overview' },
  { to: '/deliveries', icon: '▤', label: 'My Deliveries' },
  { to: '/route', icon: '⌖', label: 'Delivery Route' },
  { to: '/history', icon: '◷', label: 'Delivery History' },
  { to: '/profile', icon: '♙', label: 'My Profile' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div>
          <h2>Pinjrapole</h2>
          <p>Gaushala · Jaipur</p>
        </div>
      </div>

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
