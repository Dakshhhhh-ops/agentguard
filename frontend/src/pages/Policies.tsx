import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldAlert,
  Lock,
  Mail,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Flame,
  Radio,
} from 'lucide-react';

interface SecurityPolicyRule {
  id: string;
  name: string;
  category: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  enabled: boolean;
  enforcementAction: 'BLOCK' | 'REVIEW' | 'ALLOW';
  triggersToday: number;
}

export const Policies: React.FC = () => {
  const [rules, setRules] = useState<SecurityPolicyRule[]>([
    {
      id: 'POL-SEC-01',
      name: 'Secrets & Credential Access Barrier',
      category: 'DATA_ISOLATION',
      description: 'Blocks any tool call querying passwords, API keys, private keys, or credentials tables.',
      severity: 'CRITICAL',
      enabled: true,
      enforcementAction: 'BLOCK',
      triggersToday: 38,
    },
    {
      id: 'POL-INJ-02',
      name: 'Prompt Injection & Instruction Override Guard',
      category: 'THREAT_DETECTION',
      description: 'Detects jailbreak signatures such as "ignore previous instructions" in agent prompt contexts.',
      severity: 'CRITICAL',
      enabled: true,
      enforcementAction: 'BLOCK',
      triggersToday: 58,
    },
    {
      id: 'POL-PRV-03',
      name: 'Role-Based Tool Boundary Guard',
      category: 'ACCESS_CONTROL',
      description: 'Blocks tool invocations not explicitly whitelisted for the invoking agent role (e.g. admin shell).',
      severity: 'CRITICAL',
      enabled: true,
      enforcementAction: 'BLOCK',
      triggersToday: 41,
    },
    {
      id: 'POL-EXF-04',
      name: 'Outbound Exfiltration & Email Domain Whitelist',
      category: 'NETWORK_EGRESS',
      description: 'Prevents transmission of attachments or customer data to unapproved external email recipients.',
      severity: 'HIGH',
      enabled: true,
      enforcementAction: 'BLOCK',
      triggersToday: 28,
    },
    {
      id: 'POL-VOL-05',
      name: 'Bulk Export Volume Threshold',
      category: 'RATE_LIMITING',
      description: 'Flags queries attempting to dump more than 50 customer CRM records in a single payload.',
      severity: 'MEDIUM',
      enabled: true,
      enforcementAction: 'REVIEW',
      triggersToday: 12,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase">
            POLICY ENGINE CONFIGURATION
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
            DETERMINISTIC RULES
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Runtime Security Policies</h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure rule thresholds and enforcement actions executed inline before AI agent actions run.
        </p>
      </div>

      {/* Policy Rules Deck */}
      <div className="space-y-3">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                rule.enabled
                  ? 'bg-[#0f131c] border-[#1e2535] shadow-lg'
                  : 'bg-[#0c0e14] border-[#181d29] opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${
                    rule.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-gray-400">{rule.id}</span>
                      <span className="text-xs font-bold text-white">{rule.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">Triggers Today</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{rule.triggersToday}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                    rule.enforcementAction === 'BLOCK'
                      ? 'bg-red-500/15 text-red-400 border-red-500/40'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {rule.enforcementAction}
                  </span>

                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      rule.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
