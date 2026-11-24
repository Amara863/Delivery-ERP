import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginHero from '../assets/login-hero.png'

export const DRIVER_SESSION_KEY = 'pinjrapole_driver_session'

const DRIVERS = [
  {
    key: 'om',
    name: 'Om Yadav',
    roleLabel: 'Delivery Driver',
    subtitle: 'Om Yadav — Assigned delivery route & orders',
    email: 'Omyadav@pinjrapole.com',
    password: 'Omyadav#123',
  },
  {
    key: 'naresh',
    name: 'Naresh Joshi',
    roleLabel: 'Delivery Driver',
    subtitle: 'Naresh Joshi — Assigned delivery route & orders',
    email: 'Nareshjoshi@pinjrapole.com',
    password: 'Nareshjoshi#123',
  },
]

function DriverLogin() {
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState('om')
  const [email, setEmail] = useState(DRIVERS[0].email)
  const [password, setPassword] = useState(DRIVERS[0].password)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const activeDriver =
    DRIVERS.find((d) => d.key === selectedKey) || DRIVERS[0]

  const handleSelectDriver = (driver) => {
    setSelectedKey(driver.key)
    setEmail(driver.email)
    setPassword(driver.password)
    setErrorMsg('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)

    const matchedDriver = DRIVERS.find(
      (driver) =>
        driver.email.toLowerCase() === cleanEmail &&
        driver.password === cleanPassword
    )

    if (!matchedDriver) {
      setLoading(false)
      setErrorMsg('Invalid email or password for Pinjrapole delivery partner.')
      return
    }

    localStorage.setItem(
      DRIVER_SESSION_KEY,
      JSON.stringify({
        name: matchedDriver.name,
        email: matchedDriver.email,
        role: matchedDriver.roleLabel,
      })
    )

    setLoading(false)
    navigate('/overview', { replace: true })
  }

  return (
    <div className="gok-login-shell">
      <div className="gok-login-left">
<img
  src={loginHero} // Naya imported variable
  alt="Pinjrapole Gaushala Delivery"
  className="gok-login-bg"
/>
        <div className="gok-login-scrim" />

        <div className="gok-login-badge">
          <strong>Pinjrapole Gaushala</strong>
          <span>Delivery Portal</span>
        </div>

        <div className="gok-login-hero-copy">
          <span className="gok-login-kicker">
            Gaushala · Jaipur · Delivery operations
          </span>
          <h1>Pinjrapole Delivery Workspace</h1>
          <p>
            Fresh gaushala deliveries and daily customer orders handled with
            clear route stops and status tracking.
          </p>

          <div className="gok-login-stats">
            <div>
              <strong>2</strong>
              <span>Active driver accounts</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Order &amp; route updates</span>
            </div>
            <div>
              <strong>Doorstep</strong>
              <span>Delivery handover</span>
            </div>
          </div>
        </div>
      </div>

      <div className="gok-login-right">
        <div className="gok-login-panel">
          <h2>Driver login</h2>
          <p className="gok-login-sub">
            Choose your driver account and sign in
          </p>

          <div className="gok-driver-pills">
            {DRIVERS.map((driver) => (
              <button
                key={driver.key}
                type="button"
                className={`gok-driver-pill${
                  selectedKey === driver.key ? ' active' : ''
                }`}
                onClick={() => handleSelectDriver(driver)}
              >
                {driver.name}
              </button>
            ))}
          </div>

          <p className="gok-selected-note">{activeDriver.subtitle}</p>

          {errorMsg && <div className="login-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="gok-login-form">
            <label className="gok-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter driver email"
                required
              />
            </label>

            <label className="gok-field">
              <span>Password</span>
              <div className="gok-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="gok-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="gok-login-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Login as ${activeDriver.name}`}
            </button>
          </form>

          <div className="gok-info-banner">
            <span className="gok-info-icon">ⓘ</span>
            <span>
              No sign-up here, delivery accounts are managed by admin side
            </span>
          </div>

          <div className="gok-accounts-section">
            <p className="gok-accounts-title">
              Driver accounts (click to fill credentials)
            </p>

            <div className="gok-accounts-list">
              {DRIVERS.map((driver) => (
                <button
                  key={driver.key}
                  type="button"
                  className={`gok-account-card${
                    selectedKey === driver.key ? ' selected' : ''
                  }`}
                  onClick={() => handleSelectDriver(driver)}
                >
                  <strong>{driver.name}</strong>
                  <span>{driver.roleLabel}</span>
                  <small>{driver.email}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverLogin