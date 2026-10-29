from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from services import mealplan

router = APIRouter(prefix="/api/mealplan", tags=["mealplan"])


@router.post("")
async def meal_plan(profile: mealplan.Profile):
    return await run_in_threadpool(mealplan.build, profile)
