"""Feature 2: identify dishes and food items in photos or video frames."""
from services.llm import RULES, ask_json, text_block, visual_blocks

SYSTEM = (
    RULES
    + """
Identify the food in the image(s). JSON schema:
{
  "is_food": boolean,
  "summary": string,
  "items": [
    {
      "name": string,
      "category": "dish" | "ingredient" | "drink" | "snack" | "dessert",
      "cuisine": string | null,
      "confidence": "high" | "medium" | "low",
      "visible_ingredients": [string]
    }
  ],
  "message": string | null
}
If no food is visible, set is_food to false, items to [] and explain briefly in message.
Use "low" confidence when the dish is hard to tell apart from similar ones."""
)


def recognize(images: list[bytes], note: str) -> dict:
    blocks = visual_blocks(images, "Frame")
    blocks.append(text_block(f"User note: {note}" if note else "Identify the food shown."))
    data = ask_json(SYSTEM, blocks, max_tokens=1200)
    data["items"] = data.get("items") or []
    return data
