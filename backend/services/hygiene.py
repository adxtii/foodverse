"""Feature 5: kitchen hygiene indicators from video frames."""
from services.llm import RULES, ask_json, text_block, visual_blocks

INDICATORS = {
    "gloves": "Glove usage",
    "hair_cap": "Hair-cap compliance",
    "food_handling": "Food handling",
    "cleanliness": "Cleanliness",
}

SYSTEM = (
    RULES
    + """
These frames come from a kitchen video. Check four hygiene indicators. JSON schema:
{
  "is_kitchen": boolean,
  "indicators": [
    {"id": "gloves" | "hair_cap" | "food_handling" | "cleanliness",
     "status": "good" | "concern" | "not_visible",
     "detail": string}
  ],
  "summary": string,
  "recommendations": [string]
}
Return exactly one entry per id. Use "not_visible" when the frames do not show enough to judge,
never guess. Describe behaviours and surfaces only; never identify or describe individual people.
If the frames are not a kitchen or food area, set is_kitchen to false."""
)


def _score(indicators: list[dict]) -> int | None:
    """Score = share of judgeable indicators that are 'good'. Computed in code, not by the AI."""
    judged = [i for i in indicators if i.get("status") in ("good", "concern")]
    if not judged:
        return None
    good = sum(1 for i in judged if i["status"] == "good")
    return round(100 * good / len(judged))


def check(images: list[bytes], note: str) -> dict:
    blocks = visual_blocks(images, "Frame")
    blocks.append(text_block(f"User note: {note}" if note else "Assess kitchen hygiene."))
    data = ask_json(SYSTEM, blocks, max_tokens=1400)

    cleaned = []
    for item in data.get("indicators") or []:
        if item.get("id") in INDICATORS:
            status = item.get("status") if item.get("status") in ("good", "concern", "not_visible") else "not_visible"
            cleaned.append(
                {
                    "id": item["id"],
                    "label": INDICATORS[item["id"]],
                    "status": status,
                    "detail": item.get("detail", ""),
                }
            )
    data["indicators"] = cleaned
    data["score"] = _score(cleaned)
    data["frames_checked"] = len(images)
    return data
