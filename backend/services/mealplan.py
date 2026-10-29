"""Feature 7: personalized meal plans.

The calorie target is calculated here with the Mifflin-St Jeor formula, then the AI
builds meals around that number. Day totals are summed in code.
"""
from typing import Literal

from pydantic import BaseModel, Field

from services.llm import RULES, ask_json, text_block, to_number

ACTIVITY = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725}
GOAL = {"lose": 0.85, "maintain": 1.0, "gain": 1.10}
FLOOR = {"male": 1500, "female": 1200}


class Profile(BaseModel):
    age: int = Field(ge=16, le=90)
    sex: Literal["male", "female"]
    height_cm: float = Field(ge=120, le=230)
    weight_kg: float = Field(ge=30, le=250)
    activity: Literal["sedentary", "light", "moderate", "active"] = "light"
    goal: Literal["lose", "maintain", "gain"] = "maintain"
    diet: str = Field("", max_length=120)
    allergies: str = Field("", max_length=200)
    dislikes: str = Field("", max_length=200)
    days: int = Field(3, ge=1, le=7)


SYSTEM = (
    RULES
    + """
Create a meal plan. JSON schema:
{
  "days": [
    {"day": number,
     "meals": [{"type": "Breakfast" | "Lunch" | "Snack" | "Dinner", "name": string,
                "description": string, "calories": number, "protein_g": number}]}
  ],
  "tips": [string]
}
Each day has exactly four meals. Aim for the daily calorie target given. Strictly exclude any
allergens and disliked foods and follow the diet. Vary meals across days and keep them realistic
to cook at home. Give 2-3 short tips."""
)


def targets(p: Profile) -> dict:
    base = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age
    bmr = base + 5 if p.sex == "male" else base - 161
    tdee = bmr * ACTIVITY[p.activity]
    goal_cal = tdee * GOAL[p.goal]
    floor = FLOOR[p.sex]
    return {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "daily_calories": round(max(goal_cal, floor)),
        "floor_applied": goal_cal < floor,
    }


def build(p: Profile) -> dict:
    t = targets(p)
    prompt = (
        f"Daily calorie target: {t['daily_calories']} kcal\n"
        f"Goal: {p.goal} weight\nDays: {p.days}\n"
        f"Diet: {p.diet or 'no restriction'}\n"
        f"Allergies (never include): {p.allergies or 'none'}\n"
        f"Dislikes: {p.dislikes or 'none'}"
    )
    plan = ask_json(SYSTEM, [text_block(prompt)], max_tokens=3800)

    days = plan.get("days") or []
    for day in days:
        meals = day.get("meals") or []
        day["meals"] = meals
        day["total_calories"] = round(sum(to_number(m.get("calories"), 0) for m in meals))
        day["total_protein_g"] = round(sum(to_number(m.get("protein_g"), 0) for m in meals))
    plan["days"] = days
    return {"targets": t, "plan": plan}
