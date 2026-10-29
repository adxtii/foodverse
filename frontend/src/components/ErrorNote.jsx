import './ErrorNote.css'

export default function ErrorNote({ message }) {
  if (!message) return null
  return (
    <div className="error-note" role="alert">
      {message}
    </div>
  )
}
