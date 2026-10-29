# FoodVerse

Multimodal food intelligence: recognize dishes, estimate nutrition, check freshness,
review kitchen hygiene, get cooking help, build meal plans and see it all on a dashboard.

- **Frontend:** React + Vite, plain CSS, `fetch`
- **Backend:** Python FastAPI, one service + one router per feature
- **AI:** Anthropic Claude (vision + language). No AI key means a clear error, never fake results.

## Run it

You need Python 3.10+ and Node 18+.

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then paste your ANTHROPIC_API_KEY into .env
uvicorn main:app --reload --port 8000
```

Check it: open http://localhost:8000/api/health (shows `"ai_configured": true` when the key is set).
Interactive API docs: http://localhost:8000/docs

### 2. Frontend (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project map

```
backend/
  main.py                 app + CORS + routers
  config.py               settings (model, limits)
  routers/                recognize, nutrition, freshness, hygiene, cook, mealplan, insights
  services/               one file per feature + llm.py (the only file that calls the AI)
  utils/media.py          photo / video-frame handling

frontend/src/
  pages/                  Home, Recognize, Nutrition, Freshness, Hygiene, Cook, MealPlan, Dashboard (+ .css each)
  components/             Navbar, Footer, UploadBox, ScoreRing, VoiceButton, Loader, ...
  api/                    client.js (fetch helpers) + foodverse.js (one function per endpoint)
  store/history.js        saves results in the browser (localStorage)
  styles/global.css       colors, type, buttons, cards, animations
```

## How the 10 requirements map

| # | Requirement | Where |
|---|-------------|-------|
| 1, 8 | Multimodal platform / combined models | photo + video frames (vision), voice → text (browser), text, all through `services/llm.py` |
| 2 | Food recognition | `services/recognition.py`, `pages/Recognize.jsx` |
| 3 | Nutrition + health score | `services/nutrition.py`, `pages/Nutrition.jsx` |
| 4 | Freshness | `services/freshness.py`, `pages/Freshness.jsx` |
| 5 | Kitchen hygiene (video) | `services/hygiene.py`, `pages/Hygiene.jsx` |
| 6 | Cooking assistance | `services/cooking.py`, `pages/Cook.jsx` |
| 7 | Personalized meal plans | `services/mealplan.py`, `pages/MealPlan.jsx` |
| 9 | Modular full-stack | React frontend, FastAPI backend, one module per capability |
| 10 | Actionable insights | `services/insights.py`, `pages/Dashboard.jsx` |

## Honest notes (good for your viva)

- **Voice:** uses the browser's speech recognition (Chrome / Edge) to turn speech into text. It is not a server-side audio model.
- **Video:** 6 evenly spaced frames are sampled with OpenCV, so brief moments between frames can be missed.
- **Hygiene score** is computed in Python from the AI's per-indicator verdicts; "not visible" indicators are left out, not guessed.
- **Calorie target** uses the Mifflin-St Jeor formula in Python, with a safety floor. The AI only builds meals around it.
- **Nutrition numbers are estimates.** The code cross-checks macros against calories and flags big mismatches.
- No accounts and no database: history lives in your browser's localStorage and photos are never stored.
