import axios from 'axios';
import type {
  DashboardStats,
  Agent,
  AgentPolicy,
  SecurityEvent,
  AuditEvent,
  Scenario,
  ToolRequest,
  EvaluationResponse,
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  async getDashboard(): Promise<DashboardStats> {
    const res = await axios.get(`${API_BASE}/dashboard`);
    return res.data;
  },

  async getAgents(): Promise<Agent[]> {
    const res = await axios.get(`${API_BASE}/agents`);
    return res.data.agents;
  },

  async getAgent(id: string): Promise<Agent> {
    const res = await axios.get(`${API_BASE}/agents/${id}`);
    return res.data;
  },

  async getPolicies(): Promise<{ agent_id: string; agent_name: string; policy: AgentPolicy }[]> {
    const res = await axios.get(`${API_BASE}/policies`);
    return res.data.policies;
  },

  async getEvents(params?: {
    limit?: number;
    agent_id?: string;
    decision?: string;
    severity?: string;
  }): Promise<{ events: SecurityEvent[]; total: number }> {
    const res = await axios.get(`${API_BASE}/events`, { params });
    return res.data;
  },

  async getEvent(id: string): Promise<SecurityEvent> {
    const res = await axios.get(`${API_BASE}/events/${id}`);
    return res.data;
  },

  async getAudit(limit = 100): Promise<{ audit_events: AuditEvent[]; total: number }> {
    const res = await axios.get(`${API_BASE}/audit`, { params: { limit } });
    return res.data;
  },

  async getScenarios(): Promise<Scenario[]> {
    const res = await axios.get(`${API_BASE}/scenarios`);
    return res.data.scenarios;
  },

  async simulateToolCall(request: ToolRequest): Promise<EvaluationResponse> {
    const res = await axios.post(`${API_BASE}/simulate`, request);
    return res.data;
  },

  async evaluateToolCall(tool_request: ToolRequest): Promise<EvaluationResponse> {
    const res = await axios.post(`${API_BASE}/evaluate-tool-call`, { tool_request });
    return res.data;
  },
};
