import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { features, steps } from '../data/features.js'
import './Home.css'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-inner">
          <span className="tag hero-tag">// food intelligence</span>
          <h1 className="hero-title">
            Know exactly what <br />
            <em>is on your plate.</em>
          </h1>
          <p className="muted hero-text">
            Show FoodVerse a photo, a video, your voice or a few words. Get back what it is, what is in it,
            whether it is fresh and what to do next.
          </p>
          <div className="row">
            <Link to="/recognize" className="btn">Start with a photo <span className="arrow">→</span></Link>
            <Link to="/dashboard" className="btn btn-ghost">Open dashboard</Link>
          </div>

          <div className="hero-stats">
            <div><strong>4</strong><span className="muted small">input types</span></div>
            <div><strong>7</strong><span className="muted small">tools</span></div>
            <div><strong>0</strong><span className="muted small">accounts needed</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <span className="tag">// what you can do</span>
            <h2 className="section-title">Seven tools, one calm place</h2>
          </Reveal>
          <div className="feature-grid">
            {features.map((f, i) => (
              <Reveal key={f.path} delay={i * 60}>
                <Link to={f.path} className="card feature">
                  <span className="feature-icon">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p className="muted small">{f.text}</p>
                  <span className="feature-go">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <span className="tag">// how it works</span>
            <h2 className="section-title">Three steps, no manual</h2>
          </Reveal>
          <div className="steps">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="step">
                  <span className="mono step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="cta">
              <h2>Ready when you are.</h2>
              <Link to="/recognize" className="btn">Try it now <span className="arrow">→</span></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
