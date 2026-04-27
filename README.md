# Rapid Crisis Response MVP

Real-time emergency coordination platform for hospitality venues.

## Architecture

- **Backend:** FastAPI + Firestore (Firebase Admin SDK) + Socket.IO + Gemini
- **Frontend:** React (Vite) + Axios + Socket.IO client
<p align="center">
  <img src="./architecturediagram.png" alt="Architecture Diagram"/>
</p>

## Implemented Scope

- Panic-button ingestion endpoint: `POST /api/alert`
- Incident retrieval endpoint: `GET /api/alerts`
- Incident updates endpoint: `PATCH /api/alert/{id}`
- Real-time events: `new_alert` and `alert_updated`
- Gemini incident brief on every new alert (2-3 sentence summary + 3 actions)
- Dashboard with:
  - Active Alerts panel (color-coded by type)
  - Acknowledge button per card
  - Incident Log tab
  - Stats bar
  - Risk Insights tab with Gemini analysis over last 30 days

## Firestore Incident Shape

```json
{
  "id": "auto-doc-id",
  "type": "medical | fire | security | distress",
  "room": "401",
  "device_name": "panic_btn_401_a",
  "timestamp": "2026-04-26T10:45:00Z",
  "status": "active | responding | resolved",
  "gemini_brief": {
    "summary": "2-3 sentence situation brief",
    "recommended_actions": ["action 1", "action 2", "action 3"],
    "generated_at": "ISO timestamp",
    "model": "gemini model id"
  },
  "acknowledged_by": "Control Desk",
  "acknowledged_at": "ISO timestamp"
}
```

## Step-by-Step Run

### 1) Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_API_KEY in .env
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 3) Send a test alert

```bash
curl -X POST "http://localhost:8000/api/alert" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medical",
    "room": "401",
    "device_name": "panic_btn_401_a",
    "timestamp": "2026-04-26T10:45:00Z"
  }'
```

## Notes

- Teammate-owned features were intentionally excluded:
  - FCM push notifications
  - device registration endpoint
  - Gemini escalation timer
