import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import UploadBox from '../components/UploadBox.jsx'
import ScoreRing from '../components/ScoreRing.jsx'
import Loader from '../components/Loader.jsx'
import ErrorNote from '../components/ErrorNote.jsx'
import useAnalysis from '../hooks/useAnalysis.js'
import { checkHygiene } from '../api/foodverse.js'
import { addHistory } from '../store/history.js'
import './Hygiene.css'

const statusTone = { good: 'good', concern: 'bad', not_visible: '' }
const statusText = { good: 'good', concern: 'needs attention', not_visible: 'not visible' }

export default function Hygiene() {
  const [files, setFiles] = useState([])
  const [note, setNote] = useState('')
  const { data, loading, error, run } = useAnalysis(checkHygiene)

  async function submit(e) {
    e.preventDefault()
    const result = await run(files, note)
    if (result?.is_kitchen) {
      addHistory({ type: 'hygiene', title: 'Kitchen check', metrics: { score: result.score } })
    }
  }

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          tag="hygiene"
          title="Is the kitchen clean?"
          text="Upload a short kitchen video. We sample a few frames and check gloves, hair caps, food handling and cleanliness."
        />

        <form className="stack hygiene-form" onSubmit={submit}>
          <UploadBox files={files} onChange={setFiles} accept="video/*,image/*" label="Drop a kitchen video" hint="MP4 up to 25 MB, 10–30 seconds is plenty" />
          <div className="field">
            <label>OPTIONAL NOTE</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Prep area during lunch rush" />
          </div>
          <button className="btn" disabled={loading || !files.length}>
            {loading ? 'Reviewing…' : 'Check hygiene'} <span className="arrow">→</span>
          </button>
        </form>

        <div className="hygiene-results">
          {loading && <Loader text="Reviewing frames…" />}
          <ErrorNote message={error} />
          {data && !data.is_kitchen && <p className="muted result">That does not look like a kitchen or food-prep area.</p>}

          {data?.is_kitchen && (
            <div className="result stack">
              <hr className="divider" />
              <div className="hygiene-top">
                {data.score !== null ? (
                  <ScoreRing value={data.score} label="HYGIENE SCORE" />
                ) : (
                  <p className="muted">Not enough was visible to score this video.</p>
                )}
                <div>
                  <p className="hygiene-summary">{data.summary}</p>
                  <p className="muted small mono">{data.frames_checked} frames checked</p>
                </div>
              </div>

              <div className="grid-2">
                {data.indicators.map((ind) => (
                  <div className="card stack" key={ind.id}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <h3>{ind.label}</h3>
                      <span className={`pill ${statusTone[ind.status]}`}>{statusText[ind.status]}</span>
                    </div>
                    <p className="muted small">{ind.detail}</p>
                  </div>
                ))}
              </div>

              {data.recommendations?.length > 0 && (
                <div className="card stack">
                  <h3>Recommendations</h3>
                  <ul className="list">{data.recommendations.map((r) => <li key={r}>{r}</li>)}</ul>
                </div>
              )}
              <p className="disclaimer">
                Based on a few sampled frames, so it can miss things between them. Use it as a prompt for review, not as an inspection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
