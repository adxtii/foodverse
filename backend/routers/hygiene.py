from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from services import hygiene
from utils.media import load_visuals

router = APIRouter(prefix="/api/hygiene", tags=["hygiene"])


@router.post("")
async def check_hygiene(files: list[UploadFile] = File(default=[]), note: str = Form("")):
    images = await load_visuals(files)
    if not images:
        raise HTTPException(400, "Upload a short kitchen video (or a few photos).")
    return await run_in_threadpool(hygiene.check, images, note.strip()[:300])
