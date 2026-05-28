import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi } from '../api/events'
import { registrationsApi } from '../api/registrations'
import { useStudent } from '../context/StudentContext.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'

export default function Register() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { student } = useStudent()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    eventsApi.get(id).then(setEvent).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  async function submit(e) {
    e.preventDefault()
    if (!student) { setError('Please set your profile first (click your name in the navbar).'); return }
    setSubmitting(true)
    setError(null)
    try {
      const reg = await registrationsApi.register({
        studentId: student.studentId,
        studentName: student.name,
        studentEmail: student.email,
        eventId: Number(id),
      })
      setSuccess(`Registration successful! ID: ${reg.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <button className="btn btn-outline btn-sm mb-16" onClick={() => navigate(-1)}>← Back</button>
      <div className="card">
        <h1 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Register for Event</h1>
        {event && <p className="text-muted mb-16">{event.title || event.name}</p>}

        {error && <Alert>{error}</Alert>}
        {success ? (
          <>
            <Alert type="success">{success}</Alert>
            <div className="flex gap-8 mt-16">
              <button className="btn btn-primary" onClick={() => navigate('/my-registrations')}>My Registrations</button>
              <button className="btn btn-outline" onClick={() => navigate('/events')}>Back to Events</button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            {student ? (
              <>
                <div className="form-group">
                  <label>Student ID</label>
                  <input value={student.studentId} disabled />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input value={student.name} disabled />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={student.email} disabled />
                </div>
              </>
            ) : (
              <Alert type="info">Please set your profile (click the profile chip in the navbar) before registering.</Alert>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting || !student}>
              {submitting ? 'Registering...' : 'Confirm Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
