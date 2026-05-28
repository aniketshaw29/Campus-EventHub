const MAP = {
  UPCOMING:    'badge-indigo',
  ONGOING:     'badge-green',
  COMPLETED:   'badge-gray',
  ACTIVE:      'badge-green',
  CANCELLED:   'badge-red',
  VALID:       'badge-green',
  USED:        'badge-gray',
  PRESENT:     'badge-green',
  ABSENT:      'badge-red',
  SENT:        'badge-green',
  FAILED:      'badge-red',
  FIRST:       'badge-yellow',
  SECOND:      'badge-gray',
  THIRD:       'badge-yellow',
  PARTICIPANT: 'badge-indigo',
  PLATINUM:    'badge-indigo',
  GOLD:        'badge-yellow',
  SILVER:      'badge-gray',
  BRONZE:      'badge-yellow',
}

export default function StatusBadge({ status }) {
  const cls = MAP[status] || 'badge-gray'
  return <span className={`badge ${cls}`}>{status}</span>
}
