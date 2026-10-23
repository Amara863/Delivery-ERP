
import { useState } from 'react'

const initialProfile = {
  name: '',
  staffId: '',
  phone: '',
  email: '',
  role: 'Delivery Partner',
}

function MyProfile() {
  const [profile, setProfile] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setDraft((current) => ({
      ...current,
      [name]: value,
    }))

    setSaved(false)
  }

  const handleEdit = () => {
    setDraft({ ...profile })
    setEditing(true)
    setSaved(false)
  }

  const handleCancel = () => {
    setDraft({ ...profile })
    setEditing(false)
    setSaved(false)
  }

  const handleSave = (event) => {
    event.preventDefault()

    const updatedProfile = {
      ...draft,
      name: draft.name.trim(),
      staffId: draft.staffId.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
    }

    setProfile(updatedProfile)
    setDraft(updatedProfile)
    setEditing(false)
    setSaved(true)
  }

  const displayName = profile.name || 'Delivery Staff'
  const displayStaffId = profile.staffId || 'Not assigned'

  return (
    <>
      <header className="topbar">
        <div>
          <p className="breadcrumb">Workspace / My Profile</p>
          <h2>My Profile</h2>
          <p className="muted-text">
            View and edit your delivery staff profile.
          </p>
        </div>

        <div className="profile-chip">
          <div className="avatar">DS</div>
          <div>
            <strong>{displayName}</strong>
            <p>{profile.role}</p>
          </div>
        </div>
      </header>

      <section className="section-heading">
        <div>
          <h2>Profile Information</h2>
          <p>Manage your basic contact information.</p>
        </div>

        <span className="date-label">PREVIEW MODE</span>
      </section>

      <section className="orders-panel profile-panel">
        <div className="profile-banner">
          <div className="profile-large-avatar">DS</div>
          <div>
            <h2>{displayName}</h2>
            <p>{profile.role}</p>
            <span>Staff ID: {displayStaffId}</span>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-form-heading">
            <div>
              <h3>Personal Details</h3>
              <p>Enter your information below.</p>
            </div>

            {!editing && (
              <button
                type="button"
                className="profile-edit-button"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="profile-fields">
            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={editing ? draft.name : profile.name}
                onChange={handleChange}
                disabled={!editing}
                placeholder={
                  editing ? 'Enter full name' : 'Delivery Staff'
                }
              />
            </label>

            <label>
              Staff ID
              <input
                type="text"
                name="staffId"
                value={editing ? draft.staffId : profile.staffId}
                onChange={handleChange}
                disabled={!editing}
                placeholder={
                  editing ? 'Enter staff ID' : 'Not assigned'
                }
                autoComplete="off"
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={editing ? draft.phone : profile.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter phone number"
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={editing ? draft.email : profile.email}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter email address"
              />
            </label>

            <label className="profile-full-width">
              Role
              <select
                name="role"
                value={editing ? draft.role : profile.role}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="Delivery Partner">
                  Delivery Partner
                </option>
                <option value="Delivery Staff">
                  Delivery Staff
                </option>
                <option value="Delivery Supervisor">
                  Delivery Supervisor
                </option>
              </select>
            </label>
          </div>

          {editing && (
            <div className="profile-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
              >
                Save Changes
              </button>
            </div>
          )}

          {saved && (
            <p className="profile-success" role="status">
              Profile updated for this preview session.
            </p>
          )}

          <p className="demo-note">
            Preview only. Profile changes are held in the
            current page state and are not saved to a database.
          </p>
        </form>
      </section>

      <footer className="page-footer">
        <span>© E-SDMART · Delivery Workspace</span>
        <span>Fresh from farm to doorstep</span>
      </footer>
    </>
  )
}

export default MyProfile
