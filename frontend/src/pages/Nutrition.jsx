import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import UploadBox from '../components/UploadBox.jsx'
import VoiceButton from '../components/VoiceButton.jsx'
import ScoreRing from '../components/ScoreRing.jsx'
import Loader from '../components/Loader.jsx'
import ErrorNote from '../components/ErrorNote.jsx'
import useAnalysis from '../hooks/useAnalysis.js'
import { analyzeNutrition } from '../api/foodverse.js'
import { addHistory } from '../store/history.js'
import './Nutrition.css'

const MACROS = [
  { key: 'protein_g', label: 'Protein', kcal: 4 },
  { key: 'carbs_g', label: 'Carbs', kcal: 4 },
  { key: 'fat_g', label: 'Fat', kcal: 9 },
]

export default function Nutrition() {
  const location = useLocation()
  const [files, setFiles] = useState([])
  const [text, setText] = useState(location.state?.dish || '')
  const { data, loading, error, run } = useAnalysis(analyzeNutrition)

  async function submit(e) {
    e.preventDefault()
    const result = await run(files, text)
    if (result?.is_food) {
      addHistory({
        type: 'nutrition',
        title: result.dish,
        metrics: {
          health_score: result.health_score,
          calories: result.calories?.value,
          protein_g: result.protein_g,
          carbs_g: result.carbs_g,
          fat_g: result.fat_g,
        },
      })
    }
  }

  // Share of calories from each macro, worked out here from the grams.
  const totalKcal = data?.is_food ? MACROS.reduce((sum, m) => sum + (data[m.key] || 0) * m.kcal, 0) : 0

  return (
    <div className="page">
      <div className="container">
        <PageHeader tag="nutrition" title="What is in it?" text="Add a photo, describe the meal, or both. You get estimates, not lab results." />

        <form className="stack nutrition-form" onSubmit={submit}>
          <UploadBox files={files} onChange={setFiles} multiple max={2} label="Drop a food photo" hint="Optional if you describe it below" />
          <div className="field">
            <label>OR DESCRIBE IT</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="e.g. 2 parathas with curd and a small bowl of aloo sabzi" />
            <div><VoiceButton onText={(t) => setText((n) => (n ? n + ' ' : '') + t)} /></div>
          </div>
          <button className="btn" disabled={loading || (!files.length && !text.trim())}>
            {loading ? 'Calculating…' : 'Analyze nutrition'} <span className="arrow">→</span>
          </button>
        </form>

        <div className="nutrition-results">
          {loading && <Loader text="Estimating nutrition…" />}
          <ErrorNote message={error} />
          {data && !data.is_food && <p className="muted result">{data.message || 'No food was found.'}</p>}

          {data?.is_food && (
            <div className="result stack">
              <hr className="divider" />
              <div className="nutrition-top">
                <ScoreRing value={data.health_score ?? 0} label="HEALTH SCORE" />
                <div>
                  <h3 className="nutrition-dish">{data.dish}</h3>
                  <p className="muted small">{data.serving_estimate}</p>
                  <div className="nutrition-cal">
                    <strong>{Math.round(data.calories?.value ?? 0)}</strong> kcal
                    <span className="muted small mono"> range {Math.round(data.calories?.low ?? 0)}–{Math.round(data.calories?.high ?? 0)}</span>
                  </div>
                </div>
              </div>

              <div className="grid-3">
                {MACROS.map((m) => {
                  const grams = data[m.key] ?? 0
                  const share = totalKcal ? Math.round(((grams * m.kcal) / totalKcal) * 100) : 0
                  return (
                    <div className="card stack" key={m.key}>
                      <span className="mono small muted">{m.label.toUpperCase()}</span>
                      <strong className="macro-num">{Math.round(grams)}<small>g</small></strong>
                      <div className="bar"><span style={{ width: `${share}%` }} /></div>
                      <span className="muted small">{share}% of calories</span>
                    </div>
                  )
                })}
              </div>

              <div className="grid-2">
                {data.score_reasons?.length > 0 && (
                  <div className="card stack">
                    <h3>Why this score</h3>
                    <ul className="list">{data.score_reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                  </div>
                )}
                {data.suggestions?.length > 0 && (
                  <div className="card stack">
                    <h3>Make it better</h3>
                    <ul className="list">{data.suggestions.map((r) => <li key={r}>{r}</li>)}</ul>
                  </div>
                )}
              </div>

              {data.consistency_note && <p className="disclaimer">{data.consistency_note}</p>}
              <p className="disclaimer">Estimates based on how the food looks or is described. Real values vary with recipe and portion.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
