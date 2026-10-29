"""Feature 3: estimated calories, macros and a health score."""
from services.llm import RULES, ask_json, text_block, to_number, visual_blocks

SYSTEM = (
    RULES
    + """
Estimate the nutrition of the food shown and/or described. JSON schema:
{
  "is_food": boolean,
  "dish": string,
  "serving_estimate": string,
  "calories": {"value": number, "low": number, "high": number},
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "health_score": number,
  "score_reasons": [string],
  "suggestions": [string],
  "message": string | null
}
health_score is 0-100 for overall nutritional quality of this serving (balance, fibre, processing,
added sugar, saturated fat, sodium). Give 2-4 short score_reasons and up to 3 practical suggestions.
Base portion size on what is visible; if you must assume one, say so in serving_estimate.
If there is no food, set is_food to false and explain in message."""
)


def _check(data: dict) -> dict:
    """Plain-Python sanity checks on the model's numbers."""
    score = to_number(data.get("health_score"))
    if score is not None:
        data["health_score"] = max(0, min(100, round(score)))

    calories = (data.get("calories") or {}).get("value")
    calories = to_number(calories)
    p, c, f = (to_number(data.get(k)) for k in ("protein_g", "carbs_g", "fat_g"))
    if calories and None not in (p, c, f):
        from_macros = 4 * p + 4 * c + 9 * f
        if abs(from_macros - calories) / calories > 0.25:
            data["consistency_note"] = (
                f"The macros add up to about {round(from_macros)} kcal, which differs from the "
                f"{round(calories)} kcal estimate. Treat both numbers as rough."
            )
    return data


def analyze(images: list[bytes], description: str) -> dict:
    blocks = visual_blocks(images)
    blocks.append(text_block(f"Description from user: {description}" if description else "Analyze the food in the image."))
    return _check(ask_json(SYSTEM, blocks, max_tokens=1200))
