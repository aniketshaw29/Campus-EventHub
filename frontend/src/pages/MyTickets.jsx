import { useEffect, useState } from 'react'
import { registrationsApi } from '../api/registrations'
import { ticketsApi } from '../api/tickets'
import { useStudent } from '../context/StudentContext.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import QRImage from '../components/QRImage.jsx'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function MyTickets() {
  const { student } = useStudent()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!student) { setLoading(false); return }
    registrationsApi.byStudent(student.studentId)
      .then(regs =>
        Promise.all(
          regs
            .filter(r => r.status === 'ACTIVE')
            .map(r => ticketsApi.byRegistration(r.id).catch(() => null))
        )
      )
      .then(ts => setTickets(ts.filter(Boolean)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [student])

  if (!student) return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
      <Alert type="info">Set your profile to view your tickets.</Alert>
    </div>
  )

  return (
    <div>
      <div className="page-header"><h1>My Tickets</h1></div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : tickets.length === 0 ? (
        <EmptyState icon="🎫" title="No tickets yet"
          message="Tickets are generated automatically after registration." />
      ) : (
        <div className="card-grid">
          {tickets.map(t => (
            <div key={t.id} className="card">
              <div className="flex-center gap-8 mb-16">
                <StatusBadge status={t.status} />
                <span className="text-xs text-muted">Ticket #{t.id}</span>
              </div>
              <p className="text-sm fw-600">Event #{t.eventId}</p>
              <p className="text-xs text-muted mt-8">
                Generated: {t.generatedAt ? new Date(t.generatedAt).toLocaleDateString() : '—'}
              </p>
              <button className="btn btn-outline btn-sm mt-16" onClick={() => setSelected(t)}>
                View QR Code
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal title={`Ticket #${selected.id}`} onClose={() => setSelected(null)}>
          <p className="text-sm text-muted mb-16">Show this QR code at the event entrance.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <QRImage base64={selected.qrCode} />
          </div>
          <div className="mt-16">
            <p className="text-sm"><span className="text-muted">Event:</span> #{selected.eventId}</p>
            <p className="text-sm"><span className="text-muted">Registration:</span> #{selected.registrationId}</p>
            <p className="text-sm"><span className="text-muted">Status:</span> <StatusBadge status={selected.status} /></p>
          </div>
        </Modal>
      )}
    </div>
  )
}
