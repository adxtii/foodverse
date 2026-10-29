import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import UploadBox from '../components/UploadBox.jsx'
import Loader from '../components/Loader.jsx'
import ErrorNote from '../components/ErrorNote.jsx'
import useAnalysis from '../hooks/useAnalysis.js'
import { checkFreshness } from '../api/foodverse.js'
import { addHistory } from '../store/history.js'
import './Freshness.css'

const verdictTone = { Fresh: 'good', 'Moderately Fresh': 'warn', Spoiled: 'bad', Unclear: '' }
const concernTone = { none: 'good', minor: 'warn', major: 'bad' }

export default function Freshness() {
  const [files, setFiles] = useState([])
  const [note, setNote] = useState('')
  const { data, loading, error, run } = useAnalysis(checkFreshness)

  async function submit(e) {
    e.preventDefault()
    const result = await run(files, note)
    if (result?.is_food) {
      addHistory({ type: 'freshness', title: result.item, metrics: { verdict: result.verdict } })
    }
  }

  return (
    <div className="page">
      <div className="container">
        <PageHeader tag="freshness" title="Is it still good?" text="A clear, well-lit photo works best. We look at color, texture, discoloration and surface." />

        <form className="stack freshness-form" onSubmit={submit}>
          <UploadBox files={files} onChange={setFiles} multiple max={3} label="Drop photos of the food" hint="Close-ups in daylight give better results" />
          <div className="field">
            <label>OPTIONAL NOTE</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Bought 5 days ago, kept in the fridge" />
          </div>
          <button className="btn" disabled={loading || !files.length}>
            {loading ? 'Checking…' : 'Check freshness'} <span className="arrow">→</span>
          </button>
        </form>

        <div className="freshness-results">
          {loading && <Loader text="Inspecting…" />}
          <ErrorNote message={error} />
          {data && !data.is_food && <p className="muted result">{data.message || 'No food was found.'}</p>}

          {data?.is_food && (
            <div className="result stack">
              <hr className="divider" />
              <div className="row freshness-head">
                <h3 className="freshness-item">{data.item}</h3>
                <span className={`pill verdict ${verdictTone[data.verdict]}`}>{data.verdict}</span>
                <span className="muted small mono">{data.confidence} confidence</span>
              </div>

              <div className="grid-2">
                {data.indicators.map((ind) => (
                  <div className="card stack" key={ind.aspect}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="mono small">{ind.aspect.toUpperCase()}</span>
                      <span className={`pill ${concernTone[ind.concern] || ''}`}>{ind.concern === 'none' ? 'ok' : ind.concern}</span>
                    </div>
                    <p className="muted small">{ind.observation}</p>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3>What to do</h3>
                <p className="muted">{data.advice}</p>
              </div>
              <p className="disclaimer">{data.caveat}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
