import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../api/events'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'

const STATUSES = ['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED']

export default function Events() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const req = filter === 'ALL' ? eventsApi.list() : eventsApi.listByStatus(filter)
    req
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div>
      <div className="page-header">
        <h1>Events</h1>
        <p>Browse and register for upcoming campus events</p>
      </div>

      <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button
            key={s}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : events.length === 0 ? (
        <EmptyState icon="📅" title="No events found" message="Try a different status filter." />
      ) : (
        <div className="card-grid">
          {events.map(ev => (
            <div key={ev.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${ev.id}`)}>
              <div className="flex-center gap-8 mb-16">
                <StatusBadge status={ev.status} />
                <span className="text-xs text-muted">{ev.category}</span>
              </div>
              <h3>{ev.title || ev.name}</h3>
              <div className="card-meta">
                <span>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                <span>{ev.currentRegistrations ?? 0} / {ev.maxCapacity ?? ev.capacity ?? '?'} registered</span>
              </div>
              <p className="text-sm text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {ev.description}
              </p>
              <div className="mt-16">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(100, ((ev.currentRegistrations ?? 0) / (ev.maxCapacity ?? ev.capacity ?? 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
