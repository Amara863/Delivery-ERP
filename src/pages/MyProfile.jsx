
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
  const [error, setError] = useState('')

  const displayName = profile.name || 'Delivery Staff'
  const displayStaffId = profile.staffId || 'Not assigned'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  const handleEdit = () => {
    setDraft({ ...profile })
    setEditing(true)
    setSaved(false)
    setError('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setDraft((current) => ({
      ...current,
      [name]: value,
    }))

    setSaved(false)
    setError('')
  }

  const handleCancel = () => {
    setDraft({ ...profile })
    setEditing(false)
    setSaved(false)
    setError('')
  }

  const handleSave = (event) => {
    event.preventDefault()
    setSaved(false)
    setError('')

    const updatedProfile = {
      ...draft,
      name: draft.name.trim(),
      staffId: profile.staffId,
      role: profile.role,
      phone: draft.phone.trim(),
      email: draft.email.trim().toLowerCase(),
    }

    if (!updatedProfile.name) {
      setError('Please enter your full name.')
      return
    }

    if (
      updatedProfile.phone &&
      !/^[+\d\s()-]{7,20}$/.test(updatedProfile.phone)
    ) {
      setError('Please enter a valid phone number.')
      return
    }

    if (
      updatedProfile.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedProfile.email)
    ) {
      setError('Please enter a valid email address.')
      return
    }

    // Temporary local state only.
    // Replace with an authenticated Supabase update before
    // claiming that profile changes are permanently saved.
    setProfile(updatedProfile)
    setDraft(updatedProfile)
    setEditing(false)
    setSaved(true)
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="breadcrumb">Workspace / My Profile</p>
          <h2>My Profile</h2>
          <p className="muted-text">
            View and manage your delivery staff information.
          </p>
        </div>

        <div className="profile-chip">
          <div className="avatar">{initials || 'DS'}</div>
          <div>
            <strong>{displayName}</strong>
            <p>{profile.role}</p>
          </div>
        </div>
      </header>

      <section className="section-heading">
        <div>
          <h2>Profile Information</h2>
          <p>Manage your personal and contact information.</p>
        </div>
      </section>

      <section className="orders-panel profile-panel">
        <div className="profile-banner">
          <div className="profile-large-avatar">
            {initials || 'DS'}
          </div>
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
              <p>
                Update your contact details. Staff ID and role
                are managed by an administrator.
              </p>
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
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Enter full name"
              />
            </label>

            <label>
              Staff ID
              <input
                type="text"
                name="staffId"
                value={profile.staffId}
                disabled
                readOnly
                placeholder="Assigned by administrator"
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
                maxLength={20}
                autoComplete="tel"
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
                maxLength={254}
                autoComplete="email"
                placeholder="Enter email address"
              />
            </label>

            <label className="profile-full-width">
              Role
              <input
                type="text"
                value={profile.role}
                disabled
                readOnly
              />
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

          {error && (
            <p className="profile-error" role="alert">
              {error}
            </p>
          )}

          {saved && (
            <p className="profile-success" role="status">
              Changes updated in the current session.
              Database saving is not connected yet.
            </p>
          )}
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
