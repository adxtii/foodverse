import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorNote from '../components/ErrorNote.jsx'
import useAnalysis from '../hooks/useAnalysis.js'
import { buildMealPlan } from '../api/foodverse.js'
import './MealPlan.css'

const START = {
  age: '', sex: 'female', height_cm: '', weight_kg: '',
  activity: 'light', goal: 'maintain', diet: '', allergies: '', dislikes: '', days: 3,
}

export default function MealPlan() {
  const [form, setForm] = useState(START)
  const [activeDay, setActiveDay] = useState(0)
  const { data, loading, error, run } = useAnalysis(buildMealPlan)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const ready = form.age && form.height_cm && form.weight_kg

  async function submit(e) {
    e.preventDefault()
    setActiveDay(0)
    await run({
      ...form,
      age: Number(form.age),
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      days: Number(form.days),
    })
  }

  const days = data?.plan?.days || []
  const day = days[activeDay]

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          tag="meal plan"
          title="A plan that fits you."
          text="Your calorie target is calculated from your numbers, then meals are built around it. Your details are used for this request only and are not saved."
        />

        <form className="stack plan-form" onSubmit={submit}>
          <div className="grid-3">
            <div className="field"><label>AGE</label><input type="number" min="16" max="90" value={form.age} onChange={set('age')} placeholder="21" /></div>
            <div className="field">
              <label>SEX (FOR THE CALORIE FORMULA)</label>
              <select value={form.sex} onChange={set('sex')}><option value="female">Female</option><option value="male">Male</option></select>
            </div>
            <div className="field">
              <label>ACTIVITY</label>
              <select value={form.activity} onChange={set('activity')}>
                <option value="sedentary">Mostly sitting</option>
                <option value="light">Light (1–3 days/week)</option>
                <option value="moderate">Moderate (3–5 days/week)</option>
                <option value="active">Very active (6–7 days/week)</option>
              </select>
            </div>
          </div>
          <div className="grid-3">
            <div className="field"><label>HEIGHT (CM)</label><input type="number" min="120" max="230" value={form.height_cm} onChange={set('height_cm')} placeholder="165" /></div>
            <div className="field"><label>WEIGHT (KG)</label><input type="number" min="30" max="250" value={form.weight_kg} onChange={set('weight_kg')} placeholder="60" /></div>
            <div className="field">
              <label>GOAL</label>
              <select value={form.goal} onChange={set('goal')}>
                <option value="lose">Lose weight gently</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain weight</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="field"><label>DIET</label><input value={form.diet} onChange={set('diet')} maxLength={120} placeholder="e.g. vegetarian" /></div>
            <div className="field">
              <label>DAYS</label>
              <select value={form.days} onChange={set('days')}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="field"><label>ALLERGIES (NEVER INCLUDED)</label><input value={form.allergies} onChange={set('allergies')} maxLength={200} placeholder="e.g. peanuts" /></div>
            <div className="field"><label>DISLIKES</label><input value={form.dislikes} onChange={set('dislikes')} maxLength={200} placeholder="e.g. mushrooms" /></div>
          </div>
          <button className="btn" disabled={loading || !ready}>
            {loading ? 'Planning…' : 'Build my plan'} <span className="arrow">→</span>
          </button>
        </form>

        <div className="plan-results">
          {loading && <Loader text="Planning your meals… this can take a few seconds" />}
          <ErrorNote message={error} />

          {data && (
            <div className="result stack">
              <hr className="divider" />
              <div className="grid-3">
                <div className="card stack"><span className="mono small muted">BASE METABOLISM</span><strong className="plan-num">{data.targets.bmr}<small> kcal</small></strong></div>
                <div className="card stack"><span className="mono small muted">DAILY ENERGY USE</span><strong className="plan-num">{data.targets.tdee}<small> kcal</small></strong></div>
                <div className="card stack plan-target"><span className="mono small muted">YOUR DAILY TARGET</span><strong className="plan-num">{data.targets.daily_calories}<small> kcal</small></strong></div>
              </div>
              {data.targets.floor_applied && (
                <p className="disclaimer">The target was raised to a safe minimum. Very low-calorie plans should only be followed with a doctor or dietitian.</p>
              )}

              {days.length > 0 && (
                <>
                  <div className="plan-tabs" role="tablist">
                    {days.map((d, i) => (
                      <button key={d.day} role="tab" aria-selected={i === activeDay} className={i === activeDay ? 'on' : ''} onClick={() => setActiveDay(i)}>
                        Day {d.day}
                      </button>
                    ))}
                  </div>

                  <div className="stack" key={activeDay}>
                    {day.meals.map((m, i) => (
                      <div className="card plan-meal" key={i} style={{ animationDelay: `${i * 70}ms` }}>
                        <span className="tag">{m.type}</span>
                        <div>
                          <h3>{m.name}</h3>
                          <p className="muted small">{m.description}</p>
                        </div>
                        <div className="plan-meal-nums mono small">
                          <span>{Math.round(m.calories)} kcal</span>
                          <span className="muted">{Math.round(m.protein_g)} g protein</span>
                        </div>
                      </div>
                    ))}
                    <p className="muted small mono">
                      Day total: {day.total_calories} kcal · {day.total_protein_g} g protein
                    </p>
                  </div>
                </>
              )}

              {data.plan.tips?.length > 0 && (
                <div className="card stack">
                  <h3>Tips</h3>
                  <ul className="list">{data.plan.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              )}
              <p className="disclaimer">General guidance, not medical advice. Talk to a doctor or dietitian for health conditions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
