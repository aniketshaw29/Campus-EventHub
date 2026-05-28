import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { feedbackApi } from '../api/feedback'
import { useStudent } from '../context/StudentContext.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`star ${n <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(n)}
        >★</span>
      ))}
    </div>
  )
}

export default function Feedback() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { student } = useStudent()
  const [summary, setSummary] = useState(null)
  const [allFeedback, setAllFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      feedbackApi.summary(eventId).catch(() => null),
      feedbackApi.byEvent(eventId).catch(() => []),
    ])
      .then(([s, fb]) => { setSummary(s); setAllFeedback(fb) })
      .finally(() => setLoading(false))
  }, [eventId])

  async function submit(e) {
    e.preventDefault()
    if (!student) { setError('Set your profile first.'); return }
    if (rating === 0) { setError('Please select a rating.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await feedbackApi.submit({
        studentId: student.studentId,
        studentName: student.name,
        eventId: Number(eventId),
        rating,
        comment,
      })
      setSuccess(true)
      const [s, fb] = await Promise.all([
        feedbackApi.summary(eventId).catch(() => null),
        feedbackApi.byEvent(eventId).catch(() => []),
      ])
      setSummary(s); setAllFeedback(fb)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button className="btn btn-outline btn-sm mb-16" onClick={() => navigate(-1)}>← Back</button>
      <div className="page-header">
        <h1>Event Feedback</h1>
        <p>Event #{eventId}</p>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <h2 className="mb-16">Leave Feedback</h2>
            {error && <Alert>{error}</Alert>}
            {success ? (
              <Alert type="success">Thank you for your feedback!</Alert>
            ) : (
              <form onSubmit={submit}>
                <div className="form-group">
                  <label>Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="form-group">
                  <label>Comment (optional)</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            )}
          </div>

          <div>
            {summary && (
              <div className="card mb-16">
                <h2 className="mb-16">Summary</h2>
                <div className="flex-center gap-12">
                  <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{summary.averageRating?.toFixed(1) ?? '—'}</span>
                  <div>
                    <StarRating value={Math.round(summary.averageRating ?? 0)} />
                    <p className="text-xs text-muted mt-8">{summary.totalResponses ?? 0} reviews</p>
                  </div>
                </div>
              </div>
            )}
            <div className="card">
              <h2 className="mb-16">All Reviews</h2>
              {allFeedback.length === 0 ? (
                <p className="text-sm text-muted">No reviews yet.</p>
              ) : allFeedback.map(f => (
                <div key={f.id} style={{ marginBottom: 12 }}>
                  <div className="flex-center gap-8">
                    <StarRating value={f.rating} />
                    <span className="text-xs text-muted">{f.studentName}</span>
                  </div>
                  {f.comment && <p className="text-sm mt-8">{f.comment}</p>}
                  <hr className="divider" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
