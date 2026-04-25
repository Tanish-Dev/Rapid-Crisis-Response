from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


def _parse_allowed_origins(value: str | None) -> list[str]:
    if not value:
        return ["http://localhost:5173"]

    origins = [origin.strip() for origin in value.split(",") if origin.strip()]
    return origins or ["http://localhost:5173"]


class Settings:
    def __init__(self) -> None:
        self.port = int(os.getenv("PORT", "8000"))
        self.firestore_collection = os.getenv("FIRESTORE_COLLECTION", "incidents")
        self.gemini_api_key = os.getenv("GOOGLE_API_KEY", "")
        self.gemini_model = os.getenv("GOOGLE_GEMINI_MODEL", "gemini-2.0-flash")
        self.allowed_origins = _parse_allowed_origins(os.getenv("ALLOWED_ORIGINS"))


settings = Settings()
