import { DRIVER_SESSION_KEY } from './DriverLogin'

function getLoggedInDriver() {
  try {
    const raw = localStorage.getItem(DRIVER_SESSION_KEY)
    if (!raw) {
      return {
        name: 'Om Yadav',
        email: 'Omyadav@pinjrapole.com',
        role: 'Delivery Partner',
      }
    }
    const parsed = JSON.parse(raw)
    return {
      name: parsed?.name || 'Om Yadav',
      email: parsed?.email || 'Omyadav@pinjrapole.com',
      role: parsed?.role || 'Delivery Partner',
    }
  } catch {
    return {
      name: 'Om Yadav',
      email: 'Omyadav@pinjrapole.com',
      role: 'Delivery Partner',
    }
  }
}

const preventSelectAndFocus = (e) => {
  e.preventDefault()
  if (e.currentTarget && typeof e.currentTarget.blur === 'function') {
    e.currentTarget.blur()
  }
}

function MyProfile() {
  const driver = getLoggedInDriver()
  const initials = (driver.name || 'OY')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="breadcrumb">Workspace / My Profile</p>
          <h1>My Profile</h1>
          <p className="page-subtitle">Logged-in delivery driver details.</p>
        </div>

        <div className="header-profile-badge">
          <div className="avatar-badge">{initials}</div>
          <div>
            <strong>{driver.name}</strong>
            <span>{driver.role}</span>
          </div>
        </div>
      </div>

      <section className="profile-section">
        <h2>Driver Information</h2>
        <p className="section-subtitle">
          Information for the currently signed-in driver account.
        </p>

        <div className="profile-card">
          <div className="profile-summary-row">
            <div className="avatar-lg">{initials[0] || 'O'}</div>
            <div className="profile-summary-meta">
              <h3>{driver.name}</h3>
              <p>{driver.role}</p>
              <span>{driver.email}</span>
            </div>
          </div>

          <hr className="profile-divider" />

          <div className="account-details-block">
            <h3>Account Details</h3>
            <p className="section-subtitle">Active session profile details.</p>

            <div className="profile-grid-two">
              <div className="profile-field">
                <label htmlFor="driverName">Driver Name</label>
                <input
                  id="driverName"
                  type="text"
                  value={driver.name}
                  readOnly
                  tabIndex={-1}
                  onMouseDown={preventSelectAndFocus}
                  onFocus={preventSelectAndFocus}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="driverEmail">Email Address</label>
                <input
                  id="driverEmail"
                  type="email"
                  value={driver.email}
                  readOnly
                  tabIndex={-1}
                  onMouseDown={preventSelectAndFocus}
                  onFocus={preventSelectAndFocus}
                />
              </div>
            </div>

            <div className="profile-field profile-field-full">
              <label htmlFor="driverRole">Role</label>
              <input
                id="driverRole"
                type="text"
                value={driver.role}
                readOnly
                tabIndex={-1}
                onMouseDown={preventSelectAndFocus}
                onFocus={preventSelectAndFocus}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="workspace-footer">
        <span>© Pinjrapole Gaushala · Delivery Workspace</span>
        <span>Fresh from farm to doorstep</span>
      </footer>
    </div>
  )
}

export default MyProfile