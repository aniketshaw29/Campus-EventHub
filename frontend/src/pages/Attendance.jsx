import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { registrationsApi } from '../api/registrations'
import { attendanceApi } from '../api/attendance'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Attendance() {
  const { eventId } = useParams()
  const [registrations, setRegistrations] = useState([])
  const [attended, setAttended] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [marking, setMarking] = useState(null)

  useEffect(() => {
    Promise.all([
      registrationsApi.byEvent(eventId),
      attendanceApi.byEvent(eventId),
    ])
      .then(([regs, att]) => {
        setRegistrations(regs.filter(r => r.status === 'ACTIVE'))
        const map = {}
        att.forEach(a => { map[a.registrationId] = a })
        setAttended(map)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [eventId])

  async function mark(reg) {
    setMarking(reg.id)
    setError(null)
    try {
      const att = await attendanceApi.mark({
        registrationId: reg.id,
        studentId: reg.studentId,
        studentName: reg.studentName,
        studentEmail: reg.studentEmail,
        eventId: Number(eventId),
      })
      setAttended(a => ({ ...a, [reg.id]: att }))
    } catch (e) {
      setError(e.message)
    } finally {
      setMarking(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Event #{eventId}</p>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : registrations.length === 0 ? (
        <EmptyState icon="👥" title="No registrations" message="No active registrations for this event." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Student ID</th><th>Email</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {registrations.map(r => {
                  const att = attended[r.id]
                  return (
                    <tr key={r.id}>
                      <td className="fw-600 text-sm">{r.studentName}</td>
                      <td className="text-sm">{r.studentId}</td>
                      <td className="text-sm text-muted">{r.studentEmail}</td>
                      <td>
                        {att
                          ? <StatusBadge status={att.status} />
                          : <span className="badge badge-gray">NOT MARKED</span>}
                      </td>
                      <td>
                        {!att && (
                          <button
                            className="btn btn-success btn-sm"
                            disabled={marking === r.id}
                            onClick={() => mark(r)}
                          >
                            {marking === r.id ? '...' : 'Mark Present'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
