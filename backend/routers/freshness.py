from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from services import freshness
from utils.media import load_visuals

router = APIRouter(prefix="/api/freshness", tags=["freshness"])


@router.post("")
async def check_freshness(files: list[UploadFile] = File(default=[]), note: str = Form("")):
    images = await load_visuals(files, allow_video=False)
    if not images:
        raise HTTPException(400, "Upload a clear photo of the food to check.")
    return await run_in_threadpool(freshness.check, images, note.strip()[:300])
