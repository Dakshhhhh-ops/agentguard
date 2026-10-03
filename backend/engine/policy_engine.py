"""
Policy Engine - Evaluates tool calls against agent policies.
Returns structured policy decisions.
"""
from typing import List, Dict, Any, Optional, Tuple
from models.schemas import Decision, PolicyViolation, Evidence, ThreatType, TrustLevel
from models.agents import AgentDefinition, AGENTS


class PolicyEngine:
    """Deterministic policy evaluation engine."""

    def evaluate(
        self,
        agent_id: str,
        tool: str,
        arguments: Dict[str, Any],
        trust_level: TrustLevel,
        threats: List[ThreatType],
        destination: Optional[str] = None,
    ) -> Tuple[Decision, List[PolicyViolation], List[Evidence], List[str], bool]:
        """
        Returns: (decision, violations, evidence, why_blocked, agent_has_permission)
        """
        agent = AGENTS.get(agent_id)
        if not agent:
            return (
                Decision.BLOCK,
                [PolicyViolation.UNAUTHORIZED_TOOL],
                [Evidence(type="POLICY_ERROR", description="Unknown agent ID")],
                ["Agent not found in policy store"],
                False,
            )

        policy = agent.policy
        violations: List[PolicyViolation] = []
        evidence: List[Evidence] = []
        why_blocked: List[str] = []
        args_str = str(arguments).lower()
        agent_has_permission = True

        # 1. Check if tool is in allowed tools
        tool_allowed = self._check_tool_allowed(tool, policy.allowed_tools)
        if not tool_allowed:
            violations.append(PolicyViolation.UNAUTHORIZED_TOOL)
            evidence.append(Evidence(
                type="TOOL_NOT_AUTHORIZED",
                description=f"Tool '{tool}' is not in agent's allowed tool list",
                data={"tool": tool, "allowed_tools": policy.allowed_tools}
            ))
            why_blocked.append(f"Agent role '{policy.agent_role}' does not have access to tool '{tool}'.")
            agent_has_permission = False

        # 2. Check for restricted resource access
        for resource in policy.restricted_resources:
            if resource.lower() in args_str:
                violations.append(PolicyViolation.SECRET_ACCESS)
                evidence.append(Evidence(
                    type="RESTRICTED_RESOURCE_ACCESS",
                    description=f"Request references restricted resource: '{resource}'",
                    data={"resource": resource, "arguments": arguments}
                ))
                why_blocked.append(f"Requested resource '{resource}' is classified as restricted.")
                agent_has_permission = False

        # 3. Check prompt injection (untrusted source → privileged action)
        if trust_level == TrustLevel.UNTRUSTED and not tool_allowed:
            violations.append(PolicyViolation.UNTRUSTED_INSTRUCTION)
            evidence.append(Evidence(
                type="UNTRUSTED_SOURCE_PRIVILEGED_ACTION",
                description="Untrusted user content directed agent to perform privileged action",
                data={"trust_level": trust_level.value, "tool": tool}
            ))
            why_blocked.append("Request originated from untrusted user-controlled content.")

        # 4. Check email destination domain
        if "email" in tool.lower() or "send" in tool.lower():
            to_field = arguments.get("to", "")
            if isinstance(to_field, str) and "@" in to_field:
                domain = to_field.split("@")[-1].lower()
                if domain not in [d.lower() for d in policy.allowed_email_domains]:
                    violations.append(PolicyViolation.DOMAIN_VIOLATION)
                    evidence.append(Evidence(
                        type="UNAUTHORIZED_EMAIL_DOMAIN",
                        description=f"Email destination '{to_field}' is outside approved domains",
                        data={"destination": to_field, "allowed_domains": policy.allowed_email_domains}
                    ))
                    why_blocked.append(f"Email destination '{to_field}' is not in the approved domain list.")

        # 5. Check data export permissions
        if ThreatType.DATA_EXFILTRATION in threats and not policy.can_export_data:
            violations.append(PolicyViolation.DATA_EXFILTRATION)
            evidence.append(Evidence(
                type="EXPORT_NOT_AUTHORIZED",
                description="Agent role does not have data export permissions",
                data={"agent_role": policy.agent_role, "can_export": False}
            ))
            why_blocked.append("Agent role does not have data export authorization.")

        # 6. Check admin access
        if ThreatType.PRIVILEGE_ESCALATION in threats and not policy.can_access_admin:
            violations.append(PolicyViolation.PRIVILEGE_ESCALATION)
            evidence.append(Evidence(
                type="ADMIN_ACCESS_DENIED",
                description="Agent role does not have admin privileges",
                data={"agent_role": policy.agent_role, "requested_tool": tool}
            ))
            why_blocked.append(f"Agent role '{policy.agent_role}' cannot access admin functions.")

        # Determine decision
        if violations:
            decision = Decision.BLOCK
            if not why_blocked:
                why_blocked.append("Policy violation detected.")
        else:
            decision = Decision.ALLOW

        return (decision, violations, evidence, why_blocked, agent_has_permission)

    def _check_tool_allowed(self, tool: str, allowed_tools: List[str]) -> bool:
        """Check if tool is in the allowed tools list (prefix match)."""
        tool_lower = tool.lower()
        # Exact match
        if tool_lower in [t.lower() for t in allowed_tools]:
            return True
        # Prefix match (e.g., "crm" matches "crm.read")
        for allowed in allowed_tools:
            if tool_lower.startswith(allowed.lower().split(".")[0]):
                if "admin" not in tool_lower:
                    # Allow if it's the same base tool (not admin)
                    return True
        # Check if it's entirely different
        tool_base = tool_lower.split(".")[0]
        for allowed in allowed_tools:
            if allowed.lower().startswith(tool_base):
                return True
        return False

    def get_why_blocked_extended(
        self,
        violations: List[PolicyViolation],
        threats: List[ThreatType],
        tool: str,
        arguments: Dict[str, Any],
        agent_id: str,
    ) -> List[str]:
        """Generate extended human-readable explanation."""
        reasons = []
        if PolicyViolation.UNTRUSTED_INSTRUCTION in violations:
            reasons.append("Request originated from untrusted user-controlled content.")
        if PolicyViolation.SECRET_ACCESS in violations:
            reasons.append("Requested resource contains secret or credential material.")
        if PolicyViolation.UNAUTHORIZED_TOOL in violations:
            reasons.append(f"Agent role does not have '{tool}' permission.")
        if PolicyViolation.PRIVILEGE_ESCALATION in violations:
            reasons.append("Requested action exceeds declared agent role scope.")
        if PolicyViolation.DATA_EXFILTRATION in violations:
            reasons.append("Requested destination is outside the trusted data boundary.")
        if PolicyViolation.DOMAIN_VIOLATION in violations:
            to_field = arguments.get("to", "")
            reasons.append(f"Email destination '{to_field}' is not in the approved domain whitelist.")
        if ThreatType.PROMPT_INJECTION in threats and PolicyViolation.UNTRUSTED_INSTRUCTION not in violations:
            reasons.append("Prompt injection pattern detected in request origin.")
        return reasons if reasons else ["Security policy violation detected."]
