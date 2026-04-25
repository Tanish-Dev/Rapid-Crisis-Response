# Rapid Crisis Response Frontend

React + Vite dashboard for live emergency incident coordination.

## Features

- Live incident cards updated via Socket.IO
- Acknowledge actions per active alert
- Incident log with Gemini summary snapshots
- Stats bar for active/responding/resolved trends
- Risk Insights tab with 30-day Gemini pattern analysis

## Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Start Vite:
   ```bash
   npm run dev
   ```
