"""The one place that talks to the AI model (Google Gemini). Every feature uses ask_json().

Uses plain HTTPS calls (httpx), so there is no extra SDK to learn or break.
"""
import base64
import json

import httpx
from fastapi import HTTPException

import config

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

RULES = (
    "You are the analysis engine of FoodVerse, a food intelligence app. "
    "Reply with ONE valid JSON object and nothing else: no markdown, no code fences. "
    "Only report what you can actually see or what the user told you. "
    "If something is unclear, use null or say it is unclear. Never invent details. "
    "All numeric values are estimates, not measurements."
)


def ai_configured() -> bool:
    return bool(config.GEMINI_API_KEY)


def visual_blocks(images: list[bytes], label: str = "Image") -> list[dict]:
    """Wrap JPEG bytes as Gemini 'parts'."""
    parts: list[dict] = []
    for i, data in enumerate(images, start=1):
        if len(images) > 1:
            parts.append({"text": f"{label} {i} of {len(images)}:"})
        parts.append({"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(data).decode()}})
    return parts


def text_block(text: str) -> dict:
    return {"text": text}


def extract_json(text: str) -> dict:
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        raise ValueError("no JSON object found")
    return json.loads(text[start : end + 1])


def to_number(value, default=None):
    """Safely turn model output into a float."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _friendly_error(status: int, body: str) -> str:
    if status in (400, 403) and "API key" in body:
        return "Your Gemini API key was rejected. Check GEMINI_API_KEY in backend/.env."
    if status == 429:
        return "Gemini free-tier limit reached. Wait a minute and try again."
    if status == 404:
        return f"The model '{config.MODEL}' was not found. Check FOODVERSE_MODEL in backend/.env."
    return f"The AI request failed (status {status})."


def ask_json(system: str, blocks: list[dict], max_tokens: int = 1500) -> dict:
    if not ai_configured():
        raise HTTPException(
            503,
            "AI is not configured yet. Add GEMINI_API_KEY to backend/.env and restart the server.",
        )

    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": blocks}],
        "generationConfig": {
            "responseMimeType": "application/json",
            # Extra room: some Gemini models spend part of this budget on internal thinking.
            "maxOutputTokens": max_tokens * 4,
            "temperature": 0.3,
        },
    }

    try:
        response = httpx.post(
            API_URL.format(model=config.MODEL),
            headers={"x-goog-api-key": config.GEMINI_API_KEY, "Content-Type": "application/json"},
            json=payload,
            timeout=90,
        )
    except httpx.HTTPError:
        raise HTTPException(502, "Could not reach the Gemini service. Check your internet connection.")

    if response.status_code != 200:
        raise HTTPException(502, _friendly_error(response.status_code, response.text))

    try:
        data = response.json()
        candidate = data["candidates"][0]
        text = "".join(p.get("text", "") for p in candidate["content"]["parts"])
    except (KeyError, IndexError, TypeError, ValueError):
        reason = (data.get("promptFeedback") or {}).get("blockReason") if isinstance(data, dict) else None
        if reason:
            raise HTTPException(422, "The AI could not analyze that image or text. Try a different one.")
        raise HTTPException(502, "The AI returned an empty answer. Please try again.")

    try:
        return extract_json(text)
    except (ValueError, json.JSONDecodeError):
        raise HTTPException(502, "The AI returned an answer that could not be read. Please try again.")
