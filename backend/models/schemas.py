from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class TrustLevel(str, Enum):
    UNTRUSTED = "UNTRUSTED"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    SYSTEM = "SYSTEM"


class Decision(str, Enum):
    ALLOW = "ALLOW"
    BLOCK = "BLOCK"
    REVIEW = "REVIEW"


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ThreatType(str, Enum):
    PROMPT_INJECTION = "PROMPT_INJECTION"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"
    DATA_EXFILTRATION = "DATA_EXFILTRATION"
    SECRET_ACCESS = "SECRET_ACCESS"
    UNAUTHORIZED_TOOL = "UNAUTHORIZED_TOOL"
    EXTERNAL_TRANSFER = "EXTERNAL_TRANSFER"
    INSTRUCTION_OVERRIDE = "INSTRUCTION_OVERRIDE"


class PolicyViolation(str, Enum):
    SECRET_ACCESS = "SECRET_ACCESS"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"
    DATA_EXFILTRATION = "DATA_EXFILTRATION"
    UNTRUSTED_INSTRUCTION = "UNTRUSTED_INSTRUCTION"
    UNAUTHORIZED_TOOL = "UNAUTHORIZED_TOOL"
    DOMAIN_VIOLATION = "DOMAIN_VIOLATION"
    EXPORT_VIOLATION = "EXPORT_VIOLATION"


class ToolRequest(BaseModel):
    tool: str
    arguments: Dict[str, Any]
    source: str = "user_message"
    trust_level: TrustLevel = TrustLevel.UNTRUSTED
    session_id: Optional[str] = None
    agent_id: str = "customer_support_agent"
    raw_instruction: Optional[str] = None


class RiskBreakdown(BaseModel):
    source_trust_penalty: int = 0
    permission_delta_penalty: int = 0
    resource_sensitivity_penalty: int = 0
    destination_risk_penalty: int = 0
    threat_indicator_penalty: int = 0
    total: int = 0


class RiskAssessment(BaseModel):
    score: int
    severity: Severity
    breakdown: RiskBreakdown
    explanation: List[str] = []


class Evidence(BaseModel):
    type: str
    description: str
    data: Optional[Dict[str, Any]] = None


class SecurityEvent(BaseModel):
    event_id: str
    timestamp: datetime
    agent_id: str
    agent_name: str
    session_id: str
    tool: str
    arguments: Dict[str, Any]
    source: str
    trust_level: TrustLevel
    risk_score: int
    severity: Severity
    decision: Decision
    threats: List[ThreatType]
    policies_triggered: List[PolicyViolation]
    evidence: List[Evidence]
    why_blocked: List[str]
    recommended_action: str
    raw_instruction: Optional[str] = None


class EvaluationRequest(BaseModel):
    tool_request: ToolRequest
    context: Optional[Dict[str, Any]] = None


class EvaluationResponse(BaseModel):
    decision: Decision
    risk_score: int
    severity: Severity
    threats: List[ThreatType]
    policies_triggered: List[PolicyViolation]
    evidence: List[Evidence]
    why_blocked: List[str]
    event_id: str
    risk_breakdown: RiskBreakdown
    recommended_action: str


class SimulationStep(BaseModel):
    step_id: str
    timestamp: str
    stage: str
    label: str
    description: str
    data: Optional[Dict[str, Any]] = None
    status: str = "pending"  # pending | running | done | blocked


class SimulationRequest(BaseModel):
    scenario_id: str
    speed: str = "normal"  # slow | normal | fast


class SimulationResult(BaseModel):
    session_id: str
    scenario_id: str
    steps: List[SimulationStep]
    final_decision: Decision
    risk_score: int
    event_id: str


class AuditEvent(BaseModel):
    event_id: str
    timestamp: datetime
    agent: str
    action: str
    tool: str
    risk_score: int
    severity: Severity
    decision: Decision
    threat_type: Optional[ThreatType] = None
    session_id: str
