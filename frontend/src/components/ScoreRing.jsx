import { useEffect, useState } from 'react'
import './ScoreRing.css'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function colorFor(value) {
  if (value >= 70) return 'var(--good)'
  if (value >= 45) return 'var(--warn)'
  return 'var(--bad)'
}

// Circular score from 0 to 100 that animates in.
export default function ScoreRing({ value, label }) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setShown(value), 60)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="ring">
      <svg viewBox="0 0 120 120" aria-label={`${label}: ${value} out of 100`}>
        <circle className="ring-bg" cx="60" cy="60" r={RADIUS} />
        <circle
          className="ring-fg"
          cx="60" cy="60" r={RADIUS}
          stroke={colorFor(value)}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - shown / 100)}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="67" textAnchor="middle" className="ring-num">{Math.round(value)}</text>
      </svg>
      <span className="mono small muted">{label}</span>
    </div>
  )
}
