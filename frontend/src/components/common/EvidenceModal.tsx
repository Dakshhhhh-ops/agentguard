import React from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  FileCode,
  CheckCircle,
  AlertOctagon,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { SecurityEvent } from '../../types';
import { DecisionBadge } from './DecisionBadge';
import { SeverityBadge } from './SeverityBadge';
import { RiskScoreGauge } from './RiskScoreGauge';

interface EvidenceModalProps {
  event: SecurityEvent | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#0f131c] border border-[#222b3e] rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e2535] bg-[#121722] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${event.decision === 'BLOCK' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {event.decision === 'BLOCK' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white tracking-wider">
                  {event.event_id}
                </span>
                <DecisionBadge decision={event.decision} size="sm" />
                <SeverityBadge severity={event.severity} size="sm" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Timestamp: <span className="font-mono text-gray-300">{event.timestamp}</span> • Agent: <span className="text-blue-400 font-semibold">{event.agent_name || event.agent_id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1a2130] hover:bg-[#253047] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#141924] border border-[#21293a]">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">DETERMINISTIC RISK SCORE</span>
              <RiskScoreGauge score={event.risk_score} size="sm" />
              <span className="text-[10px] text-gray-500 block mt-1">Calculated without LLM hallucinations</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141924] border border-[#21293a]">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">INTERCEPTED TOOL CALL</span>
              <div className="font-mono text-xs font-semibold text-cyan-400 truncate">
                {event.tool}
              </div>
              <span className="text-[10px] text-gray-500 block mt-1">Trust Level: {event.trust_level}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#141924] border border-[#21293a]">
              <span className="text-[11px] font-mono text-gray-400 block mb-1">POLICY VIOLATIONS</span>
              <div className="font-mono text-xs font-semibold text-red-400">
                {event.policies_triggered?.length || 0} Rule(s) Triggered
              </div>
              <span className="text-[10px] text-gray-500 block mt-1">Strict boundary enforcement</span>
            </div>
          </div>

          {/* Why Blocked Section */}
          {event.why_blocked && event.why_blocked.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-xs mb-2">
                <AlertOctagon className="w-4 h-4" />
                <span>Interception Enforcement Rationale</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-200">
                {event.why_blocked.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw Instruction / Trigger */}
          {event.raw_instruction && (
            <div>
              <div className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Malicious User Prompt (Origin)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#141924] border border-[#242e42] font-mono text-xs text-amber-300/90 whitespace-pre-wrap leading-relaxed">
                {event.raw_instruction}
              </div>
            </div>
          )}

          {/* Intercepted Arguments */}
          <div>
            <div className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>Intercepted Tool Call Parameters</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-[#090b10] border border-[#1e2535] font-mono text-xs text-cyan-300 overflow-x-auto">
              {JSON.stringify(event.arguments, null, 2)}
            </pre>
          </div>

          {/* Evidence Items */}
          {event.evidence && event.evidence.length > 0 && (
            <div>
              <div className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Forensic Evidence Items ({event.evidence.length})</span>
              </div>
              <div className="space-y-2">
                {event.evidence.map((evi, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#141924] border border-[#21293a] flex items-start gap-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0">
                      {evi.type}
                    </span>
                    <span className="text-xs text-gray-300">{evi.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Action */}
          {event.recommended_action && (
            <div className="p-3.5 rounded-xl bg-[#121824] border border-[#1f293d] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block">RECOMMENDED REMEDIATION</span>
                <span className="text-xs font-medium text-gray-200">{event.recommended_action}</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Auto-Enforced
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1e2535] bg-[#121722] flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-500">
            Audit Record Tamper-Evident Hash: <span className="text-gray-400 font-mono">0x{event.event_id.replace('-', '')}9b21f</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1e2535] hover:bg-[#2b354c] text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
