from __future__ import annotations

import json
import os
import logging

import firebase_admin
import firebase_admin.credentials as fb_credentials
import firebase_admin.messaging as messaging

logger = logging.getLogger(__name__)


def _ensure_firebase_initialized() -> None:
    """Lazily initialize Firebase Admin SDK on first use."""
    if firebase_admin._apps:
        return

    creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
    key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")

    try:
        if creds_json:
            creds_dict = json.loads(creds_json)
            cred = fb_credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(cred)
        elif key_path:
            cred = fb_credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
    except Exception as exc:
        logger.error("Firebase initialization failed: %s", exc)
        raise


async def send_notification(token: str, title: str, body: str) -> None:
    try:
        _ensure_firebase_initialized()
    except Exception as exc:
        logger.error("Skipping FCM — Firebase not initialized: %s", exc)
        return

    message = messaging.Message(
        token=token,
        notification=messaging.Notification(title=title, body=body),
        android=messaging.AndroidConfig(priority="high"),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(aps=messaging.Aps(sound="default"))
        ),
    )

    try:
        message_id = messaging.send(message)
        logger.info("FCM sent: %s", message_id)
    except Exception as exc:
        logger.error("FCM failed: %s", exc)


__all__ = ["send_notification"]