import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { features } from '../data/features.js'
import './Navbar.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" onClick={close}>
          <span className="nav-dot" /> FoodVerse
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {features.map((f) => (
            <NavLink key={f.path} to={f.path} onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
              {f.title}
            </NavLink>
          ))}
        </nav>

        <Link to="/recognize" className="btn btn-sm nav-cta">
          Try it <span className="arrow">→</span>
        </Link>

        <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </div>
    </header>
  )
}
