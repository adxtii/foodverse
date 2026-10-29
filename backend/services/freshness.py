"""Feature 4: judge how fresh a food looks from color, texture and surface."""
from services.llm import RULES, ask_json, text_block, visual_blocks

VERDICTS = {"Fresh", "Moderately Fresh", "Spoiled", "Unclear"}

SYSTEM = (
    RULES
    + """
Judge the visible freshness of the food in the image(s). JSON schema:
{
  "is_food": boolean,
  "item": string,
  "verdict": "Fresh" | "Moderately Fresh" | "Spoiled" | "Unclear",
  "confidence": "high" | "medium" | "low",
  "indicators": [
    {"aspect": "color" | "texture" | "discoloration" | "surface", "observation": string, "concern": "none" | "minor" | "major"}
  ],
  "advice": string,
  "message": string | null
}
Always include one indicator for each of color, texture, discoloration and surface when they can be judged.
Use "Unclear" when the photo is too dark, blurry or far away. Visible mold, slime or strong
discoloration means "Spoiled". advice should say how soon to eat it or what to do, in one or two sentences.
If there is no food, set is_food to false and explain in message."""
)

CAVEAT = (
    "This is a visual check only. Smell, storage time and temperature matter too, "
    "and bacteria cannot be seen. When in doubt, throw it out."
)


def check(images: list[bytes], note: str) -> dict:
    blocks = visual_blocks(images)
    blocks.append(text_block(f"User note: {note}" if note else "Check this food for freshness."))
    data = ask_json(SYSTEM, blocks, max_tokens=1200)
    if data.get("verdict") not in VERDICTS:
        data["verdict"] = "Unclear"
    data["indicators"] = data.get("indicators") or []
    data["caveat"] = CAVEAT
    return data
