"""Turns uploaded photos and videos into small JPEG images the AI can look at."""
import io
import os
import tempfile

import cv2
from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps

import config

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def _to_jpeg(img: Image.Image) -> bytes:
    img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((config.MAX_IMAGE_SIDE, config.MAX_IMAGE_SIDE))
    buffer = io.BytesIO()
    img.save(buffer, "JPEG", quality=85)
    return buffer.getvalue()


def image_to_jpeg(data: bytes) -> bytes:
    try:
        return _to_jpeg(Image.open(io.BytesIO(data)))
    except Exception:
        raise HTTPException(400, "That image could not be read. Try a JPG, PNG or WebP file.")


def video_to_frames(data: bytes, suffix: str = ".mp4") -> list[bytes]:
    """Pick a few evenly spaced frames from a video."""
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(data)
        path = tmp.name

    frames: list[bytes] = []
    try:
        cap = cv2.VideoCapture(path)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total <= 0:
            raise HTTPException(400, "That video could not be read. Try an MP4 file.")
        count = config.MAX_VIDEO_FRAMES
        for i in range(count):
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(total * (i + 0.5) / count))
            ok, frame = cap.read()
            if ok:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(_to_jpeg(Image.fromarray(rgb)))
        cap.release()
    finally:
        os.remove(path)

    if not frames:
        raise HTTPException(400, "No frames could be read from that video.")
    return frames


async def load_visuals(files: list[UploadFile], allow_video: bool = True) -> list[bytes]:
    """Return a list of JPEG images from uploaded photos and/or one video."""
    images: list[bytes] = []
    for upload in files:
        if not upload or not upload.filename:
            continue
        data = await upload.read()
        if not data:
            raise HTTPException(400, f"{upload.filename} is empty.")
        if len(data) > config.MAX_UPLOAD_MB * 1024 * 1024:
            raise HTTPException(413, f"{upload.filename} is larger than {config.MAX_UPLOAD_MB} MB.")

        content_type = upload.content_type or ""
        if content_type in IMAGE_TYPES:
            images.append(image_to_jpeg(data))
        elif content_type.startswith("video/") and allow_video:
            suffix = os.path.splitext(upload.filename)[1] or ".mp4"
            images.extend(video_to_frames(data, suffix))
        else:
            raise HTTPException(415, f"{upload.filename}: unsupported file type.")

    return images[: config.MAX_IMAGES_PER_REQUEST]
