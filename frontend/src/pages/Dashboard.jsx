import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import ScoreRing from '../components/ScoreRing.jsx'
import Loader from '../components/Loader.jsx'
import ErrorNote from '../components/ErrorNote.jsx'
import { getStats, getReport } from '../api/foodverse.js'
import { getHistory, clearHistory } from '../store/history.js'
import './Dashboard.css'

const typeLabel = { recognize: 'Recognized', nutrition: 'Nutrition', freshness: 'Freshness', hygiene: 'Hygiene' }
const verdictTone = { Fresh: 'good', 'Moderately Fresh': 'warn', Spoiled: 'bad', Unclear: '' }
const alertTone = { high: 'bad', medium: 'warn' }

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const [history, setHistory] = useState(getHistory)
  const [stats, setStats] = useState(null)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Numbers come from the backend, calculated in plain Python from your saved results.
  const loadStats = useCallback(async () => {
    if (!history.length) {
      setStats(null)
      return
    }
    try {
      setStats(await getStats(history))
    } catch (err) {
      setError(err.message)
    }
  }, [history])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  async function makeReport() {
    setBusy(true)
    setError('')
    try {
      const result = await getReport(history)
      setReport(result.report)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    clearHistory()
    setHistory([])
    setReport(null)
    setStats(null)
  }

  if (!history.length) {
    return (
      <div className="page">
        <div className="container">
          <PageHeader tag="dashboard" title="Nothing here yet." text="Run a recognition, nutrition, freshness or hygiene check and your results will gather here." />
          <Link to="/recognize" className="btn">Analyze your first food <span className="arrow">→</span></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <PageHeader tag="dashboard" title="Your food at a glance." text="Built from the checks you ran in this browser. Photos are never stored." />
        <ErrorNote message={error} />

        {stats && (
          <div className="stack result">
            {stats.alerts.length > 0 && (
              <div className="stack">
                {stats.alerts.map((a) => (
                  <div key={a.text} className={`dash-alert ${alertTone[a.level]}`}>{a.text}</div>
                ))}
              </div>
            )}

            <div className="grid-3">
              <div className="card stack">
                <span className="mono small muted">CHECKS RUN</span>
                <strong className="dash-num">{stats.total}</strong>
                <div className="chips">
                  {Object.entries(stats.by_type).map(([t, n]) => <span className="chip" key={t}>{typeLabel[t] || t} {n}</span>)}
                </div>
              </div>
              <div className="card dash-ring">
                {stats.avg_health_score !== null ? <ScoreRing value={stats.avg_health_score} label="AVG HEALTH SCORE" /> : <p className="muted small">No nutrition checks yet.</p>}
              </div>
              <div className="card dash-ring">
                {stats.avg_hygiene_score !== null ? <ScoreRing value={stats.avg_hygiene_score} label="AVG HYGIENE SCORE" /> : <p className="muted small">No hygiene checks yet.</p>}
              </div>
            </div>

            <div className="grid-2">
              <div className="card stack">
                <h3>Nutrition summary</h3>
                {stats.avg_calories !== null
                  ? <p className="muted">Average meal: <strong className="dash-inline">{Math.round(stats.avg_calories)} kcal</strong> across {stats.by_type.nutrition} analysis{stats.by_type.nutrition > 1 ? 'es' : ''}.</p>
                  : <p className="muted small">Run a nutrition check to see this.</p>}
              </div>
              <div className="card stack">
                <h3>Freshness checks</h3>
                {Object.keys(stats.freshness).length
                  ? <div className="chips">{Object.entries(stats.freshness).map(([v, n]) => <span key={v} className={`pill ${verdictTone[v]}`}>{v} · {n}</span>)}</div>
                  : <p className="muted small">Run a freshness check to see this.</p>}
              </div>
            </div>

            <div className="card stack">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3>AI report</h3>
                <button className="btn btn-sm btn-ghost" onClick={makeReport} disabled={busy}>{report ? 'Refresh' : 'Generate'} report</button>
              </div>
              {busy && <Loader text="Writing your report…" />}
              {!report && !busy && <p className="muted small">Plain-language advice written from the numbers above.</p>}
              {report && (
                <div className="stack result">
                  <p>{report.summary}</p>
                  {report.nutrition_summary && <p className="muted">{report.nutrition_summary}</p>}
                  <div className="grid-2">
                    {report.safety_recommendations?.length > 0 && (
                      <div className="stack"><span className="tag">// safety</span><ul className="list">{report.safety_recommendations.map((r) => <li key={r}>{r}</li>)}</ul></div>
                    )}
                    {report.personal_guidance?.length > 0 && (
                      <div className="stack"><span className="tag">// for you</span><ul className="list">{report.personal_guidance.map((r) => <li key={r}>{r}</li>)}</ul></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="card stack">
              <h3>Recent</h3>
              <ul className="dash-recent">
                {stats.recent.map((h, i) => (
                  <li key={h.at + i}>
                    <span className="chip">{typeLabel[h.type] || h.type}</span>
                    <span className="dash-title">{h.title}</span>
                    <span className="muted small mono">{formatTime(h.at)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div><button className="btn btn-sm btn-ghost" onClick={reset}>Clear history</button></div>
          </div>
        )}
      </div>
    </div>
  )
}
