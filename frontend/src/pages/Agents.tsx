import React, { useEffect, useState } from 'react';
import {
  Bot,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Database,
  Mail,
  FileCode,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import type { Agent } from '../types';

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('customer_support_agent');

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await api.getAgents();
        setAgents(data);
      } catch (err) {
        console.error('Failed to load agents', err);
        // Fallback default agents
        setAgents([
          {
            id: 'customer_support_agent',
            name: 'Customer Support Agent',
            role: 'CUSTOMER_SUPPORT',
            description: 'Handles incoming customer support tickets, troubleshoots accounts, and interacts with CRM.',
            tools: ['customer_db', 'crm', 'ticket_system', 'email', 'knowledge_base'],
            status: 'active',
            color: '#3b82f6',
            policy: {
              agent_id: 'customer_support_agent',
              agent_role: 'CUSTOMER_SUPPORT',
              allowed_tools: ['crm.read', 'ticket.read', 'ticket.write', 'customer.read', 'email.send', 'knowledge.read'],
              restricted_resources: ['credentials', 'api_keys', 'production_secrets', 'admin_config', 'infrastructure'],
              allowed_email_domains: ['customer.com', 'example-corp.com', 'support-test.io'],
              can_access_secrets: false,
              can_access_admin: false,
              can_export_data: false,
            },
            permissions: [
              {
                tool: 'customer_db',
                allowed_actions: ['read'],
                restricted_resources: ['credentials', 'api_keys', 'secrets'],
                allowed_destinations: [],
                description: 'Read-only access to customer profile data',
              },
              {
                tool: 'email',
                allowed_actions: ['send'],
                restricted_resources: ['all_records', 'bulk_export'],
                allowed_destinations: ['customer.com', 'example-corp.com', 'support-test.io'],
                description: 'Outbound emails restricted strictly to verified customer domains',
              },
              {
                tool: 'admin',
                allowed_actions: [],
                restricted_resources: ['*'],
                allowed_destinations: [],
                description: 'Administrative tool execution strictly forbidden',
              },
            ],
          },
          {
            id: 'sales_ops_agent',
            name: 'Sales Operations Agent',
            role: 'SALES_OPS',
            description: 'Automates outbound lead generation, pipeline analytics, and calendar bookings.',
            tools: ['salesforce_crm', 'calendar_api', 'email', 'enrichment_db'],
            status: 'active',
            color: '#10b981',
            policy: {
              agent_id: 'sales_ops_agent',
              agent_role: 'SALES_OPS',
              allowed_tools: ['salesforce.read', 'salesforce.update', 'calendar.schedule', 'email.send'],
              restricted_resources: ['credit_card_data', 'billing_keys', 'employee_salaries'],
              allowed_email_domains: ['*'],
              can_access_secrets: false,
              can_access_admin: false,
              can_export_data: false,
            },
            permissions: [],
          },
          {
            id: 'financial_analyst_agent',
            name: 'Financial Analyst Agent',
            role: 'FINANCE',
            description: 'Queries aggregated sales figures, computes quarterly EBITDA, and prepares forecast drafts.',
            tools: ['reporting_db', 'calc_engine', 'spreadsheets'],
            status: 'active',
            color: '#f59e0b',
            policy: {
              agent_id: 'financial_analyst_agent',
              agent_role: 'FINANCE',
              allowed_tools: ['reporting.query', 'calc.run', 'sheets.export'],
              restricted_resources: ['banking_credentials', 'payout_credentials', 'raw_ssn'],
              allowed_email_domains: ['internal-finance.corp'],
              can_access_secrets: false,
              can_access_admin: false,
              can_export_data: true,
            },
            permissions: [],
          },
          {
            id: 'devops_assistant',
            name: 'DevOps Cloud Assistant',
            role: 'DEVOPS',
            description: 'Monitors cluster health, checks deployment status, and reads telemetry logs.',
            tools: ['k8s_read', 'datadog_api', 'ci_logs'],
            status: 'active',
            color: '#8b5cf6',
            policy: {
              agent_id: 'devops_assistant',
              agent_role: 'DEVOPS',
              allowed_tools: ['k8s.get', 'datadog.metrics', 'logs.tail'],
              restricted_resources: ['production_certs', 'kms_keys', 'root_kubeconfig'],
              allowed_email_domains: ['ops-alerts.corp'],
              can_access_secrets: false,
              can_access_admin: false,
              can_export_data: false,
            },
            permissions: [],
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase">
            AGENT REGISTRY & POLICIES
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
            LEAST-PRIVILEGE ENFORCEMENT
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Protected Autonomous Agents</h1>
        <p className="text-xs text-gray-400 mt-1">
          Every autonomous agent is wrapped by an AgentGuard perimeter policy specifying tool whitelists, forbidden resources, and destination isolation.
        </p>
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#151c2a] border-blue-500/70 shadow-lg shadow-blue-500/15 ring-1 ring-blue-400/30'
                  : 'bg-[#0f131c] border-[#1e2535] hover:border-[#2f3b55] hover:bg-[#131722]'
              }`}
            >
              {isSelected && <span className="absolute top-0 right-0 w-2 h-full bg-blue-500" />}
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PROTECTED
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-0.5">{agent.name}</h3>
              <div className="text-[11px] font-mono text-gray-400 mb-2">{agent.role}</div>
              <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Deep Dive */}
      {selectedAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Policy Bounds & Restrictions (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0f131c] border border-[#1e2535] shadow-lg space-y-5">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                SECURITY BOUNDARIES
              </span>
              <h3 className="text-base font-extrabold text-white">
                {selectedAgent.name} Policy Configuration
              </h3>
            </div>

            {/* Permission Flags Checklist */}
            <div className="space-y-2.5">
              {[
                {
                  label: 'Can Access API Keys & Secrets',
                  allowed: selectedAgent.policy?.can_access_secrets || false,
                },
                {
                  label: 'Can Execute Admin / Root Shell Commands',
                  allowed: selectedAgent.policy?.can_access_admin || false,
                },
                {
                  label: 'Can Perform Bulk Database Exports',
                  allowed: selectedAgent.policy?.can_export_data || false,
                },
              ].map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#141924] border border-[#21293a] flex items-center justify-between"
                >
                  <span className="text-xs text-gray-300 font-medium">{flag.label}</span>
                  {flag.allowed ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ALLOWED
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> DENIED
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Restricted Resources Tag Cloud */}
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-2">
                RESTRICTED SENSITIVE RESOURCES
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedAgent.policy?.restricted_resources || ['credentials', 'api_keys', 'secrets']).map(
                  (res, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/30 flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-red-400" />
                      {res}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Allowed Email Domains */}
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block mb-2">
                AUTHORIZED EXFILTRATION / EMAIL DOMAINS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedAgent.policy?.allowed_email_domains || ['customer.com']).map(
                  (domain, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3 text-emerald-400" />
                      {domain}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Whitelisted Tools & Permissions Matrix (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0f131c] border border-[#1e2535] shadow-lg space-y-5">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                TOOL EXECUTION CAPABILITIES
              </span>
              <h3 className="text-base font-extrabold text-white">Whitelisted Tools & Limits</h3>
            </div>

            {/* Tool Whitelist Chips */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                ALLOWED TOOL APIS:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(selectedAgent.policy?.allowed_tools || ['crm.read', 'ticket.read', 'customer.read']).map(
                  (t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#141924] border border-[#21293a] flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-mono text-xs font-semibold text-cyan-300">{t}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Permission Graph / Breakdown */}
            <div className="p-4 rounded-xl bg-[#121622] border border-[#1e2535] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Enforcement Mode</span>
                <span className="font-mono text-emerald-400 font-semibold">STRICT ZERO-TRUST</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                If the agent attempts to invoke any tool outside of the allowed whitelist (e.g.{' '}
                <code className="text-red-400 font-mono">admin.execute</code>,{' '}
                <code className="text-red-400 font-mono">database.export</code>), AgentGuard immediately drops the request, issues a BLOCK verdict, and records a critical violation event.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
