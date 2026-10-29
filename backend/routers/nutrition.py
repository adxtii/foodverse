from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from services import nutrition
from utils.media import load_visuals

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


@router.post("")
async def analyze_nutrition(files: list[UploadFile] = File(default=[]), description: str = Form("")):
    images = await load_visuals(files, allow_video=False)
    description = description.strip()[:500]
    if not images and not description:
        raise HTTPException(400, "Add a food photo or describe what you ate.")
    return await run_in_threadpool(nutrition.analyze, images, description)
