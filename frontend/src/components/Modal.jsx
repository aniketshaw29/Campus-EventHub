import { useEffect } from 'react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && onClose) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose ? (e => { if (e.target === e.currentTarget) onClose() }) : undefined}>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          {onClose && <button className="modal-close" onClick={onClose}>✕</button>}
        </div>
        {children}
      </div>
    </div>
  )
}
