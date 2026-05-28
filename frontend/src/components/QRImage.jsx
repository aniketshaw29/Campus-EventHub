export default function QRImage({ base64, alt = 'QR Code' }) {
  if (!base64) return null
  const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
  return <img src={src} alt={alt} className="qr-img" />
}
