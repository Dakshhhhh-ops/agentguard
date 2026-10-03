import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Download,
  ScrollText,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import type { SecurityEvent, Decision, Severity } from '../types';
import { DecisionBadge } from '../components/common/DecisionBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';
import { EvidenceModal } from '../components/common/EvidenceModal';

export const Audit: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents({ limit: 100 });
        setEvents(data.events || []);
      } catch (err) {
        console.error('Failed to load audit events', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    // Search query match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      ev.event_id?.toLowerCase().includes(q) ||
      ev.agent_name?.toLowerCase().includes(q) ||
      ev.tool?.toLowerCase().includes(q) ||
      JSON.stringify(ev.arguments || {}).toLowerCase().includes(q) ||
      (ev.why_blocked || []).some((r) => r.toLowerCase().includes(q));

    // Decision filter
    const matchesDecision = decisionFilter === 'ALL' || ev.decision === decisionFilter;

    // Severity filter
    const matchesSeverity = severityFilter === 'ALL' || ev.severity === severityFilter;

    return matchesSearch && matchesDecision && matchesSeverity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase">
              IMMUTABLE AUDIT TRAIL
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              TAMPER-EVIDENT
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Security Event Logs</h1>
          <p className="text-xs text-gray-400 mt-1">
            Cryptographically timestamped log of all intercepted AI-agent tool requests, policy evaluations, and enforcement decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `agentguard_audit_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#141924] hover:bg-[#1f283d] border border-[#232c3f] text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f131c] border border-[#1e2535] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Event ID, Tool, Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141924] border border-[#21293a] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Decision filter */}
          <div className="flex items-center gap-1 bg-[#141924] p-1 rounded-xl border border-[#21293a] text-xs font-mono">
            {['ALL', 'BLOCK', 'ALLOW'].map((d) => (
              <button
                key={d}
                onClick={() => setDecisionFilter(d)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  decisionFilter === d
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {d === 'ALL' ? 'All Decisions' : d}
              </button>
            ))}
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1 bg-[#141924] p-1 rounded-xl border border-[#21293a] text-xs font-mono">
            {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  severityFilter === s
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'All Severities' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Event Table */}
      <div className="rounded-2xl bg-[#0f131c] border border-[#1e2535] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2535] bg-[#121622] text-[11px] font-mono uppercase text-gray-400">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Attempted Tool</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Forensics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202f] text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 font-mono">
                    No security events matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr
                    key={ev.event_id}
                    onClick={() => setSelectedEvent(ev)}
                    className="hover:bg-[#131724] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                      {ev.event_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {typeof ev.timestamp === 'string' && ev.timestamp.includes('T')
                        ? ev.timestamp.split('T')[1].slice(0, 8)
                        : ev.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-300">
                      {ev.agent_name || ev.agent_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-cyan-400">
                      {ev.tool}
                    </td>
                    <td className="py-3.5 px-4">
                      <DecisionBadge decision={ev.decision} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskScoreGauge score={ev.risk_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={ev.severity} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className="px-2.5 py-1 rounded bg-[#1a2130] hover:bg-blue-600 text-gray-300 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#1e2535] bg-[#121622] flex items-center justify-between text-xs font-mono text-gray-400">
          <span>Showing {filteredEvents.length} of {events.length} security events</span>
          <span className="text-[11px] text-gray-500">Hash-Chained Audit Ledger Active</span>
        </div>
      </div>

      {/* Forensic Modal */}
      <EvidenceModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
