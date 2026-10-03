# AgentGuard

AgentGuard is a runtime security control plane for autonomous AI agents. It intercepts tool calls before they reach production systems, evaluates risks in real time, enforces policy boundaries, and produces an auditable evidence trail for every decision.

The project is designed for teams building AI agents that interact with tools, APIs, internal systems, or sensitive data. Instead of relying only on output filtering, AgentGuard secures the runtime layer where actions actually happen.

## Why AgentGuard

Autonomous agents can trigger dangerous behavior such as:

- prompt injection and instruction override attempts
- privilege escalation and unauthorized tool access
- secret exposure and data exfiltration
- unsafe external transfers or export requests

AgentGuard gives teams a deterministic control plane to detect these behaviors early and stop them before execution.

## Product capabilities

- Real-time interception of agent tool calls
- Threat detection for prompt injection, privilege escalation, and exfiltration
- Risk scoring with explainable evidence
- Policy enforcement with allow, review, and block decisions
- Audit logging and incident-style evidence capture
- Browser-based dashboard and attack simulator
- Security summary views for protected agents and recent activity

## Architecture

The project is split into two main parts:

- `backend/` — FastAPI service, policy engine, threat engine, risk engine, and event store
- `frontend/` — React + TypeScript dashboard and simulation experience

### Backend flow

1. A tool request is received
2. Threat signatures are evaluated
3. Policy boundaries are checked
4. Risk score is computed
5. Decision is produced: ALLOW, REVIEW, or BLOCK
6. Event evidence is stored for audit and investigation

### Frontend flow

- Security dashboard with metrics and live event telemetry
- Policy and agent management views
- Tool call sandbox and simulation screens
- Audit trail and evidence inspection UI

## Tech stack

- Python 3.10+
- FastAPI
- Pydantic
- React
- TypeScript
- Vite
- Recharts and Lucide icons for UI visualization

## Repository structure

```text
agentguard/
├── backend/
│   ├── api/
│   ├── data/
│   ├── engine/
│   ├── models/
│   ├── scenarios/
│   ├── services/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
├── .gitignore
├── README.md
└── .venv/
```

## Local development

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs will be available at:

- http://localhost:8000/docs
- http://localhost:8000/redoc

### 2) Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the frontend at:

- http://localhost:5173

## Demo behavior

The app ships with synthetic demo data and a simulation engine that can be used to test scenarios such as:

- prompt injection attempts
- unauthorized admin execution
- external email exfiltration
- secret access attempts
- policy boundary violations

## Production considerations

For real deployment, the following should be added:

- authenticated admin APIs
- persistent event storage instead of in-memory demo data
- real user/session identity integration
- policy configuration from a database or config service
- production-grade secrets management
- monitoring and observability hooks
- deployment separation for backend and frontend services

## Roadmap

- persistent data layer and real event storage
- multi-agent policy inheritance
- richer threat modeling and sandbox reproduction
- policy-as-code support
- better SIEM and audit export integrations
- enterprise RBAC and approval workflows

## Contributing

Contributions are welcome. If you want to improve the project:

1. fork the repository
2. create a feature branch
3. add or update tests where applicable
4. open a pull request with a clear summary

## License

This project is currently distributed without a formal license declaration. If you plan to use or distribute it widely, add a license such as MIT or Apache-2.0.

## Project status

This project is currently in active development and is intended as a security-oriented AI agent control plane prototype.

## Contact

For questions, feedback, or collaboration, connect through the repository or open an issue.
