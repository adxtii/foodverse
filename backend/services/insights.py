"""Feature 10: turn the user's saved analyses into stats, alerts and an AI summary.

stats  -> plain Python, no AI, always real numbers from the history.
report -> AI writes advice, but only from those stats.
"""
import json
from collections import Counter
from typing import Any

from pydantic import BaseModel, Field

from services.llm import RULES, ask_json, text_block, to_number


class HistoryItem(BaseModel):
    type: str
    at: str
    title: str = ""
    metrics: dict[str, Any] = Field(default_factory=dict)


class HistoryBody(BaseModel):
    history: list[HistoryItem] = Field(default_factory=list, max_length=200)


def _avg(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 1) if values else None


def compute_stats(history: list[HistoryItem]) -> dict:
    by_type = Counter(h.type for h in history)

    health = [to_number(h.metrics.get("health_score")) for h in history if h.type == "nutrition"]
    health = [v for v in health if v is not None]
    calories = [to_number(h.metrics.get("calories")) for h in history if h.type == "nutrition"]
    calories = [v for v in calories if v is not None]
    hygiene = [to_number(h.metrics.get("score")) for h in history if h.type == "hygiene"]
    hygiene = [v for v in hygiene if v is not None]
    freshness = Counter(h.metrics.get("verdict", "Unclear") for h in history if h.type == "freshness")

    stats = {
        "total": len(history),
        "by_type": dict(by_type),
        "avg_health_score": _avg(health),
        "avg_calories": _avg(calories),
        "avg_hygiene_score": _avg(hygiene),
        "freshness": dict(freshness),
        "recent": [h.model_dump() for h in history[:8]],
    }
    stats["alerts"] = _alerts(stats)
    return stats


def _alerts(stats: dict) -> list[dict]:
    """Simple, explainable rules."""
    alerts = []
    spoiled = stats["freshness"].get("Spoiled", 0)
    if spoiled:
        alerts.append({"level": "high", "text": f"{spoiled} checked item(s) looked spoiled. Discard them."})
    if stats["avg_hygiene_score"] is not None and stats["avg_hygiene_score"] < 70:
        alerts.append({"level": "high", "text": f"Average hygiene score is {stats['avg_hygiene_score']}. Review the recommendations."})
    if stats["avg_health_score"] is not None and stats["avg_health_score"] < 50:
        alerts.append({"level": "medium", "text": f"Average meal health score is {stats['avg_health_score']}. Try lighter, higher-fibre options."})
    return alerts


SYSTEM = (
    RULES
    + """
You are given statistics from a user's saved food analyses. Write a short report using ONLY
those numbers. JSON schema:
{
  "summary": string,
  "nutrition_summary": string | null,
  "safety_recommendations": [string],
  "personal_guidance": [string]
}
summary: 2-3 sentences. Keep every list to at most 3 short items. Do not mention data that is
missing, and do not give medical advice."""
)


def report(history: list[HistoryItem]) -> dict:
    stats = compute_stats(history)
    slim = {k: v for k, v in stats.items() if k != "recent"}
    data = ask_json(SYSTEM, [text_block(json.dumps(slim))], max_tokens=900)
    return {"stats": stats, "report": data}
