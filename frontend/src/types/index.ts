// AgentGuard TypeScript Type Definitions

export type TrustLevel = 'UNTRUSTED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'SYSTEM';
export type Decision = 'ALLOW' | 'BLOCK' | 'REVIEW';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ThreatType =
  | 'PROMPT_INJECTION'
  | 'PRIVILEGE_ESCALATION'
  | 'DATA_EXFILTRATION'
  | 'SECRET_ACCESS'
  | 'UNAUTHORIZED_TOOL'
  | 'EXTERNAL_TRANSFER'
  | 'INSTRUCTION_OVERRIDE';

export type PolicyViolation =
  | 'SECRET_ACCESS'
  | 'PRIVILEGE_ESCALATION'
  | 'DATA_EXFILTRATION'
  | 'UNTRUSTED_INSTRUCTION'
  | 'UNAUTHORIZED_TOOL'
  | 'DOMAIN_VIOLATION'
  | 'EXPORT_VIOLATION';

export interface RiskBreakdown {
  source_trust_penalty: number;
  permission_delta_penalty: number;
  resource_sensitivity_penalty: number;
  destination_risk_penalty: number;
  threat_indicator_penalty: number;
  total: number;
}

export interface Evidence {
  type: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface SecurityEvent {
  event_id: string;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  session_id: string;
  tool: string;
  arguments: Record<string, unknown>;
  source: string;
  trust_level: TrustLevel;
  risk_score: number;
  severity: Severity;
  decision: Decision;
  threats: ThreatType[];
  policies_triggered: PolicyViolation[];
  evidence: Evidence[];
  why_blocked: string[];
  recommended_action: string;
  raw_instruction?: string;
}

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  agent: string;
  action: string;
  tool: string;
  risk_score: number;
  severity: Severity;
  decision: Decision;
  threat_type?: ThreatType;
  session_id: string;
}

export interface AgentPermission {
  tool: string;
  allowed_actions: string[];
  restricted_resources: string[];
  allowed_destinations: string[];
  description: string;
}

export interface AgentPolicy {
  agent_id: string;
  agent_role: string;
  allowed_tools: string[];
  restricted_resources: string[];
  allowed_email_domains: string[];
  can_access_secrets: boolean;
  can_access_admin: boolean;
  can_export_data: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  tools: string[];
  status: string;
  color: string;
  policy: AgentPolicy;
  permissions: AgentPermission[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  attack_type: string;
  severity: Severity;
}

export interface SimulationStep {
  step_id: string;
  timestamp: string;
  stage: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'blocked';
  data?: Record<string, unknown>;
}

export interface SimulationCompleteData {
  stage: 'COMPLETE';
  label: string;
  final_decision: Decision;
  risk_score: number;
  event_id: string;
  severity: Severity;
  threats: ThreatType[];
  policies_triggered: PolicyViolation[];
  why_blocked: string[];
  evidence: Evidence[];
  recommended_action: string;
}

export interface DashboardStats {
  active_agents: number;
  tool_calls_today: number;
  threats_detected: number;
  actions_blocked: number;
  high_risk_events: number;
  allow_rate: number;
  block_rate: number;
  recent_events: SecurityEvent[];
  threat_breakdown: Record<string, number>;
  system_status: string;
}

export interface ToolRequest {
  tool: string;
  arguments: Record<string, unknown>;
  source?: string;
  trust_level?: TrustLevel;
  agent_id?: string;
  session_id?: string;
  raw_instruction?: string;
}

export interface EvaluationResponse {
  decision: Decision;
  risk_score: number;
  severity: Severity;
  threats: ThreatType[];
  policies_triggered: PolicyViolation[];
  evidence: Evidence[];
  why_blocked: string[];
  event_id: string;
  risk_breakdown: RiskBreakdown;
  recommended_action: string;
}
