import { useEffect, useState } from 'react'
import { certificatesApi } from '../api/certificates'
import { useStudent } from '../context/StudentContext.jsx'
import Spinner from '../components/Spinner.jsx'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Certificates() {
  const { student } = useStudent()
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!student) { setLoading(false); return }
    certificatesApi.byStudent(student.studentId)
      .then(setCerts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [student])

  if (!student) return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
      <Alert type="info">Set your profile to view certificates.</Alert>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>My Certificates</h1>
        <p>Certificates are issued automatically after attendance is marked.</p>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : certs.length === 0 ? (
        <EmptyState icon="🏆" title="No certificates yet"
          message="Attend an event to receive your certificate." />
      ) : (
        <div className="card-grid">
          {certs.map(c => (
            <div key={c.id} className="card">
              <p className="text-xs text-muted mb-16">Certificate #{c.certificateNumber}</p>
              <h3>{c.eventTitle}</h3>
              <p className="text-sm text-muted mt-8">
                Issued: {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : '—'}
              </p>
              <a
                href={certificatesApi.downloadUrl(c.id)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm mt-16"
                style={{ display: 'inline-flex' }}
              >
                Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
