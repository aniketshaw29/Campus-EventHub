import { useEffect, useState } from 'react'
import { leaderboardApi } from '../api/leaderboard'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'

const MEDAL = { FIRST: '🥇', SECOND: '🥈', THIRD: '🥉', PARTICIPANT: '🎖️' }

export default function Leaderboard() {
  const [top, setTop] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    leaderboardApi.top(20)
      .then(setTop)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const podium = top.slice(0, 3)
  const rest = top.slice(3)

  return (
    <div>
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>Top performers across all events</p>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : top.length === 0 ? (
        <EmptyState icon="🏆" title="No results yet" message="Results will appear here once published." />
      ) : (
        <>
          {podium.length >= 2 && (
            <div className="podium mb-16">
              {podium[1] && (
                <div className="podium-slot">
                  <div className="medal">🥈</div>
                  <div className="podium-bar second">2</div>
                  <div className="name">{podium[1].studentName}</div>
                  <div className="pts">{podium[1].points} pts</div>
                </div>
              )}
              <div className="podium-slot">
                <div className="medal">🥇</div>
                <div className="podium-bar first">1</div>
                <div className="name">{podium[0].studentName}</div>
                <div className="pts">{podium[0].points} pts</div>
              </div>
              {podium[2] && (
                <div className="podium-slot">
                  <div className="medal">🥉</div>
                  <div className="podium-bar third">3</div>
                  <div className="name">{podium[2].studentName}</div>
                  <div className="pts">{podium[2].points} pts</div>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Student</th><th>Event</th><th>Position</th><th>Points</th></tr>
                </thead>
                <tbody>
                  {top.map((r, i) => (
                    <tr key={r.id}>
                      <td className="text-sm text-muted">{i + 1}</td>
                      <td className="fw-600 text-sm">
                        {MEDAL[r.position] || ''} {r.studentName}
                      </td>
                      <td className="text-sm text-muted">{r.eventTitle || `Event #${r.eventId}`}</td>
                      <td><StatusBadge status={r.position} /></td>
                      <td className="fw-600">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
