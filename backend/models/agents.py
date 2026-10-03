from typing import List, Dict, Optional
from pydantic import BaseModel


class AgentPermission(BaseModel):
    tool: str
    allowed_actions: List[str]
    restricted_resources: List[str] = []
    allowed_destinations: List[str] = []
    description: str = ""


class AgentPolicy(BaseModel):
    agent_id: str
    agent_role: str
    allowed_tools: List[str]
    restricted_resources: List[str]
    allowed_email_domains: List[str]
    max_export_records: int = 0
    can_access_secrets: bool = False
    can_access_admin: bool = False
    can_export_data: bool = False
    permissions: List[AgentPermission] = []


class AgentDefinition(BaseModel):
    id: str
    name: str
    role: str
    description: str
    tools: List[str]
    policy: AgentPolicy
    status: str = "active"
    color: str = "#3b82f6"


# Default agents
AGENTS: Dict[str, AgentDefinition] = {
    "customer_support_agent": AgentDefinition(
        id="customer_support_agent",
        name="Customer Support Agent",
        role="CUSTOMER_SUPPORT",
        description="Handles customer support tickets, resolves issues, and manages CRM records.",
        tools=["customer_db", "crm", "ticket_system", "email", "knowledge_base"],
        policy=AgentPolicy(
            agent_id="customer_support_agent",
            agent_role="CUSTOMER_SUPPORT",
            allowed_tools=["crm.read", "ticket.read", "ticket.write", "customer.read", "email.send", "knowledge.read"],
            restricted_resources=["credentials", "api_keys", "production_secrets", "admin_config", "infrastructure"],
            allowed_email_domains=["customer.com", "example-corp.com", "support-test.io"],
            max_export_records=0,
            can_access_secrets=False,
            can_access_admin=False,
            can_export_data=False,
            permissions=[
                AgentPermission(tool="customer_db", allowed_actions=["read"], restricted_resources=["credentials", "api_keys", "secrets"], description="Read customer records only"),
                AgentPermission(tool="crm", allowed_actions=["read", "update"], restricted_resources=[], description="Read and update CRM tickets"),
                AgentPermission(tool="ticket_system", allowed_actions=["read", "write"], restricted_resources=[], description="Full ticket management"),
                AgentPermission(tool="email", allowed_actions=["send"], allowed_destinations=["customer.com", "example-corp.com", "support-test.io"], restricted_resources=[], description="Send email to approved customer domains only"),
                AgentPermission(tool="knowledge_base", allowed_actions=["read"], restricted_resources=[], description="Read internal knowledge base"),
            ]
        ),
        status="active",
        color="#3b82f6"
    ),
    "billing_agent": AgentDefinition(
        id="billing_agent",
        name="Billing Agent",
        role="BILLING",
        description="Processes refunds, billing inquiries, and payment records.",
        tools=["billing_db", "payment_gateway", "email"],
        policy=AgentPolicy(
            agent_id="billing_agent",
            agent_role="BILLING",
            allowed_tools=["billing.read", "refund.create", "email.send"],
            restricted_resources=["raw_card_data", "admin_config", "secrets"],
            allowed_email_domains=["customer.com"],
            max_export_records=0,
            can_access_secrets=False,
            can_access_admin=False,
            can_export_data=False,
        ),
        status="active",
        color="#8b5cf6"
    ),
}
