export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p className="text-sm">{message}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  )
}
