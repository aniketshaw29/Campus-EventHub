import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrationsApi } from '../api/registrations'
import { useStudent } from '../context/StudentContext.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function MyRegistrations() {
  const { student } = useStudent()
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!student) { setLoading(false); return }
    registrationsApi.byStudent(student.studentId)
      .then(setRegs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [student])

  async function cancel(id) {
    if (!confirm('Cancel this registration?')) return
    try {
      await registrationsApi.cancel(id)
      setRegs(r => r.filter(x => x.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (!student) return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
      <Alert type="info">Set your profile (navbar) to view your registrations.</Alert>
    </div>
  )

  return (
    <div>
      <div className="page-header"><h1>My Registrations</h1></div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : regs.length === 0 ? (
        <EmptyState icon="📋" title="No registrations yet"
          action={<button className="btn btn-primary" onClick={() => navigate('/events')}>Browse Events</button>} />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Event</th><th>Registered At</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {regs.map(r => (
                  <tr key={r.id}>
                    <td className="text-xs text-muted">#{r.id}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/events/${r.eventId}`)}>
                        Event #{r.eventId}
                      </button>
                    </td>
                    <td className="text-sm">{r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      {r.status === 'ACTIVE' && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(r.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
