"""
AgentGuard - Runtime Security Gateway for Autonomous AI Agents
FastAPI Backend
"""
import json
import asyncio
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager

from models.schemas import (
    ToolRequest, EvaluationRequest, EvaluationResponse,
    SecurityEvent, AuditEvent, Decision, Severity
)
from engine.interceptor import AgentGuardInterceptor
from services.event_store import (
    seed_events, store_event, get_events, get_event,
    get_audit_events, get_dashboard_stats
)
from services.simulation_service import (
    get_scenarios, stream_simulation, SCENARIOS
)
from models.agents import AGENTS


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed synthetic demo data on startup
    seed_events()
    print("[OK] AgentGuard security engine initialized")
    print("[OK] Synthetic demo events seeded")
    yield
    print("[OK] AgentGuard shutting down")


app = FastAPI(
    title="AgentGuard Security API",
    description="Runtime Security Gateway for Autonomous AI Agents",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

interceptor = AgentGuardInterceptor()


# ────────────────────────────────────────────────────────────
# HEALTH
# ────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {
        "status": "operational",
        "service": "AgentGuard Security Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "engines": {
            "threat_engine": "operational",
            "risk_engine": "operational",
            "policy_engine": "operational",
            "interceptor": "operational",
        },
        "environment": "DEMO - Synthetic Security Sandbox",
    }


# ────────────────────────────────────────────────────────────
# DASHBOARD
# ────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
def dashboard():
    stats = get_dashboard_stats()
    return stats


# ────────────────────────────────────────────────────────────
# AGENTS
# ────────────────────────────────────────────────────────────

@app.get("/api/agents")
def list_agents():
    return {
        "agents": [
            {
                "id": a.id,
                "name": a.name,
                "role": a.role,
                "description": a.description,
                "tools": a.tools,
                "status": a.status,
                "color": a.color,
                "policy": {
                    "allowed_tools": a.policy.allowed_tools,
                    "restricted_resources": a.policy.restricted_resources,
                    "allowed_email_domains": a.policy.allowed_email_domains,
                    "can_access_secrets": a.policy.can_access_secrets,
                    "can_access_admin": a.policy.can_access_admin,
                    "can_export_data": a.policy.can_export_data,
                },
                "permissions": [p.dict() for p in a.policy.permissions],
            }
            for a in AGENTS.values()
        ]
    }


@app.get("/api/agents/{agent_id}")
def get_agent(agent_id: str):
    agent = AGENTS.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return {
        "id": agent.id,
        "name": agent.name,
        "role": agent.role,
        "description": agent.description,
        "tools": agent.tools,
        "status": agent.status,
        "color": agent.color,
        "policy": agent.policy.dict(),
        "permissions": [p.dict() for p in agent.policy.permissions],
    }


# ────────────────────────────────────────────────────────────
# POLICIES
# ────────────────────────────────────────────────────────────

@app.get("/api/policies")
def list_policies():
    return {
        "policies": [
            {
                "agent_id": a.id,
                "agent_name": a.name,
                "policy": a.policy.dict(),
            }
            for a in AGENTS.values()
        ]
    }


# ────────────────────────────────────────────────────────────
# EVENTS
# ────────────────────────────────────────────────────────────

@app.get("/api/events")
def list_events(
    limit: int = Query(50, ge=1, le=200),
    agent_id: Optional[str] = None,
    decision: Optional[str] = None,
    severity: Optional[str] = None,
):
    events = get_events(limit=limit, agent_id=agent_id, decision=decision, severity=severity)
    return {
        "events": [e.dict() for e in events],
        "total": len(events),
    }


@app.get("/api/events/{event_id}")
def get_event_detail(event_id: str):
    event = get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
    return event.dict()


# ────────────────────────────────────────────────────────────
# AUDIT
# ────────────────────────────────────────────────────────────

@app.get("/api/audit")
def list_audit(limit: int = Query(100, ge=1, le=500)):
    events = get_audit_events(limit=limit)
    return {
        "audit_events": [e.dict() for e in events],
        "total": len(events),
        "note": "DEMO ENVIRONMENT - Synthetic Security Events",
    }


# ────────────────────────────────────────────────────────────
# EVALUATE TOOL CALL
# ────────────────────────────────────────────────────────────

@app.post("/api/evaluate-tool-call", response_model=EvaluationResponse)
def evaluate_tool_call(request: EvaluationRequest):
    """Evaluate a single tool call request through AgentGuard."""
    response, event = interceptor.intercept(request.tool_request)
    store_event(event)
    return response


@app.post("/api/simulate")
def simulate_tool_call(request: ToolRequest):
    """Quick simulation endpoint."""
    response, event = interceptor.intercept(request)
    store_event(event)
    return {
        "decision": response.decision.value,
        "risk_score": response.risk_score,
        "severity": response.severity.value,
        "threats": [t.value for t in response.threats],
        "policies_triggered": [p.value for p in response.policies_triggered],
        "evidence": [e.dict() for e in response.evidence],
        "why_blocked": response.why_blocked,
        "event_id": event.event_id,
        "risk_breakdown": response.risk_breakdown.dict(),
        "recommended_action": response.recommended_action,
    }


# ────────────────────────────────────────────────────────────
# SCENARIOS
# ────────────────────────────────────────────────────────────

@app.get("/api/scenarios")
def list_scenarios():
    return {"scenarios": get_scenarios()}


@app.post("/api/scenarios/{scenario_id}/run")
async def run_scenario_sse(scenario_id: str, speed: str = "normal"):
    """Run scenario and stream results via Server-Sent Events."""
    if scenario_id not in SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    async def event_generator():
        try:
            async for step in stream_simulation(scenario_id, speed):
                data = json.dumps(step, default=str)
                yield f"data: {data}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: {\"stage\": \"STREAM_END\"}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
