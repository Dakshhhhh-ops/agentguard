"""
Threat Engine - Deterministic threat indicator detection.
Analyzes tool calls for known attack patterns without any LLM dependency.
"""
import re
from typing import List, Dict, Any, Optional
from models.schemas import ThreatType, TrustLevel


# Keywords indicating prompt injection attempts
INJECTION_KEYWORDS = [
    "ignore previous instructions",
    "ignore all instructions",
    "disregard previous",
    "forget your instructions",
    "new instructions:",
    "system override",
    "override safety",
    "you are now",
    "act as",
    "pretend you are",
    "jailbreak",
    "ignore the above",
    "do not follow",
    "bypass",
    "ignore your",
    "new role:",
    "from now on",
    "your new task",
    "important:",
    "attention:",
]

# SQL patterns indicating secret/sensitive data access
SECRET_SQL_PATTERNS = [
    r"select.*api_key",
    r"select.*secret",
    r"select.*password",
    r"select.*credential",
    r"select.*token",
    r"from\s+secrets",
    r"from\s+credentials",
    r"from\s+api_keys",
    r"from\s+config",
    r"where.*secret",
    r"select\s+\*\s+from",
]

# Export patterns for data exfiltration
EXPORT_PATTERNS = [
    "export",
    "dump",
    "download",
    "backup",
    "extract",
    "full_table",
    "all_records",
    "bulk_export",
    "*",
]

# Admin command patterns
ADMIN_PATTERNS = [
    "disable_authentication",
    "grant_admin",
    "delete_users",
    "drop_table",
    "truncate",
    "shutdown",
    "restart",
    "admin",
    "root",
    "sudo",
    "privilege",
    "escalate",
]

# Sensitive resource identifiers
SENSITIVE_RESOURCES = [
    "secrets", "api_keys", "credentials", "passwords", "tokens",
    "private_keys", "encryption_keys", "admin_config", "production_secrets",
    "infrastructure", "ssl_cert", "auth_token",
]

# External/untrusted email domains
UNTRUSTED_DOMAINS = [
    "attacker.com", "example.com", "evil.com", "exfil.io",
    "malicious.net", "hacker.org", "phish.com",
]


class ThreatEngine:
    """Deterministic threat detection engine."""

    def detect_threats(
        self,
        tool: str,
        arguments: Dict[str, Any],
        trust_level: TrustLevel,
        raw_instruction: Optional[str] = None,
    ) -> List[ThreatType]:
        threats: List[ThreatType] = []
        args_str = str(arguments).lower()
        instr_str = (raw_instruction or "").lower()
        combined = args_str + " " + instr_str

        # 1. Prompt injection detection
        if self._detect_prompt_injection(combined):
            threats.append(ThreatType.PROMPT_INJECTION)
            threats.append(ThreatType.INSTRUCTION_OVERRIDE)

        # 2. Secret access detection
        if self._detect_secret_access(tool, arguments, args_str):
            threats.append(ThreatType.SECRET_ACCESS)

        # 3. Privilege escalation detection
        if self._detect_privilege_escalation(tool, arguments, args_str):
            threats.append(ThreatType.PRIVILEGE_ESCALATION)

        # 4. Data exfiltration detection
        if self._detect_data_exfiltration(tool, arguments, args_str):
            threats.append(ThreatType.DATA_EXFILTRATION)

        # 5. External transfer detection
        if self._detect_external_transfer(tool, arguments):
            threats.append(ThreatType.EXTERNAL_TRANSFER)

        # 6. Unauthorized tool detection
        if self._detect_unauthorized_tool(tool, trust_level):
            threats.append(ThreatType.UNAUTHORIZED_TOOL)

        return list(set(threats))  # deduplicate

    def _detect_prompt_injection(self, text: str) -> bool:
        for keyword in INJECTION_KEYWORDS:
            if keyword.lower() in text:
                return True
        return False

    def _detect_secret_access(self, tool: str, arguments: Dict, args_str: str) -> bool:
        # Check if querying secrets table/resource
        for resource in SENSITIVE_RESOURCES:
            if resource in args_str:
                return True
        # Check SQL patterns
        query = arguments.get("query", "")
        if isinstance(query, str):
            query_lower = query.lower()
            for pattern in SECRET_SQL_PATTERNS:
                if re.search(pattern, query_lower):
                    return True
        return False

    def _detect_privilege_escalation(self, tool: str, arguments: Dict, args_str: str) -> bool:
        # Admin tool access
        if "admin" in tool.lower():
            return True
        # Admin commands in arguments
        for pattern in ADMIN_PATTERNS:
            if pattern in args_str:
                return True
        return False

    def _detect_data_exfiltration(self, tool: str, arguments: Dict, args_str: str) -> bool:
        # Export operations on sensitive data
        if "export" in tool.lower() or "database.export" in tool.lower():
            return True
        for pattern in EXPORT_PATTERNS:
            if pattern in args_str:
                return True
        # Check for attachment with customer data
        attachment = arguments.get("attachment", "")
        if isinstance(attachment, str) and ("csv" in attachment.lower() or "customer" in attachment.lower()):
            return True
        return False

    def _detect_external_transfer(self, tool: str, arguments: Dict) -> bool:
        if "email" not in tool.lower() and "send" not in tool.lower():
            return False
        to_field = arguments.get("to", "")
        if isinstance(to_field, str):
            for domain in UNTRUSTED_DOMAINS:
                if domain in to_field.lower():
                    return True
            # Any external domain not in whitelist
            if "@" in to_field and not any(
                d in to_field for d in ["customer.com", "example-corp.com", "support-test.io"]
            ):
                return True
        return False

    def _detect_unauthorized_tool(self, tool: str, trust_level: TrustLevel) -> bool:
        if trust_level == TrustLevel.UNTRUSTED and "admin" in tool.lower():
            return True
        return False

    def get_threat_indicators(self, threats: List[ThreatType]) -> List[str]:
        """Return human-readable threat indicator descriptions."""
        descriptions = {
            ThreatType.PROMPT_INJECTION: "Instruction override attempt detected in user input",
            ThreatType.INSTRUCTION_OVERRIDE: "Agent instruction context manipulation detected",
            ThreatType.SECRET_ACCESS: "Request targets secret/credential resources",
            ThreatType.PRIVILEGE_ESCALATION: "Requested action exceeds agent role permissions",
            ThreatType.DATA_EXFILTRATION: "Bulk data export to unverified destination",
            ThreatType.EXTERNAL_TRANSFER: "Data transfer to untrusted external domain",
            ThreatType.UNAUTHORIZED_TOOL: "Tool call not authorized for current agent role",
        }
        return [descriptions.get(t, str(t)) for t in threats]
