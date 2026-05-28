import { useEffect, useState } from 'react'
import { eventsApi } from '../api/events'
import { venuesApi } from '../api/venues'
import { announcementsApi } from '../api/announcements'
import { leaderboardApi } from '../api/leaderboard'
import { sponsorsApi } from '../api/sponsors'
import Alert from '../components/Alert.jsx'
import Spinner from '../components/Spinner.jsx'
import Modal from '../components/Modal.jsx'

const TABS = ['Events', 'Venues', 'Announcements', 'Results', 'Sponsors']

export default function Admin() {
  const [tab, setTab] = useState('Events')

  return (
    <div>
      <div className="page-header"><h1>Admin Dashboard</h1></div>
      <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Events' && <AdminEvents />}
      {tab === 'Venues' && <AdminVenues />}
      {tab === 'Announcements' && <AdminAnnouncements />}
      {tab === 'Results' && <AdminResults />}
      {tab === 'Sponsors' && <AdminSponsors />}
    </div>
  )
}

// ── Events ────────────────────────────────────────────────────────────────────

function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [venues, setVenues] = useState([])
  const [form, setForm] = useState({ title: '', description: '', date: '', category: '', maxCapacity: 100, venueId: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([eventsApi.list(), venuesApi.list()])
      .then(([ev, v]) => { setEvents(ev); setVenues(v) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function create(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const ev = await eventsApi.create({
        ...form,
        maxCapacity: Number(form.maxCapacity),
        venueId: form.venueId ? Number(form.venueId) : undefined,
      })
      setEvents(es => [ev, ...es])
      setShowForm(false)
      setForm({ title: '', description: '', date: '', category: '', maxCapacity: 100, venueId: '' })
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this event?')) return
    try { await eventsApi.delete(id); setEvents(es => es.filter(e => e.id !== id)) }
    catch (err) { setError(err.message) }
  }

  return (
    <div className="card">
      <div className="flex-center gap-8 mb-16">
        <h2 style={{ flex: 1 }}>Events</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ New Event</button>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Date</th><th>Capacity</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td className="fw-600 text-sm">{ev.title || ev.name}</td>
                  <td className="text-sm">{ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</td>
                  <td className="text-sm">{ev.currentRegistrations ?? 0}/{ev.maxCapacity ?? ev.capacity}</td>
                  <td><span className="badge badge-indigo">{ev.status}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(ev.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <Modal title="Create Event" onClose={() => setShowForm(false)}>
          <form onSubmit={create}>
            <div className="form-group"><label>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group"><label>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date &amp; Time</label>
                <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-group"><label>Max Capacity</label>
                <input type="number" min="1" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Technical" />
              </div>
              <div className="form-group"><label>Venue (optional)</label>
                <select value={form.venueId} onChange={e => setForm(f => ({ ...f, venueId: e.target.value }))}>
                  <option value="">— none —</option>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── Venues ────────────────────────────────────────────────────────────────────

function AdminVenues() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', location: '', capacity: 100, type: 'AUDITORIUM' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    venuesApi.list().then(setVenues).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function create(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const v = await venuesApi.create({ ...form, capacity: Number(form.capacity) })
      setVenues(vs => [v, ...vs])
      setShowForm(false)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="card">
      <div className="flex-center gap-8 mb-16">
        <h2 style={{ flex: 1 }}>Venues</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ New Venue</button>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Location</th><th>Capacity</th><th>Type</th></tr></thead>
            <tbody>
              {venues.map(v => (
                <tr key={v.id}>
                  <td className="fw-600 text-sm">{v.name}</td>
                  <td className="text-sm">{v.location}</td>
                  <td className="text-sm">{v.capacity}</td>
                  <td><span className="badge badge-gray">{v.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <Modal title="Create Venue" onClose={() => setShowForm(false)}>
          <form onSubmit={create}>
            <div className="form-group"><label>Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group"><label>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
            </div>
            <div className="form-row">
              <div className="form-group"><label>Capacity</label>
                <input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
              </div>
              <div className="form-group"><label>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['AUDITORIUM', 'CLASSROOM', 'LAB', 'OUTDOOR'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── Announcements ─────────────────────────────────────────────────────────────

function AdminAnnouncements() {
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', type: 'GENERAL', eventId: '', publishedBy: 'Admin' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([eventsApi.list(), announcementsApi.list()])
      .then(([ev, ann]) => { setEvents(ev); setAnnouncements(ann) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function create(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const a = await announcementsApi.create({
        ...form,
        eventId: form.eventId ? Number(form.eventId) : null,
      })
      setAnnouncements(as => [a, ...as])
      setShowForm(false)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="card">
      <div className="flex-center gap-8 mb-16">
        <h2 style={{ flex: 1 }}>Announcements</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ New Announcement</button>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Event</th><th>Published At</th></tr></thead>
            <tbody>
              {announcements.map(a => (
                <tr key={a.id}>
                  <td className="fw-600 text-sm">{a.title}</td>
                  <td><span className="badge badge-indigo">{a.type}</span></td>
                  <td className="text-sm text-muted">{a.eventId ? `#${a.eventId}` : '—'}</td>
                  <td className="text-sm">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <Modal title="Create Announcement" onClose={() => setShowForm(false)}>
          <form onSubmit={create}>
            <div className="form-group"><label>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group"><label>Content</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
            </div>
            <div className="form-row">
              <div className="form-group"><label>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['GENERAL', 'EVENT_UPDATE', 'VENUE_CHANGE', 'EMERGENCY'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Event (optional)</label>
                <select value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))}>
                  <option value="">— all —</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Publish'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── Results ───────────────────────────────────────────────────────────────────

function AdminResults() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ eventId: '', eventTitle: '', studentId: '', studentName: '', position: 'FIRST', category: '' })
  const [saving, setSaving] = useState(false)
  const [published, setPublished] = useState([])

  useEffect(() => {
    eventsApi.list().then(setEvents).catch(e => setError(e.message))
  }, [])

  async function publish(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const r = await leaderboardApi.publish({
        ...form,
        eventId: Number(form.eventId),
      })
      setPublished(p => [r, ...p])
      setShowForm(false)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="card">
      <div className="flex-center gap-8 mb-16">
        <h2 style={{ flex: 1 }}>Publish Results</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Publish Result</button>
      </div>
      {error && <Alert>{error}</Alert>}
      {published.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Event</th><th>Position</th><th>Points</th></tr></thead>
            <tbody>
              {published.map(r => (
                <tr key={r.id}>
                  <td className="fw-600 text-sm">{r.studentName}</td>
                  <td className="text-sm">{r.eventTitle}</td>
                  <td><span className="badge badge-indigo">{r.position}</span></td>
                  <td className="fw-600">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!published.length && <p className="text-sm text-muted">No results published this session.</p>}
      {showForm && (
        <Modal title="Publish Result" onClose={() => setShowForm(false)}>
          <form onSubmit={publish}>
            <div className="form-group"><label>Event</label>
              <select value={form.eventId} onChange={e => {
                const ev = events.find(x => x.id === Number(e.target.value))
                setForm(f => ({ ...f, eventId: e.target.value, eventTitle: ev ? (ev.title || ev.name) : '' }))
              }} required>
                <option value="">Select event</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Student ID</label>
                <input value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required />
              </div>
              <div className="form-group"><label>Student Name</label>
                <input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Position</label>
                <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                  {['FIRST', 'SECOND', 'THIRD', 'PARTICIPANT'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Category (optional)</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Publishing...' : 'Publish'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── Sponsors ──────────────────────────────────────────────────────────────────

function AdminSponsors() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', tier: 'GOLD', website: '', contactEmail: '', contactPerson: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    sponsorsApi.list().then(setSponsors).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function create(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const s = await sponsorsApi.create(form)
      setSponsors(ss => [s, ...ss])
      setShowForm(false)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="card">
      <div className="flex-center gap-8 mb-16">
        <h2 style={{ flex: 1 }}>Sponsors</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ New Sponsor</button>
      </div>
      {error && <Alert>{error}</Alert>}
      {loading ? <Spinner /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Tier</th><th>Contact</th><th>Website</th></tr></thead>
            <tbody>
              {sponsors.map(s => (
                <tr key={s.id}>
                  <td className="fw-600 text-sm">{s.name}</td>
                  <td><span className="badge badge-yellow">{s.tier}</span></td>
                  <td className="text-sm">{s.contactPerson} — {s.contactEmail}</td>
                  <td className="text-sm text-muted">{s.website}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <Modal title="Create Sponsor" onClose={() => setShowForm(false)}>
          <form onSubmit={create}>
            <div className="form-row">
              <div className="form-group"><label>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group"><label>Tier</label>
                <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                  {['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Contact Person</label>
                <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} />
              </div>
              <div className="form-group"><label>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
              </div>
            </div>
            <div className="form-group"><label>Website</label>
              <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="form-group"><label>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
