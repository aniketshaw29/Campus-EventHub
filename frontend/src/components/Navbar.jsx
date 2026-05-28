import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStudent } from '../context/StudentContext.jsx'
import Modal from './Modal.jsx'

export default function Navbar() {
  const { student, setStudent } = useStudent()
  const [showProfile, setShowProfile] = useState(!student)
  const [form, setForm] = useState({ studentId: '', name: '', email: '' })
  const navigate = useNavigate()

  function saveProfile(e) {
    e.preventDefault()
    if (!form.studentId || !form.name || !form.email) return
    setStudent(form)
    setShowProfile(false)
  }

  const links = [
    { to: '/events', label: 'Events' },
    { to: '/my-registrations', label: 'My Registrations' },
    { to: '/my-tickets', label: 'My Tickets' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/admin', label: 'Admin' },
  ]

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" onClick={() => navigate('/events')} style={{ cursor: 'pointer' }}>
          Campus EventHub
        </span>
        <div className="navbar-links">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="navbar-student" onClick={() => setShowProfile(true)}>
          {student ? `${student.name} (${student.studentId})` : 'Set Profile'}
        </div>
      </nav>

      {showProfile && (
        <Modal title="Your Profile" onClose={student ? () => setShowProfile(false) : null}>
          <p className="text-sm text-muted mb-16">
            This is stored locally and used when registering for events.
          </p>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label>Student ID</label>
              <input
                placeholder="e.g. STU001"
                value={form.studentId}
                onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                placeholder="e.g. Alice Smith"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="alice@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">Save Profile</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
