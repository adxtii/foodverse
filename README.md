# FoodVerse

Multimodal food intelligence: recognize dishes, estimate nutrition, check freshness,
review kitchen hygiene, get cooking help, build meal plans and see it all on a dashboard.

- **Frontend:** React + Vite, plain CSS, `fetch`
- **Backend:** Python FastAPI, one service + one router per feature
- **AI:** Gemini API (vision + language). No AI key means a clear error, never fake results.


### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             
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

## 🏗️ Architecture

FoodVerse follows a modular full-stack architecture:

- **React frontend:** Provides feature-specific pages and reusable UI components.
- **FastAPI backend:** Exposes API endpoints through dedicated routers.
- **Service layer:** Separates business logic for recognition, nutrition, freshness, hygiene, cooking, meal planning, and insights.
- **Centralized AI integration:** Routes AI requests through `services/llm.py`.
- **Media processing:** Uses OpenCV to sample video frames for analysis.
- **Local history:** Stores saved results in browser localStorage.

## 🔍 Technical Notes & Limitations

- **AI dependency:** AI-powered features require a valid Anthropic API key. Without one, the application reports a clear configuration error rather than fabricating AI results.
- **Voice input:** Uses browser speech recognition, supported primarily in compatible browsers such as Chrome and Edge.
- **Video analysis:** Samples six evenly spaced frames, so brief events between sampled frames may be missed.
- **Hygiene scoring:** Computed in Python from AI-generated indicator verdicts. Indicators that cannot be assessed visually are excluded.
- **Nutrition estimates:** Nutritional values are estimates, not laboratory measurements. The application cross-checks macronutrients against estimated calories and flags substantial discrepancies.
- **Meal planning:** Uses the Mifflin–St Jeor equation to estimate calorie needs, with a safety floor.
- **Food safety:** Visual freshness and hygiene assessments cannot guarantee that food is safe to consume.
- **Storage and privacy:** No user accounts or database are configured. Saved history is stored in browser localStorage; uploaded photos are not intentionally persisted by the application.

## 🔮 Future Improvements

- Integrate verified nutritional databases.
- Add user authentication and persistent meal history.
- Improve food recognition and portion-size estimation.
- Expand automated testing and API error handling.
- Add richer analytics and meal-plan customization.

## ⚠️ Disclaimer

FoodVerse provides informational estimates and AI-generated suggestions. It is not a substitute for professional nutritional advice, food-safety testing, or medical guidance.

---

**Built with React, FastAPI, and Anthropic Claude.**
