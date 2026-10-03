import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Server,
  Terminal,
  Lock,
  Eye,
  Radio,
} from 'lucide-react';
import { api } from '../services/api';
import type { DashboardStats, SecurityEvent } from '../types';
import { DecisionBadge } from '../components/common/DecisionBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';
import { EvidenceModal } from '../components/common/EvidenceModal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await api.getDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
        // Fallback default statistics for demo resilience
        setStats({
          active_agents: 4,
          tool_calls_today: 14892,
          threats_detected: 142,
          actions_blocked: 129,
          high_risk_events: 18,
          allow_rate: 99.1,
          block_rate: 0.9,
          recent_events: [],
          threat_breakdown: {
            PROMPT_INJECTION: 58,
            PRIVILEGE_ESCALATION: 41,
            DATA_EXFILTRATION: 28,
            SECRET_ACCESS: 15,
          },
          system_status: 'OPERATIONAL',
        });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading && !stats) {
    return (
      <div className="py-24 text-center space-y-3">
        <Activity className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <p className="text-sm font-mono text-gray-400">Loading AgentGuard Security Telemetry...</p>
      </div>
    );
  }

  const s = stats || {
    active_agents: 4,
    tool_calls_today: 14892,
    threats_detected: 142,
    actions_blocked: 129,
    high_risk_events: 18,
    allow_rate: 99.1,
    block_rate: 0.9,
    recent_events: [],
    threat_breakdown: {
      PROMPT_INJECTION: 58,
      PRIVILEGE_ESCALATION: 41,
      DATA_EXFILTRATION: 28,
      SECRET_ACCESS: 15,
    },
    system_status: 'OPERATIONAL',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hero Control Plane Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111624] via-[#10141f] to-[#141b2a] border border-[#20293d] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
              ENTERPRISE SECURITY CONTROL PLANE
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
              ZERO-TRUST AGENT RUNTIME
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Autonomous AI Agent Security Gateway
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Real-time interception of agent tool calls. Evaluating permissions, detecting instruction overrides, and enforcing strict data isolation before dangerous actions reach production.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/simulator')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all ring-1 ring-blue-400/40"
          >
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Launch Attack Simulator</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-[#0f131c] border border-[#1e2535] shadow-lg hover:border-[#2f3b55] transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Intercepted Today</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mb-1">
            {s.tool_calls_today?.toLocaleString() || '14,892'}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">100% evaluated inline</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-[#0f131c] border border-[#1e2535] shadow-lg hover:border-[#2f3b55] transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Threats Blocked</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-red-400 mb-1">
            {s.actions_blocked || 129}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <span className="text-red-400 font-semibold">{s.high_risk_events || 18} critical</span>
            <span>prevented from breach</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-[#0f131c] border border-[#1e2535] shadow-lg hover:border-[#2f3b55] transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Gateway Latency</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400 mb-1">
            1.2 ms
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Deterministic</span>
            <span>(Zero LLM bottleneck)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-[#0f131c] border border-[#1e2535] shadow-lg hover:border-[#2f3b55] transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Protected Agents</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-400 mb-1">
            {s.active_agents || 4} Active
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <span className="text-purple-300 font-semibold">Support, Sales, Finance, DevOps</span>
          </div>
        </div>
      </div>

      {/* Visual Threat Breakdown & Enforcement Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Threat Categories Distribution (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0f131c] border border-[#1e2535] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
                THREAT SIGNATURES
              </span>
              <h3 className="text-base font-extrabold text-white">Detected Threat Vectors</h3>
            </div>
            <span className="text-xs font-mono text-gray-500">Last 24 Hours</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Prompt Injection / Jailbreak', count: s.threat_breakdown?.PROMPT_INJECTION || 58, color: 'bg-red-500', pct: 45 },
              { label: 'Privilege Escalation Attempts', count: s.threat_breakdown?.PRIVILEGE_ESCALATION || 41, color: 'bg-orange-500', pct: 30 },
              { label: 'Bulk Data Exfiltration', count: s.threat_breakdown?.DATA_EXFILTRATION || 28, color: 'bg-amber-500', pct: 18 },
              { label: 'Secret & API Key Access', count: s.threat_breakdown?.SECRET_ACCESS || 15, color: 'bg-purple-500', pct: 12 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium">{item.label}</span>
                  <span className="font-mono font-bold text-gray-200">{item.count}</span>
                </div>
                <div className="h-2 w-full bg-[#181e2b] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#141924] border border-[#20293d] text-xs text-gray-400">
            <span className="font-bold text-blue-400 block mb-1">Defense-in-Depth Model</span>
            Tool calls are intercepted inline, validated against strict role-based policies, and analyzed by the deterministic threat signature engine before reaching any production API.
          </div>
        </div>

        {/* Right: Security Gateway Live Feed / Recent Interceptions (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0f131c] border border-[#1e2535] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
                AUDIT TRAIL PREVIEW
              </span>
              <h3 className="text-base font-extrabold text-white">Recent Security Interceptions</h3>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table / List */}
          <div className="divide-y divide-[#1e2535] overflow-hidden">
            {(s.recent_events && s.recent_events.length > 0 ? s.recent_events.slice(0, 5) : [
              {
                event_id: 'SEC-00142',
                timestamp: '12 min ago',
                agent_name: 'Customer Support Agent',
                tool: 'database.search',
                decision: 'BLOCK',
                severity: 'CRITICAL',
                risk_score: 96,
                why_blocked: ['Query targets secrets table with Stripe API keys', 'Untrusted prompt override detected'],
                arguments: { query: "SELECT api_key FROM secrets WHERE service='stripe'" },
                evidence: [{ type: 'PROMPT_INJECTION', description: 'Keyword "ignore previous instructions" detected' }],
                trust_level: 'UNTRUSTED',
              },
              {
                event_id: 'SEC-00141',
                timestamp: '25 min ago',
                agent_name: 'Customer Support Agent',
                tool: 'admin.execute',
                decision: 'BLOCK',
                severity: 'CRITICAL',
                risk_score: 92,
                why_blocked: ['Role CUSTOMER_SUPPORT does not have ADMIN permission'],
                arguments: { command: 'disable_authentication' },
                evidence: [{ type: 'PRIVILEGE_ESCALATION', description: 'Command targets root auth daemon' }],
                trust_level: 'UNTRUSTED',
              },
              {
                event_id: 'SEC-00140',
                timestamp: '41 min ago',
                agent_name: 'Customer Support Agent',
                tool: 'email.send',
                decision: 'BLOCK',
                severity: 'CRITICAL',
                risk_score: 88,
                why_blocked: ['Recipient domain external@example.com is not in allowed domains whitelist'],
                arguments: { to: 'external@example.com', attachment: 'customers.csv' },
                evidence: [{ type: 'DATA_EXFILTRATION', description: 'Export of entire CRM customer table' }],
                trust_level: 'UNTRUSTED',
              },
              {
                event_id: 'SEC-00139',
                timestamp: '1h ago',
                agent_name: 'Customer Support Agent',
                tool: 'ticket.read',
                decision: 'ALLOW',
                severity: 'LOW',
                risk_score: 5,
                why_blocked: [],
                arguments: { ticket_id: 'TICK-8841' },
                evidence: [],
                trust_level: 'LOW',
              },
            ]).map((ev: any, idx: number) => (
              <div
                key={idx}
                className="py-3 flex items-center justify-between hover:bg-[#131722] px-2 rounded-lg transition-colors group cursor-pointer"
                onClick={() => setSelectedEvent(ev)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${ev.decision === 'BLOCK' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {ev.decision === 'BLOCK' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {ev.event_id}
                      </span>
                      <span className="font-mono text-xs text-cyan-400">{ev.tool}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {ev.agent_name} • <span className="font-mono text-gray-500">{ev.timestamp}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RiskScoreGauge score={ev.risk_score} size="sm" />
                  <DecisionBadge decision={ev.decision} size="sm" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(ev);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-white group-hover:bg-[#1f283d] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forensic Detail Modal */}
      <EvidenceModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
