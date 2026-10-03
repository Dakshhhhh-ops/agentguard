"""
Risk Engine - Deterministic risk scoring.
All scores are fully explainable. No LLM dependency.
"""
from typing import List, Dict, Any, Optional
from models.schemas import (
    ThreatType, TrustLevel, Severity, RiskAssessment, RiskBreakdown
)


# Trust level → penalty mapping
TRUST_PENALTIES: Dict[TrustLevel, int] = {
    TrustLevel.UNTRUSTED: 25,
    TrustLevel.LOW: 15,
    TrustLevel.MEDIUM: 8,
    TrustLevel.HIGH: 2,
    TrustLevel.SYSTEM: 0,
}

# Sensitive resource keywords → penalty
RESOURCE_PENALTIES: Dict[str, int] = {
    "secrets": 25,
    "api_keys": 25,
    "credentials": 25,
    "passwords": 25,
    "private_keys": 25,
    "production_secrets": 25,
    "admin_config": 20,
    "customer_records": 18,
    "pii": 20,
    "export": 15,
    "all_records": 18,
    "infrastructure": 22,
}

# Tool-based risk
TOOL_RISKS: Dict[str, int] = {
    "admin.execute": 25,
    "database.export": 20,
    "database.search": 5,
    "email.send": 8,
    "crm.read": 0,
    "crm.update": 3,
    "ticket.read": 0,
    "ticket.write": 2,
    "knowledge.read": 0,
    "customer.read": 3,
}

# Threat penalty contributions
THREAT_PENALTIES: Dict[ThreatType, int] = {
    ThreatType.PROMPT_INJECTION: 8,
    ThreatType.INSTRUCTION_OVERRIDE: 4,
    ThreatType.SECRET_ACCESS: 8,
    ThreatType.PRIVILEGE_ESCALATION: 7,
    ThreatType.DATA_EXFILTRATION: 7,
    ThreatType.EXTERNAL_TRANSFER: 6,
    ThreatType.UNAUTHORIZED_TOOL: 5,
}


def _get_severity(score: int) -> Severity:
    if score >= 80:
        return Severity.CRITICAL
    elif score >= 60:
        return Severity.HIGH
    elif score >= 30:
        return Severity.MEDIUM
    else:
        return Severity.LOW


class RiskEngine:
    """Deterministic, fully explainable risk scoring engine."""

    def calculate_risk(
        self,
        tool: str,
        arguments: Dict[str, Any],
        trust_level: TrustLevel,
        threats: List[ThreatType],
        agent_has_permission: bool = True,
        destination: Optional[str] = None,
    ) -> RiskAssessment:
        breakdown = RiskBreakdown()
        explanation: List[str] = []
        args_str = str(arguments).lower()

        # 1. Source trust penalty
        source_penalty = TRUST_PENALTIES.get(trust_level, 0)
        breakdown.source_trust_penalty = source_penalty
        if source_penalty > 0:
            explanation.append(f"+{source_penalty} untrusted source (trust level: {trust_level.value})")

        # 2. Permission delta penalty
        permission_penalty = 0
        if not agent_has_permission:
            permission_penalty = 25
            explanation.append(f"+{permission_penalty} unauthorized permission (agent role denied)")
        elif ThreatType.PRIVILEGE_ESCALATION in threats:
            permission_penalty = 20
            explanation.append(f"+{permission_penalty} privilege escalation attempt")
        breakdown.permission_delta_penalty = permission_penalty

        # 3. Resource sensitivity penalty
        resource_penalty = 0
        for resource, penalty in RESOURCE_PENALTIES.items():
            if resource in args_str:
                if penalty > resource_penalty:
                    resource_penalty = penalty
                    explanation.append(f"+{penalty} sensitive resource access ({resource})")
        # Tool-based resource risk
        tool_risk = TOOL_RISKS.get(tool, 5)
        if tool_risk > 0 and resource_penalty == 0:
            resource_penalty = tool_risk
            explanation.append(f"+{tool_risk} tool risk ({tool})")
        breakdown.resource_sensitivity_penalty = resource_penalty

        # 4. Destination risk penalty
        dest_penalty = 0
        if destination:
            dest_lower = destination.lower()
            if any(bad in dest_lower for bad in ["attacker", "evil", "example.com", "external", "malicious"]):
                dest_penalty = 20
                explanation.append(f"+{dest_penalty} external untrusted destination ({destination})")
            elif "internal" not in dest_lower:
                dest_penalty = 8
                explanation.append(f"+{dest_penalty} unverified destination")
        elif ThreatType.EXTERNAL_TRANSFER in threats:
            dest_penalty = 20
            explanation.append(f"+{dest_penalty} external data transfer detected")
        breakdown.destination_risk_penalty = dest_penalty

        # 5. Threat indicator penalties
        threat_penalty = 0
        for threat in threats:
            p = THREAT_PENALTIES.get(threat, 3)
            threat_penalty += p
            explanation.append(f"+{p} threat indicator ({threat.value})")
        breakdown.threat_indicator_penalty = min(threat_penalty, 20)

        # Total
        total = (
            breakdown.source_trust_penalty
            + breakdown.permission_delta_penalty
            + breakdown.resource_sensitivity_penalty
            + breakdown.destination_risk_penalty
            + breakdown.threat_indicator_penalty
        )
        total = min(total, 100)
        breakdown.total = total

        return RiskAssessment(
            score=total,
            severity=_get_severity(total),
            breakdown=breakdown,
            explanation=explanation,
        )
