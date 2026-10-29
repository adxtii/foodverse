from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field

from services import cooking

router = APIRouter(prefix="/api/cook", tags=["cook"])


class CookRequest(BaseModel):
    ingredients: str = Field("", max_length=600)
    dish: str = Field("", max_length=120)
    diet: str = Field("", max_length=120)
    servings: int = Field(2, ge=1, le=12)
    question: str = Field("", max_length=300)


@router.post("")
async def cooking_guide(body: CookRequest):
    if not (body.ingredients.strip() or body.dish.strip() or body.question.strip()):
        raise HTTPException(400, "Tell me your ingredients, a dish, or ask a cooking question.")
    return await run_in_threadpool(
        cooking.guide,
        body.ingredients.strip(),
        body.dish.strip(),
        body.diet.strip(),
        body.servings,
        body.question.strip(),
    )
