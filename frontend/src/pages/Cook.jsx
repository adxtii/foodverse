import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import VoiceButton from '../components/VoiceButton.jsx'
import Loader from '../components/Loader.jsx'
import ErrorNote from '../components/ErrorNote.jsx'
import useAnalysis from '../hooks/useAnalysis.js'
import { getCookingGuide } from '../api/foodverse.js'
import './Cook.css'

export default function Cook() {
  const [form, setForm] = useState({ ingredients: '', dish: '', diet: '', servings: 2, question: '' })
  const { data, loading, error, run } = useAnalysis(getCookingGuide)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const hasInput = form.ingredients.trim() || form.dish.trim() || form.question.trim()

  function submit(e) {
    e.preventDefault()
    run({ ...form, servings: Number(form.servings) || 2 })
  }

  return (
    <div className="page">
      <div className="container">
        <PageHeader tag="cook" title="What should I cook?" text="Tell us what you have, name a dish, or just ask a question." />

        <form className="stack cook-form" onSubmit={submit}>
          <div className="field">
            <label>INGREDIENTS YOU HAVE</label>
            <textarea value={form.ingredients} onChange={set('ingredients')} maxLength={600} placeholder="e.g. paneer, capsicum, onion, curd, rice" />
            <div><VoiceButton onText={(t) => setForm((f) => ({ ...f, ingredients: f.ingredients ? f.ingredients + ', ' + t : t }))} /></div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>DISH (OPTIONAL)</label>
              <input value={form.dish} onChange={set('dish')} maxLength={120} placeholder="e.g. Paneer tikka" />
            </div>
            <div className="field">
              <label>DIET NOTES (OPTIONAL)</label>
              <input value={form.diet} onChange={set('diet')} maxLength={120} placeholder="e.g. vegetarian, no onion" />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>SERVINGS</label>
              <input type="number" min="1" max="12" value={form.servings} onChange={set('servings')} />
            </div>
            <div className="field">
              <label>A QUESTION (OPTIONAL)</label>
              <input value={form.question} onChange={set('question')} maxLength={300} placeholder="e.g. How do I keep paneer soft?" />
            </div>
          </div>
          <button className="btn" disabled={loading || !hasInput}>
            {loading ? 'Cooking up…' : 'Get recipe'} <span className="arrow">→</span>
          </button>
        </form>

        <div className="cook-results">
          {loading && <Loader text="Writing your recipe…" />}
          <ErrorNote message={error} />

          {data && (
            <div className="result stack">
              <hr className="divider" />
              <div className="row cook-head">
                <h3 className="cook-title">{data.title}</h3>
                {data.time_minutes && <span className="pill">{data.time_minutes} min</span>}
                {data.servings && <span className="pill">serves {data.servings}</span>}
              </div>

              {data.answer && (
                <div className="card cook-answer">
                  <span className="tag">// your question</span>
                  <p>{data.answer}</p>
                </div>
              )}

              <div className="cook-cols">
                <div className="card stack">
                  <h3>Ingredients</h3>
                  <ul className="cook-ingredients">
                    {data.ingredients.map((ing, i) => (
                      <li key={i}><span>{ing.item}</span><span className="muted mono small">{ing.amount}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="card stack">
                  <h3>Steps</h3>
                  <ol className="cook-steps">
                    {data.steps.map((step, i) => (
                      <li key={i} style={{ animationDelay: `${i * 80}ms` }}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="grid-2">
                {data.tips?.length > 0 && (
                  <div className="card stack">
                    <h3>Tips</h3>
                    <ul className="list">{data.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                  </div>
                )}
                {data.substitutions?.length > 0 && (
                  <div className="card stack">
                    <h3>Substitutions</h3>
                    <ul className="list">{data.substitutions.map((t) => <li key={t}>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
