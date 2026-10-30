"""Central settings. Everything configurable lives here."""
import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
# Free-tier model that accepts images and video frames. If Google renames it,
# change FOODVERSE_MODEL in backend/.env (see https://ai.google.dev/pricing).
MODEL = os.getenv("FOODVERSE_MODEL", "gemini-3.1-flash-lite")

MAX_UPLOAD_MB = 25        # per file
MAX_VIDEO_FRAMES = 6      # frames sampled from one video
MAX_IMAGES_PER_REQUEST = 8
MAX_IMAGE_SIDE = 1280     # pixels; bigger images are shrunk before analysis

# Websites allowed to call this API. Add your live site in the FRONTEND_ORIGINS setting
# (comma separated), e.g. https://foodverse.vercel.app  (no slash at the end).
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"] + [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]