import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsApi } from '../api/events'
import { venuesApi } from '../api/venues'
import { announcementsApi } from '../api/announcements'
import { feedbackApi } from '../api/feedback'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [venue, setVenue] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      eventsApi.get(id),
      venuesApi.forEvent(id).catch(() => null),
      announcementsApi.byEvent(id).catch(() => []),
      feedbackApi.summary(id).catch(() => null),
    ])
      .then(([ev, v, ann, sum]) => { setEvent(ev); setVenue(v); setAnnouncements(ann); setSummary(sum) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (!event) return null

  const capacity = event.maxCapacity ?? event.capacity ?? 0
  const registered = event.currentRegistrations ?? 0
  const full = capacity > 0 && registered >= capacity

  return (
    <div>
      <button className="btn btn-outline btn-sm mb-16" onClick={() => navigate(-1)}>← Back</button>

      <div className="card mb-16">
        <div className="flex-center gap-8 mb-16">
          <StatusBadge status={event.status} />
          {event.category && <span className="badge badge-gray">{event.category}</span>}
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{event.title || event.name}</h1>
        <p className="text-muted mb-16">{event.description}</p>

        <div className="form-row" style={{ marginBottom: 0 }}>
          <div>
            <p className="text-xs text-muted">Date &amp; Time</p>
            <p className="fw-600">{event.date ? new Date(event.date).toLocaleString() : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Capacity</p>
            <p className="fw-600">{registered} / {capacity || '—'}</p>
          </div>
        </div>

        {venue && (
          <>
            <hr className="divider" />
            <p className="text-xs text-muted">Venue</p>
            <p className="fw-600">{venue.name} — {venue.location}</p>
          </>
        )}

        <hr className="divider" />
        <div className="flex gap-8">
          {!full && event.status !== 'COMPLETED' && (
            <button className="btn btn-primary" onClick={() => navigate(`/events/${id}/register`)}>
              Register Now
            </button>
          )}
          {full && <span className="badge badge-red" style={{ padding: '8px 16px' }}>Event Full</span>}
          <Link to={`/feedback/${id}`} className="btn btn-outline">Leave Feedback</Link>
          <Link to={`/attendance/${id}`} className="btn btn-outline">Mark Attendance</Link>
        </div>
      </div>

      {summary && (
        <div className="card mb-16">
          <h2>Feedback Summary</h2>
          <div className="flex-center gap-12 mt-8">
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{summary.averageRating?.toFixed(1) ?? '—'}</span>
            <div>
              <p className="text-sm">Average rating</p>
              <p className="text-xs text-muted">{summary.totalResponses ?? 0} responses</p>
            </div>
          </div>
        </div>
      )}

      {announcements.length > 0 && (
        <div className="card">
          <h2 className="mb-16">Announcements</h2>
          {announcements.map(a => (
            <div key={a.id} style={{ marginBottom: '12px' }}>
              <p className="fw-600 text-sm">{a.title}</p>
              <p className="text-sm text-muted">{a.content}</p>
              <p className="text-xs text-muted" style={{ marginTop: 4 }}>
                {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ''}
              </p>
              <hr className="divider" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
