"""
Interceptor - Main AgentGuard interception layer.
Orchestrates threat detection, risk scoring, and policy evaluation.
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from models.schemas import (
    ToolRequest, EvaluationResponse, SecurityEvent, Decision,
    TrustLevel, AuditEvent
)
from engine.threat_engine import ThreatEngine
from engine.risk_engine import RiskEngine
from engine.policy_engine import PolicyEngine


class AgentGuardInterceptor:
    """
    Main interception layer - sits between agent and tools.
    Orchestrates: Threat → Risk → Policy → Decision → Evidence → Audit
    """

    def __init__(self):
        self.threat_engine = ThreatEngine()
        self.risk_engine = RiskEngine()
        self.policy_engine = PolicyEngine()

    def intercept(self, request: ToolRequest) -> tuple[EvaluationResponse, SecurityEvent]:
        """
        Main interception method.
        Returns (evaluation_response, security_event)
        """
        event_id = f"SEC-{str(uuid.uuid4().int)[:5]:0>5}"
        session_id = request.session_id or str(uuid.uuid4())[:8].upper()
        destination = request.arguments.get("to")

        # Stage 1: Threat Detection
        threats = self.threat_engine.detect_threats(
            tool=request.tool,
            arguments=request.arguments,
            trust_level=request.trust_level,
            raw_instruction=request.raw_instruction,
        )

        # Stage 2: Policy Evaluation
        (decision, violations, evidence, why_blocked, agent_has_permission) = self.policy_engine.evaluate(
            agent_id=request.agent_id,
            tool=request.tool,
            arguments=request.arguments,
            trust_level=request.trust_level,
            threats=threats,
            destination=destination,
        )

        # Stage 3: Extended explanation
        if decision == Decision.BLOCK:
            extended_reasons = self.policy_engine.get_why_blocked_extended(
                violations=violations,
                threats=threats,
                tool=request.tool,
                arguments=request.arguments,
                agent_id=request.agent_id,
            )
            why_blocked = list(set(why_blocked + extended_reasons))

        # Stage 4: Risk Scoring
        risk = self.risk_engine.calculate_risk(
            tool=request.tool,
            arguments=request.arguments,
            trust_level=request.trust_level,
            threats=threats,
            agent_has_permission=agent_has_permission,
            destination=str(destination) if destination else None,
        )

        # Stage 5: Recommended action
        recommended_action = self._get_recommended_action(decision, threats, violations)

        # Build response
        response = EvaluationResponse(
            decision=decision,
            risk_score=risk.score,
            severity=risk.severity,
            threats=threats,
            policies_triggered=violations,
            evidence=evidence,
            why_blocked=why_blocked,
            event_id=event_id,
            risk_breakdown=risk.breakdown,
            recommended_action=recommended_action,
        )

        # Build security event record
        from models.agents import AGENTS
        agent = AGENTS.get(request.agent_id)
        agent_name = agent.name if agent else request.agent_id

        event = SecurityEvent(
            event_id=event_id,
            timestamp=datetime.utcnow(),
            agent_id=request.agent_id,
            agent_name=agent_name,
            session_id=session_id,
            tool=request.tool,
            arguments=request.arguments,
            source=request.source,
            trust_level=request.trust_level,
            risk_score=risk.score,
            severity=risk.severity,
            decision=decision,
            threats=threats,
            policies_triggered=violations,
            evidence=evidence,
            why_blocked=why_blocked,
            recommended_action=recommended_action,
            raw_instruction=request.raw_instruction,
        )

        return response, event

    def _get_recommended_action(self, decision, threats, violations) -> str:
        if decision == Decision.ALLOW:
            return "Tool call permitted. Continue execution."
        from models.schemas import ThreatType, PolicyViolation
        if ThreatType.PROMPT_INJECTION in threats:
            return "Quarantine session. Flag user message for human review. Log event for forensic analysis."
        if ThreatType.PRIVILEGE_ESCALATION in threats:
            return "Reject request. Alert security team. Review agent configuration."
        if ThreatType.DATA_EXFILTRATION in threats:
            return "Block transfer. Preserve evidence. Notify data protection officer."
        if PolicyViolation.SECRET_ACCESS in violations:
            return "Block access. Rotate potentially exposed secrets. Review agent prompts."
        return "Block action. Log for audit review."
