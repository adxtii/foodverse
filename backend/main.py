"""FoodVerse API. Start with:  uvicorn main:app --reload --port 8000"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config
from routers import cook, freshness, hygiene, insights, mealplan, nutrition, recognize
from services.llm import ai_configured

app = FastAPI(title="FoodVerse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (recognize, nutrition, freshness, hygiene, cook, mealplan, insights):
    app.include_router(module.router)


@app.get("/api/health")
def health():
    return {"ok": True, "ai_configured": ai_configured(), "model": config.MODEL}
