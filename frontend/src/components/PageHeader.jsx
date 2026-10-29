import './PageHeader.css'

export default function PageHeader({ tag, title, text }) {
  return (
    <header className="page-header">
      <span className="tag">// {tag}</span>
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
    </header>
  )
}
