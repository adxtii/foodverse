import './Loader.css'

export default function Loader({ text = 'Analyzing…' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader-ring" />
      <span className="mono small muted">{text}</span>
    </div>
  )
}
