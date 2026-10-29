"""Feature 6: recipes, ingredient lists, steps and contextual cooking guidance."""
from services.llm import RULES, ask_json, text_block

SYSTEM = (
    RULES
    + """
You are a practical home-cooking guide. JSON schema:
{
  "title": string,
  "servings": number,
  "time_minutes": number,
  "ingredients": [{"item": string, "amount": string}],
  "steps": [string],
  "tips": [string],
  "substitutions": [string],
  "answer": string | null
}
Use the ingredients the user has where possible and list anything extra you assume.
Follow the dietary notes strictly. Keep steps short and clear for a beginner and include
doneness cues (color, texture, smell) rather than only times.
If the user asked a specific question, answer it in "answer". Otherwise set "answer" to null."""
)


def guide(ingredients: str, dish: str, diet: str, servings: int, question: str) -> dict:
    lines = [
        f"Ingredients on hand: {ingredients or 'not given'}",
        f"Dish wanted: {dish or 'suggest something suitable'}",
        f"Dietary notes: {diet or 'none'}",
        f"Servings: {servings}",
        f"Question: {question or 'none'}",
    ]
    data = ask_json(SYSTEM, [text_block("\n".join(lines))], max_tokens=1800)
    data["ingredients"] = data.get("ingredients") or []
    data["steps"] = data.get("steps") or []
    return data
