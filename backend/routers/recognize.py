from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from services import recognition
from utils.media import load_visuals

router = APIRouter(prefix="/api/recognize", tags=["recognize"])


@router.post("")
async def recognize_food(files: list[UploadFile] = File(default=[]), note: str = Form("")):
    images = await load_visuals(files)
    if not images:
        raise HTTPException(400, "Upload at least one photo or a short video of the food.")
    return await run_in_threadpool(recognition.recognize, images, note.strip()[:500])
