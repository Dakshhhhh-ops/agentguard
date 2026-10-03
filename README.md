# AgentGuard

AgentGuard is a runtime security control plane for autonomous AI agents. It evaluates tool calls in real time, detects prompt-injection and privilege-escalation patterns, assigns risk scores, and enforces policy decisions before sensitive actions reach production systems.

## Project structure

- `backend/` – FastAPI service and policy/risk engine
- `frontend/` – Vite + React dashboard for monitoring and simulation

## Features

- Real-time tool-call interception
- Threat detection for prompt injection, privilege escalation, and data exfiltration
- Policy evaluation with allow/block/review decisions
- Security event logging and audit trail
- Browser-based simulator and dashboard UI

## Run locally

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Tech stack

- FastAPI
- Pydantic
- React
- TypeScript
- Vite

## Demo status

The app is built and validated for local use, with the frontend production build passing and backend Python modules compiling successfully.
