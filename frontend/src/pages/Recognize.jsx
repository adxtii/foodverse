import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import UploadBox from '../components/UploadBox.jsx'
import VoiceButton from '../components/VoiceButton.jsx'
import Loader from '../components/Loader.jsx'
import ErrorNote from '../components/ErrorNote.jsx'
import useAnalysis from '../hooks/useAnalysis.js'
import { recognizeFood } from '../api/foodverse.js'
import { addHistory } from '../store/history.js'
import './Recognize.css'

const confidenceTone = { high: 'good', medium: 'warn', low: 'bad' }

export default function Recognize() {
  const [files, setFiles] = useState([])
  const [note, setNote] = useState('')
  const { data, loading, error, run } = useAnalysis(recognizeFood)

  async function submit(e) {
    e.preventDefault()
    const result = await run(files, note)
    if (result?.is_food && result.items.length) {
      addHistory({
        type: 'recognize',
        title: result.items.map((i) => i.name).join(', '),
        metrics: { items: result.items.length },
      })
    }
  }

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          tag="recognize"
          title="What is this dish?"
          text="Upload up to 4 photos, or one short video. Add a note or speak if it helps."
        />

        <form className="stack recognize-form" onSubmit={submit}>
          <UploadBox
            files={files}
            onChange={setFiles}
            accept="image/*,video/*"
            multiple
            max={4}
            label="Drop food photos or a video"
            hint="JPG, PNG, WebP or MP4, up to 25 MB each"
          />
          <div className="field">
            <label>OPTIONAL NOTE</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. Street food from Bhopal, served with chutney" />
            <div><VoiceButton onText={(t) => setNote((n) => (n ? n + ' ' : '') + t)} /></div>
          </div>
          <button className="btn" disabled={loading || !files.length}>
            {loading ? 'Looking…' : 'Identify food'} <span className="arrow">→</span>
          </button>
        </form>

        <div className="results">
          {loading && <Loader text="Looking at your food…" />}
          <ErrorNote message={error} />

          {data && !data.is_food && <p className="muted result">{data.message || 'No food was found in that upload.'}</p>}

          {data?.is_food && (
            <div className="result stack">
              <hr className="divider" />
              <p className="recognize-summary">{data.summary}</p>
              <div className="grid-2">
                {data.items.map((item) => (
                  <article className="card stack" key={item.name}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <h3>{item.name}</h3>
                      <span className={`pill ${confidenceTone[item.confidence] || ''}`}>{item.confidence} confidence</span>
                    </div>
                    <div className="row">
                      <span className="chip">{item.category}</span>
                      {item.cuisine && <span className="chip">{item.cuisine}</span>}
                    </div>
                    {item.visible_ingredients?.length > 0 && (
                      <div className="chips">
                        {item.visible_ingredients.map((ing) => <span key={ing} className="chip">{ing}</span>)}
                      </div>
                    )}
                    <Link to="/nutrition" state={{ dish: item.name }} className="small tag">Get nutrition →</Link>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
